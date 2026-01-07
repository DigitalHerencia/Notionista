/**
 * Tool wrappers exports
 *
 * @deprecated These tool wrappers contain execution-oriented logic that should not be used.
 *
 * The Notionista SDK is now a declarative control layer that describes operation intents,
 * not executes them. These classes attempted to execute MCP operations directly, which
 * violates the architectural principle that VS Code owns MCP runtime execution.
 *
 * For declarative MCP operation intents, use the McpClient interface and McpOperationIntent type.
 *
 * These files are retained only for reference and will be removed in a future release.
 */

// Deprecated - do not use
export * from './databases.js';
export * from './pages.js';
export * from './blocks.js';
export * from './search.js';
export * from './comments.js';
export * from './users.js';
