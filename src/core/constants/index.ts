/**
 * MCP configuration constants
 */

export const MCP_DEFAULTS = {
  TIMEOUT: 30000, // 30 seconds
  MAX_RETRIES: 3,
  RATE_LIMIT_PER_SECOND: 3,
  RETRY_BACKOFF_BASE: 1000, // 1 second
  RETRY_BACKOFF_MAX: 10000, // 10 seconds
} as const;

/**
 * Notion API constants
 */

export const NOTION_LIMITS = {
  MAX_PAGE_SIZE: 100,
  MAX_BATCH_SIZE: 50,
} as const;

/**
 * MCP server configuration
 */
export const MCP_SERVER = {
  COMMAND: "npx",
  ARGS: ["-y", "@notionhq/notion-mcp-server"],
  PACKAGE: "@notionhq/notion-mcp-server",
} as const;

export const JSON_RPC_VERSION = "2.0";

export const JSON_RPC_ERROR_CODES = {
  PARSE_ERROR: -32700,
  INVALID_REQUEST: -32600,
  METHOD_NOT_FOUND: -32601,
  INVALID_PARAMS: -32602,
  INTERNAL_ERROR: -32603,
} as const;
