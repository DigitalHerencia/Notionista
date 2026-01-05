/**
 * Stdio transport for communicating with @notionhq/notion-mcp-server
 * 
 * Spawns the MCP server as a child process and handles JSON-RPC message exchange
 * via stdio (stdin/stdout).
 */

import { spawn, type ChildProcess } from "child_process";
import { EventEmitter } from "events";
import type { JsonRpcRequest, JsonRpcResponse, McpTransport } from "../core/types/mcp.js";
import { McpTransportError, McpConnectionError } from "../core/errors/index.js";
import { MCP_SERVER } from "../core/constants/index.js";

export interface StdioTransportOptions {
  notionToken: string;
  serverCommand?: string;
  serverArgs?: string[];
}

export class StdioTransport extends EventEmitter implements McpTransport {
  private process: ChildProcess | null = null;
  private connected = false;
  private buffer = "";
  private pendingRequests = new Map<
    number | string,
    {
      resolve: (response: JsonRpcResponse) => void;
      reject: (error: Error) => void;
    }
  >();

  constructor(private readonly options: StdioTransportOptions) {
    super();
  }

  /**
   * Connect to the MCP server by spawning the child process
   */
  connect(): Promise<void> {
    if (this.connected) {
      return Promise.resolve();
    }

    const command = this.options.serverCommand ?? MCP_SERVER.COMMAND;
    const args = this.options.serverArgs ?? MCP_SERVER.ARGS;

    try {
      this.process = spawn(command, args, {
        env: {
          ...process.env,
          NOTION_TOKEN: this.options.notionToken,
        },
        stdio: ["pipe", "pipe", "inherit"],
      });

      this.setupProcessHandlers();
      this.connected = true;
      this.emit("connected");
      return Promise.resolve();
    } catch (error) {
      throw new McpConnectionError("Failed to spawn MCP server process", error);
    }
  }

  /**
   * Disconnect from the MCP server
   */
  async disconnect(): Promise<void> {
    if (!this.connected || !this.process) {
      return;
    }

    return new Promise((resolve) => {
      if (!this.process) {
        resolve();
        return;
      }

      this.process.once("close", () => {
        this.connected = false;
        this.process = null;
        this.emit("disconnected");
        resolve();
      });

      this.process.kill("SIGTERM");

      // Force kill after 5 seconds
      setTimeout(() => {
        if (this.process) {
          this.process.kill("SIGKILL");
        }
      }, 5000);
    });
  }

  /**
   * Send a JSON-RPC request and wait for the response
   */
  async send(request: JsonRpcRequest): Promise<JsonRpcResponse> {
    if (!this.connected || !this.process || !this.process.stdin) {
      throw new McpTransportError("Transport not connected");
    }

    return new Promise((resolve, reject) => {
      // Store the pending request
      this.pendingRequests.set(request.id, { resolve, reject });

      // Serialize and send the request
      const message = JSON.stringify(request) + "\n";
      this.process!.stdin!.write(message, (error) => {
        if (error) {
          this.pendingRequests.delete(request.id);
          reject(new McpTransportError("Failed to write to stdin", error));
        }
      });
    });
  }

  /**
   * Check if transport is connected
   */
  isConnected(): boolean {
    return this.connected;
  }

  /**
   * Set up event handlers for the child process
   */
  private setupProcessHandlers(): void {
    if (!this.process) return;

    // Handle stdout data (JSON-RPC responses)
    this.process.stdout?.on("data", (data: Buffer) => {
      this.handleStdout(data);
    });

    // Handle process errors
    this.process.on("error", (error) => {
      this.emit("error", new McpTransportError("Process error", error));
    });

    // Handle process exit
    this.process.on("close", (code, signal) => {
      this.connected = false;
      this.emit("close", { code, signal });

      // Reject all pending requests
      for (const { reject } of this.pendingRequests.values()) {
        reject(new McpTransportError("Process closed unexpectedly"));
      }
      this.pendingRequests.clear();
    });
  }

  /**
   * Handle stdout data from the child process
   * 
   * Messages are newline-delimited JSON-RPC responses.
   * We need to handle partial messages across multiple data events.
   */
  private handleStdout(data: Buffer): void {
    this.buffer += data.toString();

    // Split by newlines
    const lines = this.buffer.split("\n");

    // Keep the last incomplete line in the buffer
    this.buffer = lines.pop() ?? "";

    // Process complete lines
    for (const line of lines) {
      if (line.trim()) {
        try {
          const response = JSON.parse(line) as JsonRpcResponse;
          this.handleResponse(response);
        } catch (error) {
          this.emit("error", new McpTransportError("Failed to parse JSON-RPC response", error));
        }
      }
    }
  }

  /**
   * Handle a parsed JSON-RPC response
   */
  private handleResponse(response: JsonRpcResponse): void {
    const pending = this.pendingRequests.get(response.id);

    if (!pending) {
      this.emit("error", new McpTransportError(`No pending request for response ID: ${response.id}`));
      return;
    }

    this.pendingRequests.delete(response.id);
    pending.resolve(response);
  }
}
