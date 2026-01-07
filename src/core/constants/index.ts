/**
 * MCP configuration constants
 *
 * NOTE: Runtime concerns like retries, rate limiting, and timeouts are handled
 * by the VS Code MCP client, not by this SDK. These constants are retained for
 * documentation purposes and to inform constraint metadata.
 *
 * For constraint metadata used in Copilot reasoning, see:
 * @see {DEFAULT_MCP_CONSTRAINTS} in src/core/types/constraints.ts
 */

export const MCP_DEFAULTS = {
  /**
   * Request timeout in milliseconds
   * @handledBy 'vscode-mcp-client'
   */
  TIMEOUT: 30000, // 30 seconds
} as const;

/**
 * Database IDs
 */
export { DATABASE_IDS } from './databases.js';

/**
 * Notion API constants
 *
 * These are informational constraints about the Notion API.
 * Actual enforcement is handled by the Notion API and VS Code MCP client.
 */

export const NOTION_LIMITS = {
  /**
   * Maximum page size for paginated queries
   * @handledBy 'notion-api'
   */
  MAX_PAGE_SIZE: 100,

  /**
   * Recommended maximum batch size for bulk operations
   * This is guidance for Copilot, not enforced by the SDK
   * @handledBy 'copilot-agent'
   */
  MAX_BATCH_SIZE: 50,
} as const;

/**
 * NOTE: MCP server runtime is provided by VS Code.
 * This SDK does not spawn or manage MCP server processes.
 * MCP connectivity is assumed to be handled by the host environment.
 */

export const JSON_RPC_VERSION = '2.0';

export const JSON_RPC_ERROR_CODES = {
  PARSE_ERROR: -32700,
  INVALID_REQUEST: -32600,
  METHOD_NOT_FOUND: -32601,
  INVALID_PARAMS: -32602,
  INTERNAL_ERROR: -32603,
} as const;
