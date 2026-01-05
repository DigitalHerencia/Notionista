# Query Builder Integration Guide

This guide shows how to integrate the QueryBuilder into your Notion MCP workflows.

## Installation

Since the project is in early development, you'll use the query builder directly from the source:

```typescript
import { QueryBuilder, QueryBuilderHelpers } from "./src/query";
```

## Integration with MCP Client

When the MCP client layer is implemented (EPIC-002), you'll use the QueryBuilder with it:

```typescript
import { McpClient } from "./src/mcp/client";
import { QueryBuilder } from "./src/query";

const client = new McpClient({ notionToken: process.env.NOTION_TOKEN });
await client.connect();

// Build a query
const query = new QueryBuilder()
  .where("status", "select", "equals", "Active")
  .where("priority", "select", "equals", "High")
  .orderBy("due", "ascending")
  .limit(50)
  .build();

// Use with MCP client
const results = await client.queryDatabase("database_id", query);
```

## Common Workflow Patterns

### 1. Sprint Planning Query

```typescript
import { QueryBuilder } from "./src/query";

// Find all active projects in current milestone
const sprintQuery = new QueryBuilder()
  .where("status", "select", "equals", "Active")
  .where("milestone", "select", "equals", "M2")
  .where("phase", "select", "equals", "P2.1")
  .orderBy("startDate", "descending")
  .build();
```

### 2. Daily Standup Query

```typescript
import { QueryBuilderHelpers } from "./src/query";

// Find incomplete high-priority tasks due soon
const standupQuery = QueryBuilderHelpers.tasksDueSoon(3)
  .where("priority", "select", "equals", "High")
  .orderBy("due", "ascending")
  .build();
```

## Related Documentation

- [Query Builder README](../src/query/README.md) - Complete API documentation
- [Query Builder Examples](../src/query/examples.ts) - Usage examples
- [SPEC.md](../SPEC.md) - Full architecture documentation
