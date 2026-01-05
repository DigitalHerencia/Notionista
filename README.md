# Notionista

TypeScript SDK for advanced Notion workspace automation via Model Context Protocol (MCP).

## Overview

Notionista provides a type-safe, middleware-based client for interacting with Notion databases through the [@notionhq/notion-mcp-server](https://github.com/notionhq/notion-mcp-server). Built for the Digital Herencia workspace structure, it implements the **Propose → Approve → Apply** safety workflow for controlled automation.

## Features

- 🔌 **MCP Integration**: Communicates with Notion MCP server via stdio transport
- 🛡️ **Type Safety**: Full TypeScript support with strict typing
- 🔄 **Middleware Pipeline**: Rate limiting, retry logic, caching, and logging
- ⚡ **Performance**: Configurable rate limiting (3 req/sec default) and response caching
- 🎯 **Domain Model**: Repository pattern for clean data access
- 🔒 **Safety Layer**: Proposal-based mutations for preventing accidents (coming in EPIC-005)

## Installation

```bash
npm install notionista
```

## Quick Start

```typescript
import { McpClient } from "notionista";

// Create a client instance
const client = new McpClient({
  notionToken: process.env.NOTION_TOKEN!,
  rateLimitPerSecond: 3,
  maxRetries: 3,
  enableCache: true,
  enableLogging: true,
});

// Connect to the MCP server
await client.connect();

// Call a tool
const databases = await client.callTool("query-data-source", {
  database_id: "your-database-id",
});

// Disconnect when done
await client.disconnect();
```

## Architecture

### MCP Client Layer (EPIC-002) ✅

The foundation of Notionista, implementing reliable communication with the Notion MCP server:

- **Stdio Transport**: Spawns and manages the MCP server process
- **JSON-RPC 2.0**: Handles message serialization and correlation
- **Middleware Pipeline**:
  - Rate Limiter: Prevents API throttling (configurable)
  - Retry: Automatic retries with exponential backoff
  - Logger: Debug logging for requests and responses
  - Cache: Response caching for read-only operations

### Core Types

```typescript
import {
  DATABASE_IDS,
  ProjectStatus,
  Milestone,
  Phase,
  Domain,
  Priority,
  MeetingType,
  Cadence,
} from "notionista";
```

### Error Handling

```typescript
import {
  NotionistaError,
  McpTransportError,
  McpConnectionError,
  McpTimeoutError,
  JsonRpcError,
  McpToolError,
  RateLimitError,
} from "notionista";

try {
  await client.callTool("some-tool", params);
} catch (error) {
  if (error instanceof McpTimeoutError) {
    console.error("Request timed out");
  } else if (error instanceof RateLimitError) {
    console.error("Rate limit exceeded");
  }
}
```

## Configuration

### Client Options

```typescript
interface McpClientOptions {
  notionToken: string; // Required: Notion API token
  timeout?: number; // Default: 30000ms
  maxRetries?: number; // Default: 3
  rateLimitPerSecond?: number; // Default: 3
  enableCache?: boolean; // Default: true
  enableLogging?: boolean; // Default: true
}
```

### Custom Middleware

```typescript
import type { McpMiddleware } from "notionista";

const customMiddleware: McpMiddleware = async (req, next) => {
  console.log(`Calling tool: ${req.tool}`);
  const response = await next();
  console.log(`Tool completed in ${response.duration}ms`);
  return response;
};

client.use(customMiddleware);
```

## Digital Herencia Workspace

This SDK is optimized for the Digital Herencia workspace structure:

### Core Databases

| Database     | ID                                     |
| ------------ | -------------------------------------- |
| Teams        | `2d5a4e63-bf23-816b-9f75-000b219f7713` |
| Projects     | `2d5a4e63-bf23-8115-a70f-000bc1ef9d05` |
| Tasks        | `2d5a4e63-bf23-8137-8277-000b41c867c3` |
| Meetings     | `2caa4e63-bf23-815a-8981-000bbdbb7f0b` |
| Prompts      | `2d5a4e63-bf23-81ad-ab3f-000bfbb91ed9` |
| Tech Stack   | `276a4e63-bf23-80e2-bbae-000b2fa9662a` |
| Templates    | `2d5a4e63-bf23-8189-943d-000bdd7af066` |
| SOPs         | `2d8a4e63-bf23-80d1-8167-000bb402c275` |
| Calendar     | `2d5a4e63-bf23-8140-b0d7-000b33493b7e` |

## Development Status

### Completed ✅

- **EPIC-001**: Project Foundation
  - TypeScript configuration
  - Build tooling (tsup)
  - Testing framework (Vitest)
  - Linting (ESLint + Prettier)
  - Core type system
  - Error hierarchy

- **EPIC-002**: MCP Client Layer
  - Stdio transport
  - MCP client with middleware
  - Rate limiter middleware
  - Retry middleware
  - Logger middleware
  - Cache middleware

### In Progress 🚧

- **EPIC-003**: Domain Layer (repositories and entities)
- **EPIC-004**: Query Builder
- **EPIC-005**: Safety Layer (Propose → Approve → Apply)

### Planned 📋

- **EPIC-006**: Workflow Orchestration
- **EPIC-007**: Snapshot & Sync
- **EPIC-008**: Documentation & Examples

## Contributing

This project follows the architecture defined in [SPEC.md](./SPEC.md). See the [issues](./github/issues/notionista-sdk-issues.md) for the full task breakdown.

## License

MIT

## Related

- [@notionhq/notion-mcp-server](https://github.com/notionhq/notion-mcp-server) - Official Notion MCP server
- [Model Context Protocol](https://modelcontextprotocol.io/) - MCP specification
