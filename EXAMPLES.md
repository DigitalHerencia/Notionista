# Notionista Usage Examples

This document provides practical examples of using the Notionista SDK.

## Basic Setup

```typescript
import { McpClient, DATABASE_IDS } from "notionista";

// Initialize the client
const client = new McpClient({
  notionToken: process.env.NOTION_TOKEN!,
  rateLimitPerSecond: 3,
  maxRetries: 3,
  enableCache: true,
  enableLogging: true,
});

// Connect to MCP server
await client.connect();

// Always disconnect when done
process.on("beforeExit", () => client.disconnect());
```

## Working with Tasks

### Query All Active Tasks

```typescript
const activeTasks = await client.databases.queryDatabase({
  database_id: DATABASE_IDS.TASKS,
  filter: {
    property: "Done",
    checkbox: { equals: false },
  },
  sorts: [
    { property: "Priority", direction: "ascending" },
    { property: "Due", direction: "ascending" },
  ],
});

console.log(`Found ${activeTasks.results.length} active tasks`);
```

### Create a New Task

```typescript
const newTask = await client.pages.createPage({
  parent: { database_id: DATABASE_IDS.TASKS },
  properties: {
    Name: {
      title: [{ text: { content: "Complete EPIC-002" } }],
    },
    Done: {
      checkbox: false,
    },
    Priority: {
      select: { name: "High" },
    },
    Due: {
      date: { start: "2026-01-10" },
    },
  },
});

console.log(`Created task: ${newTask.id}`);
```

### Mark Task as Complete

```typescript
await client.pages.updatePage({
  page_id: taskId,
  properties: {
    Done: { checkbox: true },
  },
});
```

## Working with Projects

### Query Active Projects

```typescript
const activeProjects = await client.databases.queryDatabase({
  database_id: DATABASE_IDS.PROJECTS,
  filter: {
    property: "Status",
    select: { equals: "Active" },
  },
});
```

### Create a Sprint Project

```typescript
const sprint = await client.pages.createPage({
  parent: { database_id: DATABASE_IDS.PROJECTS },
  properties: {
    Name: {
      title: [{ text: { content: "Sprint 1 - Foundation" } }],
    },
    Status: {
      select: { name: "Active" },
    },
    Milestone: {
      select: { name: "M1" },
    },
    Phase: {
      select: { name: "P1.1" },
    },
    Domain: {
      select: { name: "ENG" },
    },
    "Start Date": {
      date: { start: "2026-01-05" },
    },
    "End Date": {
      date: { start: "2026-01-19" },
    },
  },
});
```

## Search Operations

### Search for Sprint Planning Meetings

```typescript
const meetings = await client.search.searchPages("Sprint Planning");

for (const meeting of meetings.results) {
  console.log(`Found meeting: ${meeting.id}`);
}
```

### Find All Tasks Related to a Keyword

```typescript
const results = await client.search.search({
  query: "authentication",
  filter: {
    property: "object",
    value: "page",
  },
});
```

## Working with Comments

### Add Progress Comment to Task

```typescript
await client.comments.createComment({
  parent: { page_id: taskId },
  rich_text: [
    {
      text: {
        content: "Implementation complete. Ready for review.",
      },
    },
  ],
});
```

## Advanced: Custom Middleware

### Add Timing Middleware

```typescript
import type { McpMiddleware } from "notionista";

const timingMiddleware: McpMiddleware = async (req, next) => {
  const start = Date.now();
  console.log(`→ Starting ${req.tool}`);
  
  const response = await next();
  
  const duration = Date.now() - start;
  console.log(`← Completed ${req.tool} in ${duration}ms`);
  
  return response;
};

client.use(timingMiddleware);
```

### Add Request Logging Middleware

```typescript
const requestLogger: McpMiddleware = async (req, next) => {
  console.log(`[${new Date().toISOString()}] ${req.tool}`, req.params);
  return next();
};

client.use(requestLogger);
```

## Error Handling

```typescript
import {
  McpTimeoutError,
  McpConnectionError,
  RateLimitError,
  JsonRpcError,
} from "notionista";

try {
  const result = await client.databases.queryDatabase({
    database_id: DATABASE_IDS.TASKS,
  });
} catch (error) {
  if (error instanceof McpTimeoutError) {
    console.error("Request timed out");
  } else if (error instanceof McpConnectionError) {
    console.error("Failed to connect to MCP server");
  } else if (error instanceof RateLimitError) {
    console.error("Rate limit exceeded, backing off...");
  } else if (error instanceof JsonRpcError) {
    console.error("JSON-RPC error:", error.message);
  } else {
    console.error("Unknown error:", error);
  }
}
```

## Pagination

### Query Large Databases

```typescript
let hasMore = true;
let cursor: string | undefined;
const allPages = [];

while (hasMore) {
  const result = await client.databases.queryDatabase({
    database_id: DATABASE_IDS.TASKS,
    page_size: 100,
    start_cursor: cursor,
  });
  
  allPages.push(...result.results);
  hasMore = result.has_more;
  cursor = result.next_cursor ?? undefined;
}

console.log(`Total pages: ${allPages.length}`);
```

## Configuration Options

### Production Configuration

```typescript
const client = new McpClient({
  notionToken: process.env.NOTION_TOKEN!,
  
  // Increase timeout for complex queries
  timeout: 60000, // 60 seconds
  
  // More aggressive retries
  maxRetries: 5,
  
  // Respect API limits
  rateLimitPerSecond: 2,
  
  // Enable caching for better performance
  enableCache: true,
  
  // Disable logging in production
  enableLogging: false,
});
```

### Development Configuration

```typescript
const client = new McpClient({
  notionToken: process.env.NOTION_TOKEN!,
  
  // Quick timeouts for fast feedback
  timeout: 10000,
  
  // Few retries to fail fast
  maxRetries: 1,
  
  // No rate limiting for local dev
  rateLimitPerSecond: 10,
  
  // Disable cache to always get fresh data
  enableCache: false,
  
  // Enable verbose logging
  enableLogging: true,
});
```
