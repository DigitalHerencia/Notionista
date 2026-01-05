/**
 * MCP Client
 * 
 * Main interface for invoking MCP tools with middleware support.
 */

import type {
  JsonRpcRequest,
  JsonRpcResponse,
  McpClientOptions,
  McpMiddleware,
  McpRequest,
  McpResponse,
} from "../core/types/mcp.js";
import { StdioTransport } from "./transport.js";
import { McpTimeoutError, McpToolError, JsonRpcError } from "../core/errors/index.js";
import { MCP_DEFAULTS, JSON_RPC_VERSION } from "../core/constants/index.js";
import {
  createRateLimiter,
  createRetryMiddleware,
  createLoggerMiddleware,
  createCacheMiddleware,
} from "./middleware/index.js";
import {
  DatabaseTools,
  PageTools,
  BlockTools,
  SearchTools,
  CommentTools,
  UserTools,
} from "./tools/index.js";

export class McpClient {
  private transport: StdioTransport;
  private middlewares: McpMiddleware[] = [];
  private requestId = 0;
  private readonly timeout: number;

  // Tool wrappers
  public readonly databases: DatabaseTools;
  public readonly pages: PageTools;
  public readonly blocks: BlockTools;
  public readonly search: SearchTools;
  public readonly comments: CommentTools;
  public readonly users: UserTools;

  constructor(private readonly options: McpClientOptions) {
    this.timeout = options.timeout ?? MCP_DEFAULTS.TIMEOUT;

    // Initialize transport
    this.transport = new StdioTransport({
      notionToken: options.notionToken,
    });

    // Initialize tool wrappers
    this.databases = new DatabaseTools(this);
    this.pages = new PageTools(this);
    this.blocks = new BlockTools(this);
    this.search = new SearchTools(this);
    this.comments = new CommentTools(this);
    this.users = new UserTools(this);

    // Set up default middleware pipeline
    this.setupDefaultMiddleware();
  }

  /**
   * Set up default middleware stack
   */
  private setupDefaultMiddleware(): void {
    // Rate limiter (first to prevent overwhelming the server)
    const rateLimit = this.options.rateLimitPerSecond ?? MCP_DEFAULTS.RATE_LIMIT_PER_SECOND;
    this.use(createRateLimiter({ requestsPerSecond: rateLimit }));

    // Retry middleware (for transient failures)
    const maxRetries = this.options.maxRetries ?? MCP_DEFAULTS.MAX_RETRIES;
    this.use(createRetryMiddleware({ maxRetries }));

    // Logger middleware (for debugging)
    if (this.options.enableLogging !== false) {
      this.use(createLoggerMiddleware());
    }

    // Cache middleware (for read-only operations)
    if (this.options.enableCache !== false) {
      this.use(createCacheMiddleware());
    }
  }

  /**
   * Add a middleware to the pipeline
   */
  use(middleware: McpMiddleware): this {
    this.middlewares.push(middleware);
    return this;
  }

  /**
   * Connect to the MCP server
   */
  async connect(): Promise<void> {
    await this.transport.connect();
  }

  /**
   * Disconnect from the MCP server
   */
  async disconnect(): Promise<void> {
    await this.transport.disconnect();
  }

  /**
   * Check if client is connected
   */
  isConnected(): boolean {
    return this.transport.isConnected();
  }

  /**
   * Call an MCP tool
   */
  async callTool<T = unknown>(tool: string, params: Record<string, unknown> = {}): Promise<T> {
    const request: McpRequest = {
      tool,
      params,
      timestamp: Date.now(),
    };

    // Build middleware chain
    const chain = this.buildMiddlewareChain(request);

    // Execute the chain
    const response = await chain();

    return response.data as T;
  }

  /**
   * Build the middleware chain with the final executor
   */
  private buildMiddlewareChain(request: McpRequest): () => Promise<McpResponse> {
    // Final executor that calls the transport
    const executor = async (): Promise<McpResponse> => {
      const startTime = Date.now();
      const result = await this.executeRequest(request);
      const endTime = Date.now();

      return {
        data: result,
        timestamp: endTime,
        duration: endTime - startTime,
      };
    };

    // Build chain from right to left
    return this.middlewares.reduceRight<() => Promise<McpResponse>>(
      (next, middleware) => () => middleware(request, next),
      executor
    );
  }

  /**
   * Execute the actual request via transport
   */
  private async executeRequest(request: McpRequest): Promise<unknown> {
    const rpcRequest: JsonRpcRequest = {
      jsonrpc: JSON_RPC_VERSION,
      id: ++this.requestId,
      method: "tools/call",
      params: {
        name: request.tool,
        arguments: request.params,
      },
    };

    // Create timeout promise with cleanup
    let timeoutHandle: NodeJS.Timeout;
    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutHandle = setTimeout(() => {
        reject(new McpTimeoutError(`Request timed out for tool: ${request.tool}`, this.timeout));
      }, this.timeout);
    });

    try {
      // Race between request and timeout
      const response = await Promise.race<JsonRpcResponse>([
        this.transport.send(rpcRequest),
        timeoutPromise,
      ]);

      // Handle JSON-RPC errors
      if (response.error) {
        throw new JsonRpcError(
          response.error.message,
          response.error.code,
          response.error.data
        );
      }

      // Handle tool errors
      const result = response.result as { content?: unknown; isError?: boolean } | undefined;
      if (result?.isError) {
        throw new McpToolError(
          `Tool execution failed: ${request.tool}`,
          request.tool,
          result.content
        );
      }

      return result?.content;
    } finally {
      // Clean up timeout
      clearTimeout(timeoutHandle!);
    }
  }
}
