# Notionista

> TypeScript SDK for advanced Notion workspace automation with MCP integration

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20%2B-green)](https://nodejs.org/)
[![pnpm](https://img.shields.io/badge/pnpm-10.x-orange)](https://pnpm.io/)

Notionista is a TypeScript SDK designed for the Digital Herencia workspace, providing a type-safe, robust interface for automating Notion workflows through the Model Context Protocol (MCP).

## Features

- 🔒 **Type-Safe**: Strict TypeScript configuration with full IntelliSense support
- 🎯 **MCP Integration**: Built-in support for @notionhq/notion-mcp-server
- ✅ **Runtime Validation**: Zod schemas for data validation
- 🔄 **Safety Workflow**: Propose → Approve → Apply pattern for mutations
- 📦 **Modern Build**: ESM and CJS outputs with tsup
- 🧪 **Well Tested**: Comprehensive test coverage with Vitest
- 📝 **Documented**: JSDoc comments throughout

## Installation

```bash
# Using pnpm (recommended)
pnpm add notionista

# Using npm
npm install notionista

# Using yarn
yarn add notionista
```

## Requirements

- Node.js 20.0.0 or higher
- TypeScript 5.0 or higher (for development)

## Quick Start

```typescript
import { DATABASE_IDS, TeamSchema } from 'notionista';

// Use database IDs
console.log(DATABASE_IDS.TEAMS);

// Validate data with schemas
const team = TeamSchema.parse({
  id: 'team-123',
  name: 'Engineering Team',
  meetings: [],
  projects: [],
  tasks: [],
});
```

## Project Structure

```
notionista/
├── src/
│   ├── core/
│   │   ├── types/         # TypeScript type definitions
│   │   ├── errors/        # Custom error hierarchy
│   │   └── config/        # Configuration system
│   ├── schemas/           # Zod schemas for validation
│   ├── mcp/              # MCP client layer (coming soon)
│   ├── domain/           # Domain entities and repositories (coming soon)
│   └── workflows/        # Workflow orchestration (coming soon)
├── config/
│   └── databases.json    # Database configuration
└── dist/                 # Build output
```

## Available Types

### Database IDs

```typescript
import { DATABASE_IDS } from 'notionista';

DATABASE_IDS.TEAMS
DATABASE_IDS.PROJECTS
DATABASE_IDS.TASKS
DATABASE_IDS.MEETINGS
DATABASE_IDS.PROMPTS
DATABASE_IDS.TECH_STACK
DATABASE_IDS.TEMPLATES
DATABASE_IDS.SOPS
DATABASE_IDS.CALENDAR
```

### Property Types

```typescript
import type {
  ProjectStatus,
  Milestone,
  Phase,
  Domain,
  Priority,
  MeetingType,
  Cadence,
} from 'notionista';
```

### Schemas

```typescript
import { TeamSchema, ProjectSchema, TaskSchema, MeetingSchema } from 'notionista';
```

### Errors

```typescript
import {
  NotionError,
  ValidationError,
  McpError,
  TransportError,
  TimeoutError,
  RateLimitError,
  ConfigurationError,
  NotFoundError,
  ProposalError,
} from 'notionista';
```

## Development

### Setup

```bash
# Install dependencies
pnpm install

# Build the project
pnpm build

# Run tests
pnpm test

# Run linter
pnpm lint

# Type check
pnpm typecheck
```

### Scripts

- `pnpm build` - Build the project with tsup
- `pnpm dev` - Watch mode for development
- `pnpm test` - Run tests with Vitest
- `pnpm test:watch` - Run tests in watch mode
- `pnpm test:coverage` - Generate coverage report
- `pnpm lint` - Run ESLint
- `pnpm lint:fix` - Fix linting issues
- `pnpm format` - Format code with Prettier
- `pnpm format:check` - Check code formatting
- `pnpm typecheck` - Run TypeScript type checking
- `pnpm clean` - Clean build artifacts

## Architecture

Notionista follows a layered architecture:

1. **Core Layer**: Type definitions, errors, and configuration
2. **MCP Layer**: Communication with Notion MCP server (coming soon)
3. **Domain Layer**: Business entities and repositories (coming soon)
4. **Workflow Layer**: High-level automation workflows (coming soon)
5. **Safety Layer**: Change proposals and validation (coming soon)

## Configuration

Database configuration is stored in `config/databases.json`:

```json
{
  "databases": {
    "teams": {
      "id": "2d5a4e63-bf23-8151-9b98-c81833668844",
      "name": "Teams",
      "url": "https://www.notion.so/..."
    }
  },
  "safetyLimits": {
    "maxBatchSize": 50,
    "rateLimitPerSecond": 3,
    "requireApprovalForBulk": true
  }
}
```

## Roadmap

### ✅ Phase 1: Foundation (M1) - COMPLETED
- [x] TypeScript project setup
- [x] Core type system
- [x] Error hierarchy
- [x] Database configuration

### 🚧 Phase 2: MCP Client (M1) - IN PROGRESS
- [ ] stdio transport
- [ ] MCP client with middleware
- [ ] Rate limiting and retry logic
- [ ] Tool wrappers

### 📋 Phase 3: Domain Layer (M2)
- [ ] Base repository pattern
- [ ] Team, Project, Task, Meeting repositories
- [ ] Domain entities

### 📋 Phase 4: Safety & Workflows (M2-M3)
- [ ] Proposal manager
- [ ] Workflow orchestration
- [ ] Snapshot and sync

## Contributing

This project follows strict TypeScript and ESLint configurations. Before submitting a PR:

1. Run `pnpm test` to ensure all tests pass
2. Run `pnpm lint` to check for linting errors
3. Run `pnpm typecheck` to verify types
4. Run `pnpm build` to ensure the project builds

## License

MIT

## Author

Digital Herencia

## Related Projects

- [@notionhq/notion-mcp-server](https://github.com/notionhq/notion-mcp-server) - Official Notion MCP server
- [Model Context Protocol](https://modelcontextprotocol.io/) - MCP specification
