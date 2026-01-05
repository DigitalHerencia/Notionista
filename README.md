# Notionista

Type-safe Notion MCP SDK with fluent query builder for advanced workspace automation.

## Status

🚧 **Early Development** - Query Builder (EPIC-004) Complete ✅

## Features

### ✅ Query Builder (EPIC-004)

Fluent API for constructing type-safe Notion database queries with filters, sorts, and pagination.

```typescript
import { QueryBuilder, QueryBuilderHelpers } from "./src/query";

// Simple query
const query = new QueryBuilder()
  .where("status", "select", "equals", "Active")
  .where("priority", "select", "equals", "High")
  .orderBy("due", "ascending")
  .limit(50)
  .build();

// Using helpers
const incompleteTasks = QueryBuilderHelpers.incompleteTasks()
  .orderBy("due", "ascending")
  .build();

// Complex nested query
const complexQuery = new QueryBuilder()
  .and(qb => {
    qb.where("status", "select", "equals", "Active")
      .where("milestone", "select", "equals", "M2")
  })
  .or(qb => {
    qb.where("priority", "select", "equals", "High")
      .where("priority", "select", "equals", "Critical")
  })
  .build();
```

**Features:**
- ✅ Fluent API for building queries
- ✅ All Notion filter operators (40+ operators)
- ✅ Compound filters (AND/OR)
- ✅ Pagination with cursors
- ✅ Convenience methods for common patterns

**Documentation:**
- [Query Builder README](src/query/README.md) - Complete API reference
- [Integration Guide](docs/QUERY_BUILDER_INTEGRATION.md) - How to use with MCP/repositories
- [Examples](src/query/examples.ts) - 22 usage examples
- [Implementation Summary](EPIC-004-SUMMARY.md) - Technical details

## Roadmap

### Completed
- ✅ **EPIC-004**: Query Builder with fluent API

### In Progress
- 🔄 **EPIC-001**: Project Foundation (minimal foundation created)

### Planned
- ⏳ **EPIC-002**: MCP Client Layer (stdio transport, tool wrappers)
- ⏳ **EPIC-003**: Domain Layer (repositories, entities)
- ⏳ **EPIC-005**: Safety Layer (propose → approve → apply)
- ⏳ **EPIC-006**: Workflow Orchestration (sprint cycles, analytics)
- ⏳ **EPIC-007**: Snapshot & Sync (CSV parsing, drift detection)
- ⏳ **EPIC-008**: Documentation & Polish

See [SPEC.md](SPEC.md) for complete architecture details.

## Project Structure

```
notionista/
├── src/
│   ├── core/
│   │   └── types/
│   │       └── notion-filters.ts    # Notion API type definitions
│   ├── query/
│   │   ├── builder.ts               # QueryBuilder implementation
│   │   ├── index.ts                 # Module exports
│   │   ├── README.md                # API documentation
│   │   ├── builder.test.ts          # Test suite
│   │   └── examples.ts              # Usage examples
│   └── index.ts                     # Main SDK entry point
├── docs/
│   └── QUERY_BUILDER_INTEGRATION.md # Integration guide
├── schemas.ts                       # Zod schemas (Team, Project, Task, Meeting)
├── SPEC.md                          # Architecture specification
└── EPIC-004-SUMMARY.md              # Query Builder summary
```

## Quick Start

### Prerequisites

- Node.js 20+
- TypeScript 5+

### Usage

Since the project is in early development, import directly from source:

```typescript
import { QueryBuilder, QueryBuilderHelpers } from "./src/query";

// Build a query
const query = new QueryBuilder()
  .where("status", "select", "equals", "Active")
  .build();

// Use with Notion API
const response = await notion.databases.query({
  database_id: "your-database-id",
  ...query,
});
```

## Digital Herencia Workspace

This SDK is designed for the Digital Herencia workspace with predefined:
- 6 Teams (Engineering, Design, Marketing, Operations, Product, Research)
- Projects with 2-week sprint cycles
- Tasks with priority and milestone tracking
- Meeting types (Standup, Sprint Planning, Post-mortem, Team Sync)

See [copilot-instructions.md](.github/copilot-instructions.md) for workspace structure details.

## Development

This project follows a phased development approach with 8 epics. See [issues/notionista-sdk-issues.md](.github/issues/notionista-sdk-issues.md) for all task definitions.

## License

[License information to be added]

## Contributing

[Contribution guidelines to be added]
