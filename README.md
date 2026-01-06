# Notionista SDK

> Type-safe TypeScript SDK for automating Notion workspaces via MCP (Model Context Protocol)

[![CI Status](https://github.com/DigitalHerencia/Notionista/workflows/CI/badge.svg)](https://github.com/DigitalHerencia/Notionista/actions)
[![npm version](https://badge.fury.io/js/notionista.svg)](https://www.npmjs.com/package/notionista)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Overview

Notionista SDK provides a type-safe, developer-friendly interface for interacting with Notion workspaces via the official `@notionhq/notion-mcp-server`. It abstracts MCP protocol complexity and enforces safe mutation workflows for enterprise workspace automation.

### Key Features

- **Safety First**: Built-in Propose - Approve - Apply workflow prevents accidental data loss
- **Type Safety**: Full TypeScript support with IntelliSense for all database schemas
- **Repository Pattern**: Clean abstraction over raw MCP tool calls
- **Workflow Orchestration**: High-level APIs for sprint cycles, task management, and analytics
- **Fluent Query Builder**: Intuitive API for constructing complex database queries
- **Batch Protection**: Automatic limits on bulk operations (max 50 items)

## Quick Start (< 5 minutes)

### Prerequisites

- Node.js 20+
- pnpm (recommended) or npm
- Notion account with MCP integration configured

### Installation

```bash
# Using pnpm (recommended)
pnpm add notionista

# Using npm
npm install notionista

# Using yarn
yarn add notionista
```

### Basic Usage

```typescript
import { NotionistaSdk } from 'notionista';

// Initialize the SDK
const sdk = new NotionistaSdk({
  notionToken: process.env.NOTION_TOKEN!,
});

// Connect to MCP server
await sdk.connect();

// Query tasks (type-safe)
const tasks = await sdk.tasks.findMany({
  where: { done: false },
  orderBy: { due: 'asc' },
});

console.log(`Found ${tasks.length} incomplete tasks`);

// Create a new task (returns proposal for review)
const proposal = await sdk.tasks.create({
  name: 'Update documentation',
  priority: 'High',
  due: new Date('2026-01-15'),
});

// Review proposal
console.log(proposal.formatForReview());

// Approve and apply
await proposal.approve();
await proposal.apply();

// Cleanup
await sdk.disconnect();
```

## Architecture

```text
┌─────────────────────────────────────────────────────────┐
│                   Application Layer                      │
│  (Workflows, CLI, Scripts, Copilot Agents)              │
└─────────────────┬───────────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────────┐
│                   Domain Layer                           │
│  (Repositories: Teams, Projects, Tasks, Meetings)       │
└─────────────────┬───────────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────────┐
│                   Safety Layer                           │
│  (Proposal Manager, Validator, Diff Engine)             │
└─────────────────┬───────────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────────┐
│                   MCP Client Layer                       │
│  (Tool Wrappers, Middleware, Rate Limiting)             │
└─────────────────┬───────────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────────┐
│             @notionhq/notion-mcp-server                  │
│                  (stdio transport)                       │
└─────────────────────────────────────────────────────────┘
```

## Core Concepts

### Safety Workflow: Propose → Approve → Apply

All mutations go through a three-phase workflow to prevent accidental data loss:

```typescript
// 1. Propose: Generate a change proposal (no execution)
const proposal = await sdk.projects.create({
  name: 'Q1 Planning',
  status: 'Active',
  milestone: 'M1',
  startDate: new Date('2026-01-06'),
  endDate: new Date('2026-01-20'),
});

// 2. Review: Inspect proposed changes
console.log(proposal.formatForReview());
// Output:
// Proposal #abc123: Create Project
// Database: Projects (2d5a4e63-bf23-8115-a70f-000bc1ef9d05)
// Changes:
//   + name: "Q1 Planning"
//   + status: "Active"
//   + milestone: "M1"
//   + startDate: 2026-01-06
//   + endDate: 2026-01-20

// 3. Approve & Apply: Execute only if approved
await proposal.approve();
const result = await proposal.apply();
```

### Repository Pattern

Each Notion database has a corresponding repository:

```typescript
// Team Repository
const teams = await sdk.teams.findMany();
const engineeringTeam = await sdk.teams.findById('team-id');

// Project Repository
const activeProjects = await sdk.projects.findMany({
  where: { status: 'Active' },
});

// Task Repository
const highPriorityTasks = await sdk.tasks.findMany({
  where: {
    priority: 'High',
    done: false,
  },
});

// Meeting Repository
const upcomingMeetings = await sdk.meetings.findMany({
  where: {
    date: { after: new Date() },
  },
});
```

### Query Builder

Construct complex queries with a fluent API:

```typescript
import { QueryBuilder } from 'notionista';

const query = new QueryBuilder('tasks')
  .where('done', 'equals', false)
  .where('priority', 'equals', 'High')
  .where('due', 'on_or_before', new Date('2026-01-15'))
  .orderBy('due', 'ascending')
  .limit(25);

const tasks = await sdk.tasks.query(query);
```

### Workflow Orchestration

High-level workflows for common operations:

```typescript
import { SprintCycleWorkflow } from 'notionista/workflows';

const workflow = new SprintCycleWorkflow(sdk);

// Plan a complete sprint (project + tasks + meetings)
const sprintProposal = await workflow.planSprint({
  teamId: 'engineering-team-id',
  name: 'Sprint 2026-W02',
  startDate: new Date('2026-01-06'),
  endDate: new Date('2026-01-20'),
  milestone: 'M1',
  phase: 'P1.1',
  domain: 'ENG',
  tasks: [
    { name: 'Implement MCP client', priority: 'High', due: new Date('2026-01-10') },
    { name: 'Write integration tests', priority: 'Medium', due: new Date('2026-01-15') },
  ],
});

// Review aggregate proposal
console.log(sprintProposal.summary);

// Execute all changes
await workflow.executeSprint(sprintProposal);
```

## Database Schema

The SDK supports configurable database schemas for custom workspace layouts.

### Standard Database Types

| Type          | Purpose                                     |
| ------------- | ------------------------------------------- |
| **Teams**     | Team organization and members               |
| **Projects**  | Project tracking with status and milestones |
| **Tasks**     | Task management and assignments             |
| **Meetings**  | Meeting coordination and scheduling         |
| **Prompts**   | Prompt templates and management             |
| **Templates** | Reusable content templates                  |

### Property Types

```typescript
// Status values
type Status = 'Active' | 'Completed' | 'On Hold' | 'Cancelled';

// Priority levels
type Priority = 'High' | 'Medium' | 'Low';

// Meeting types
type MeetingType = 'Standup' | 'Planning' | 'Review' | 'Sync' | 'Other';
```

## Advanced Features

### Batch Operations

Safe bulk updates with automatic limits:

```typescript
import { BulkOperationManager } from 'notionista';

const bulk = new BulkOperationManager(sdk);

// Update multiple tasks (max 50)
const proposal = await bulk.updateMany('tasks', [
  { id: 'task-1', updates: { priority: 'High' } },
  { id: 'task-2', updates: { priority: 'High' } },
  // ... up to 50 items
]);

// Throws BatchLimitExceededError if > 50 items
```

### Snapshot & Sync

Compare live Notion data with local exports:

```typescript
import { SnapshotManager } from 'notionista/sync';

const snapshots = new SnapshotManager(sdk);

// Capture current state
const snapshot = await snapshots.capture('tasks');

// Later, compare to detect drift
const diff = await snapshots.diff(snapshot.id);

console.log(`Added: ${diff.added.length}`);
console.log(`Modified: ${diff.modified.length}`);
console.log(`Removed: ${diff.removed.length}`);
```

### Middleware Pipeline

Customize MCP client behavior:

```typescript
import { McpClient, rateLimiterMiddleware, retryMiddleware } from 'notionista/mcp';

const client = new McpClient({ notionToken: process.env.NOTION_TOKEN! });

// Add custom middleware
client.use(rateLimiterMiddleware({ requestsPerSecond: 3 }));
client.use(retryMiddleware({ maxRetries: 3, backoff: 'exponential' }));
client.use(customLoggingMiddleware);
```

### Practical Example

Create complete workflows for complex operations:

```typescript
const project = await sdk.projects.create({
  name: 'Q1 2026 Initiative',
  status: 'Active',
  startDate: new Date('2026-01-06'),
  endDate: new Date('2026-03-31'),
});

console.log(project.formatForReview());
await project.approve();
const result = await project.apply();
```

## Examples

See the [examples/](./examples) directory for complete working examples:

- **[query-tasks.ts](./examples/query-tasks.ts)**: Basic task queries
- **[create-sprint.ts](./examples/create-sprint.ts)**: Sprint planning workflow
- **[bulk-update.ts](./examples/bulk-update.ts)**: Safe bulk operations
- **[safety-workflow.ts](./examples/safety-workflow.ts)**: Proposal workflow demonstration
- **[analytics.ts](./examples/analytics.ts)**: Team metrics and reporting

## Configuration

### Environment Variables

```bash
# Required
NOTION_TOKEN=ntn_***  # Your Notion integration token

# Optional
MCP_SERVER_PATH=/path/to/notion-mcp-server  # Custom MCP server path
LOG_LEVEL=debug  # Logging verbosity: error, warn, info, debug
CACHE_TTL=300  # Cache TTL in seconds (default: 300)
RATE_LIMIT=3  # Requests per second (default: 3)
```

### SDK Options

```typescript
const sdk = new NotionistaSdk({
  notionToken: process.env.NOTION_TOKEN!,
  logLevel: 'debug',
  cacheTtl: 300,
  rateLimit: 3,
});
```

## API Reference

### NotionistaSdk

Main SDK class providing access to all repositories and workflows.

```typescript
class NotionistaSdk {
  // Lifecycle
  connect(): Promise<void>;
  disconnect(): Promise<void>;

  // Repositories
  teams: TeamRepository;
  projects: ProjectRepository;
  tasks: TaskRepository;
  meetings: MeetingRepository;
  prompts: PromptsRepository;
  techStack: TechStackRepository;

  // Workflows
  sprintCycle: SprintCycleWorkflow;
  analytics: AnalyticsService;

  // Low-level access
  mcp: McpClient;
}
```

### Repository Methods

All repositories extend `BaseRepository<T>` with common methods:

```typescript
interface BaseRepository<T> {
  // Queries (read-only)
  findMany(filter?: QueryFilter): Promise<T[]>;
  findById(id: string): Promise<T | null>;
  query(builder: QueryBuilder): Promise<T[]>;

  // Mutations (return proposals)
  create(input: CreateInput): Promise<ChangeProposal<T>>;
  update(id: string, input: UpdateInput): Promise<ChangeProposal<T>>;
  delete(id: string): Promise<ChangeProposal<void>>;
}
```

### ChangeProposal

Represents a proposed change that requires approval:

```typescript
interface ChangeProposal<T> {
  id: string;
  type: 'create' | 'update' | 'delete' | 'bulk';
  target: { database: string; pageId?: string };
  currentState: T | null;
  proposedState: T;
  diff: PropertyDiff[];
  status: 'pending' | 'approved' | 'applied' | 'rejected';

  // Methods
  approve(): Promise<void>;
  reject(): Promise<void>;
  apply(): Promise<ApplyResult>;
  formatForReview(): string;
}
```

## Testing

Run the test suite:

```bash
# Run all tests
pnpm test

# Run with coverage
pnpm test:coverage

# Run in watch mode
pnpm test:watch

# Run integration tests only
pnpm test:integration
```

### Writing Tests

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { NotionistaSdk } from 'notionista';
import { mockMcpClient } from 'notionista/testing';

describe('TaskRepository', () => {
  let sdk: NotionistaSdk;

  beforeEach(() => {
    sdk = new NotionistaSdk({
      notionToken: 'test-token',
      mcpClient: mockMcpClient(),
    });
  });

  it('should query incomplete tasks', async () => {
    const tasks = await sdk.tasks.findMany({
      where: { done: false },
    });

    expect(tasks).toHaveLength(10);
    expect(tasks[0].done).toBe(false);
  });
});
```

## Development

### Setup

```bash
# Clone repository
git clone https://github.com/DigitalHerencia/Notionista.git
cd Notionista

# Install dependencies
pnpm install

# Build
pnpm build

# Run tests
pnpm test

# Lint
pnpm lint

# Type check
pnpm typecheck
```

### Project Structure

```text
notionista/
├── src/                      # Source code
│   ├── core/                 # Core types and constants
│   ├── mcp/                  # MCP client layer
│   ├── domain/               # Domain entities and repositories
│   ├── safety/               # Safety layer (proposals, validation)
│   ├── workflows/            # High-level workflow orchestration
│   └── index.ts              # Public API exports
├── examples/                 # Example scripts
├── tests/                    # Test suites
│   ├── unit/                 # Unit tests
│   ├── integration/          # Integration tests
│   └── fixtures/             # Test fixtures
├── docs/                     # Additional documentation
└── .copilot/                 # Copilot configuration and reports
    ├── agents/               # Custom Copilot agents
    ├── prompts/              # Reusable prompts
    └── reports/              # Design docs and requirements
```

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests (`pnpm test`)
5. Commit using conventional commits (`git commit -m 'feat: add amazing feature'`)
6. Push to your branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Commit Convention

We use [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` New features
- `fix:` Bug fixes
- `docs:` Documentation changes
- `test:` Test additions or changes
- `refactor:` Code refactoring
- `chore:` Build process or tooling changes

## License

MIT License - see [LICENSE](./LICENSE) for details.

## Acknowledgments

- Built on top of [@notionhq/notion-mcp-server](https://github.com/notionhq/notion-mcp-server)
- Inspired by the [Model Context Protocol](https://modelcontextprotocol.io/)
- Developed for the [Digital Herencia](https://github.com/DigitalHerencia) team workspace

## Support

For issues, feature requests, or questions, please visit [GitHub Issues](https://github.com/DigitalHerencia/Notionista/issues).

---

This project is maintained as part of the Notion automation ecosystem.
