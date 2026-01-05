/**
 * Notionista - TypeScript SDK for Notion Workspace Automation via MCP
 * 
 * @module notionista
 */

// Core exports
export * from "./core/types/index.js";
export * from "./core/errors/index.js";
export * from "./core/constants/index.js";

// MCP client exports
export { McpClient } from "./mcp/client.js";
export { StdioTransport } from "./mcp/transport.js";
export type { StdioTransportOptions } from "./mcp/transport.js";

// Middleware exports
export * from "./mcp/middleware/index.js";

// Tool wrapper exports
export * from "./mcp/tools/index.js";

// Domain exports (placeholders for future epics)
export * from "./domain/entities/index.js";
export * from "./domain/repositories/index.js";

// Safety layer exports (placeholder for EPIC-005)
export * from "./safety/proposal.js";

// Workflows exports (placeholder for EPIC-006)
export * from "./workflows/index.js";
