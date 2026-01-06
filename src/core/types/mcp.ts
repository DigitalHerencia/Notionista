/**
 * JSON-RPC 2.0 protocol types for MCP communication
 */

export interface JsonRpcRequest {
  jsonrpc: '2.0';
  id: number | string;
  method: string;
  params?: unknown;
}

export interface JsonRpcResponse<T = unknown> {
  jsonrpc: '2.0';
  id: number | string;
  result?: T;
  error?: JsonRpcErrorObject;
}

export interface JsonRpcErrorObject {
  code: number;
  message: string;
  data?: unknown;
}

/**
 * MCP Tool invocation types
 */

export interface McpToolCall {
  name: string;
  arguments: Record<string, unknown>;
}

export interface McpToolResult<T = unknown> {
  content: T;
  isError?: boolean;
}

/**
 * MCP Request/Response wrapper types
 */

export interface McpRequest {
  tool: string;
  params: Record<string, unknown>;
  timestamp: number;
}

export interface McpResponse<T = unknown> {
  data: T;
  timestamp: number;
  duration: number;
}

/**
 * MCP Middleware types
 */

export type McpMiddleware = (
  req: McpRequest,
  next: () => Promise<McpResponse>
) => Promise<McpResponse>;

/**
 * MCP Client configuration
 */

export interface McpClientOptions {
  notionToken: string;
  timeout?: number;
  maxRetries?: number;
  rateLimitPerSecond?: number;
  enableCache?: boolean;
  enableLogging?: boolean;
}

/**
 * MCP Transport interface
 */

export interface McpTransport {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  send(request: JsonRpcRequest): Promise<JsonRpcResponse>;
  isConnected(): boolean;
}
