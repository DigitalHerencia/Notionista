/**
 * MCP (Model Context Protocol) type definitions
 *
 * @module core/types/mcp
 */

/**
 * JSON-RPC 2.0 request
 */
export interface JsonRpcRequest {
  jsonrpc: '2.0';
  id: string | number;
  method: string;
  params?: Record<string, unknown>;
}

/**
 * JSON-RPC 2.0 response
 */
export interface JsonRpcResponse<T = unknown> {
  jsonrpc: '2.0';
  id: string | number;
  result?: T;
  error?: JsonRpcError;
}

/**
 * JSON-RPC 2.0 error
 */
export interface JsonRpcError {
  code: number;
  message: string;
  data?: unknown;
}

/**
 * MCP tool names
 */
export const MCP_TOOLS = {
  // Data sources (databases)
  LIST_DATA_SOURCE_TEMPLATES: 'list-data-source-templates',
  RETRIEVE_DATA_SOURCE: 'retrieve-a-data-source',
  CREATE_DATA_SOURCE: 'create-a-data-source',
  UPDATE_DATA_SOURCE: 'update-a-data-source',
  QUERY_DATA_SOURCE: 'query-data-source',

  // Pages
  POST_PAGE: 'post-page',
  PATCH_PAGE: 'patch-page',
  RETRIEVE_PAGE: 'retrieve-a-page',
  MOVE_PAGE: 'move-page',

  // Blocks
  GET_BLOCK_CHILDREN: 'get-block-children',
  RETRIEVE_BLOCK: 'retrieve-a-block',
  PATCH_BLOCK_CHILDREN: 'patch-block-children',
  UPDATE_BLOCK: 'update-a-block',
  DELETE_BLOCK: 'delete-a-block',

  // Comments
  CREATE_COMMENT: 'create-a-comment',
  RETRIEVE_COMMENT: 'retrieve-a-comment',

  // Search
  POST_SEARCH: 'post-search',

  // Users
  GET_SELF: 'get-self',
  GET_USER: 'get-user',
  GET_USERS: 'get-users',
} as const;

/**
 * MCP tool name type
 */
export type McpTool = (typeof MCP_TOOLS)[keyof typeof MCP_TOOLS];

/**
 * MCP request wrapper
 */
export interface McpRequest {
  tool: McpTool;
  params: Record<string, unknown>;
  timestamp: number;
}

/**
 * MCP response wrapper
 */
export interface McpResponse<T = unknown> {
  data: T;
  timestamp: number;
}

/**
 * MCP client configuration
 */
export interface McpClientConfig {
  notionToken: string;
  timeout?: number;
  maxRetries?: number;
  rateLimitPerSecond?: number;
}
