# Notionista

> Copilot-governed control plane for Notion workspace automation via natural language

[![CI Status](https://github.com/DigitalHerencia/Notionista/workflows/CI/badge.svg)](https://github.com/DigitalHerencia/Notionista/actions)
[![npm version](https://badge.fury.io/js/notionista.svg)](https://www.npmjs.com/package/notionista)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Overview

Notionista is a **governance and reasoning layer** for Copilot-driven Notion automation. It provides type-safe schemas, validation rules, and declarative proposals that GitHub Copilot consumes to orchestrate workspace operations through VS Code's MCP integration.

**Key distinction:** This repository provides the brain (types, schemas, constraints, memory). **Copilot Chat is the operator** that reasons about and proposes changes. **VS Code's MCP client** handles the actual execution.

### Key Features

- **Copilot-First Design**: Natural language → governed automation
- **Safety First**: Declarative Propose → Approve → Apply workflow prevents accidental data loss
- **Type Safety**: Full TypeScript schemas provide IntelliSense for Copilot reasoning
- **Control Plane**: Types, constraints, and validation rules (no runtime execution)
- **MCP Integration**: Works seamlessly with VS Code's native MCP client
- **Governance Layer**: Batch limits, validation rules, and constraint metadata

## Quick Start

### Prerequisites

- **VS Code** with GitHub Copilot extension
- **Notion MCP** configured in VS Code (handled by VS Code, not this repo)
- Node.js 20+ (for type definitions and local development)

### Installation

```bash
# Install for type definitions and schemas
pnpm add notionista

# Or using npm
npm install notionista
```

### Usage with Copilot

Notionista provides the governance layer that Copilot reasons about. You interact through natural language in Copilot Chat, which uses these types and constraints.

**Example conversation with Copilot:**

```
You: Show me all incomplete high-priority tasks

Copilot: [Uses TaskRepository types and QueryFilter schemas to propose]
         Found 3 incomplete high-priority tasks:
         - Update API documentation (due 2026-01-15)
         - Fix authentication flow (due 2026-01-12)
         - Add unit tests (due 2026-01-10)

You: Create a new task to review these items

Copilot: [Uses ChangeProposal types to create declarative intent]
         I'll create a task proposal:
         
         ## Change Proposal
         **Type**: create
         **Target Database**: Tasks
         
         ### Proposed Changes
         - name: "Review high-priority tasks"
         - priority: "High"
         - due: 2026-01-08
         
         Approve to proceed?

You: Approved

Copilot: [Executes via VS Code MCP client]
         ✅ Task created successfully (task-abc123)
```

### Programmatic Usage (For Type Safety)

If you need programmatic access, import types and create declarative proposals:

```typescript
import { createTaskUpdateProposal } from 'notionista';

// Create a declarative proposal (no execution)
const proposal = createTaskUpdateProposal({
  taskId: 'abc123',
  changes: { 
    done: true,
    priority: 'Low'
  }
});

// Copilot reviews and executes via MCP
// This repo does NOT execute - it describes intent
```

## Architecture

```text
┌─────────────────────────────────────────────────────────┐
│                  GitHub Copilot Chat                     │
│             (Natural Language Operator)                  │
└─────────────────┬───────────────────────────────────────┘
                  │ Reasons about
                  │ types & constraints
┌─────────────────▼───────────────────────────────────────┐
│                  Notionista Control Plane                │
│   (Types, Schemas, Constraints, Validation Rules)       │
│   • ProposalManager • Validator • DiffEngine            │
│   • Repository Types • Query Schemas                     │
│   • Constraint Metadata • Batch Guidance                 │
└─────────────────┬───────────────────────────────────────┘
                  │ Declares intent
                  │ (no execution)
┌─────────────────▼───────────────────────────────────────┐
│              VS Code MCP Client                          │
│        (Owned by VS Code, not this repo)                │
│   • Executes MCP tool calls                              │
│   • Handles retry logic & rate limiting                  │
│   • Manages Notion API transport                         │
└─────────────────┬───────────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────────┐
│          @notionhq/notion-mcp-server                     │
│               (stdio transport)                          │
└─────────────────────────────────────────────────────────┘
```

## Core Concepts

### Control Plane Model

Notionista provides the **governance layer** for Copilot-driven automation:

- **Types & Schemas**: TypeScript definitions Copilot uses for reasoning
- **Constraints**: Metadata about batch limits, rate limits, retry policies
- **Validation Rules**: Declarative rules for data integrity
- **Proposals**: Immutable change descriptions (not executed by this repo)

### Safety Workflow: Propose → Approve → Apply

All mutations follow a declarative three-phase workflow:

```typescript
// 1. Propose: Generate a declarative change description
const proposal = createProjectProposal({
  name: 'Q1 Planning',
  status: 'Active',
  milestone: 'M1',
  startDate: '2026-01-06',
  endDate: '2026-01-20',
});

// 2. Review: Inspect proposed changes
console.log(proposal.formatForReview());
// Output shows:
// - Target database
// - Property changes with impact levels
// - Validation results
// - Side effects (relations, rollups)

// 3. Approve & Apply: Copilot executes via MCP
// (Execution handled by VS Code MCP client, not this repo)
```

### Type-Safe Schemas

Copilot uses repository type definitions for intelligent reasoning:

```typescript
// Team Repository types
interface Team {
  id: string;
  name: string;
  tasksCompleted: number;
  projectsComplete: number;
}

// Project Repository types
interface Project {
  id: string;
  name: string;
  status: 'Active' | 'Completed' | 'On Hold' | 'Cancelled';
  milestone: 'M1' | 'M2' | 'M3' | null;
  startDate: string | null;
  endDate: string | null;
}

// Task Repository types
interface Task {
  id: string;
  name: string;
  done: boolean;
  priority: 'High' | 'Medium' | 'Low' | null;
  due: string | null;
}

// Copilot reasons about these types to propose valid changes
```

### Query Schemas

Declarative filter schemas for expressing intent:

```typescript
import { QueryFilter } from 'notionista';

// Define query intent (not executed by this repo)
const taskQuery: QueryFilter = {
  and: [
    { property: 'Done', checkbox: { equals: false } },
    { property: 'Priority', select: { equals: 'High' } },
    { property: 'Due', date: { on_or_before: '2026-01-15' } }
  ]
};

// Copilot uses this schema to construct MCP queries
```

### Constraint Metadata

Machine-readable constraints for Copilot reasoning:

```typescript
import { DEFAULT_MCP_CONSTRAINTS } from 'notionista';

// Rate limiting (handled by VS Code MCP client)
const { rateLimit } = DEFAULT_MCP_CONSTRAINTS;
// rateLimit.requestsPerSecond = 3
// rateLimit.handledBy = 'vscode-mcp-client'

// Retry behavior (handled by VS Code MCP client)
const { retry } = DEFAULT_MCP_CONSTRAINTS;
// retry.maxRetries = 3
// retry.backoffStrategy = 'exponential'
// retry.handledBy = 'vscode-mcp-client'

// Batch guidance (used by Copilot for planning)
const { batch } = DEFAULT_MCP_CONSTRAINTS;
// batch.maxItemsPerBatch = 50
// batch.requiresDryRunSummary = true
// batch.handledBy = 'copilot-agent'
```

## Database Schema

Notionista provides type definitions for standard Notion workspace databases.

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

## Governance Features

### Batch Operation Guidance

Constraint metadata for safe batch operations:

```typescript
import { validateBatchSize, splitIntoBatches } from 'notionista';

const items = [...]; // Array of items to process

// Validate batch size against recommended limits
const validation = validateBatchSize(items.length);
if (!validation.withinLimit) {
  console.warn(validation.message);
  // Copilot can use this to plan batch execution
}

// Split into manageable chunks
const batches = splitIntoBatches(items, 50);
// Copilot coordinates execution via MCP client
```

### Validation Rules

Declarative validation for data integrity:

```typescript
import { Validator } from 'notionista';

const validator = new Validator();

// Define validation rules
const taskRules = [
  { field: 'name', required: true, minLength: 3, maxLength: 100 },
  { field: 'priority', allowedValues: ['High', 'Medium', 'Low'] },
  { field: 'due', type: 'date' },
];

// Validate proposed changes
const result = validator.validate(proposedTask, taskRules);

if (!result.valid) {
  console.log('Validation errors:', result.errors);
  // Copilot uses this to refine proposals
}
```

### Diff Engine

Compute property-level differences for change review:

```typescript
import { DiffEngine } from 'notionista';

const engine = new DiffEngine();

const diff = engine.computeDiff(
  { name: 'Old Project', status: 'Active' },     // current
  { name: 'New Project', status: 'Completed' }   // proposed
);

// Output:
// [
//   { property: 'name', oldValue: 'Old Project', newValue: 'New Project', impact: 'low' },
//   { property: 'status', oldValue: 'Active', newValue: 'Completed', impact: 'high' }
// ]
```

## Examples

See the [examples/](./examples) directory for type definitions and proposal patterns:

- **[query-tasks.ts](./examples/query-tasks.ts)**: Query filter schemas
- **[create-sprint.ts](./examples/create-sprint.ts)**: Sprint planning proposals
- **[bulk-update.ts](./examples/bulk-update.ts)**: Batch operation guidance
- **[safety-workflow.ts](./examples/safety-workflow.ts)**: Proposal workflow types
- **[analytics.ts](./examples/analytics.ts)**: Team metrics schemas

## Type Definitions

For local type checking and Copilot IntelliSense:

```bash
# Required for VS Code MCP connection
NOTION_TOKEN=ntn_***  # Your Notion integration token (for VS Code MCP)
```

Note: MCP server configuration and runtime behavior are managed by VS Code, not this repository.

### Core Type Exports

```typescript
// Import types for Copilot reasoning
import type {
  Team,
  Project,
  Task,
  Meeting,
  ChangeProposal,
  QueryFilter,
  ValidationResult,
  PropertyDiff
} from 'notionista';

// Use types for IntelliSense and validation
const taskProposal: ChangeProposal<Task> = {
  // ... declarative proposal structure
};
```

## API Reference

### Repository Type Definitions

Type definitions for Copilot to reason about Notion structure:

```typescript
interface TeamRepository {
  // Query types (describe intent, don't execute)
  findMany(filter?: QueryFilter): Team[];
  findById(id: string): Team | null;
}

interface ProjectRepository {
  findMany(filter?: QueryFilter): Project[];
  findById(id: string): Project | null;
}

interface TaskRepository {
  findMany(filter?: QueryFilter): Task[];
  findById(id: string): Task | null;
}

// These interfaces guide Copilot's reasoning
// Actual execution happens via VS Code MCP client
```

### ChangeProposal

Represents a declarative change description:

```typescript
interface ChangeProposal<T> {
  id: string;
  type: 'create' | 'update' | 'delete' | 'bulk';
  target: { database: string; pageId?: string };
  currentState: T | null;
  proposedState: T;
  diff: PropertyDiff[];
  validation: ValidationResult;
  status: 'pending' | 'approved' | 'applied' | 'rejected';
}

// Proposals describe intent - execution delegated to MCP host
```

## Development

### Local Setup

```bash
# Clone repository
git clone https://github.com/DigitalHerencia/Notionista.git
cd Notionista

# Install dependencies
pnpm install

# Build type definitions
pnpm build

# Run tests
pnpm test

# Lint
pnpm lint

# Type check
pnpm typecheck
```

### Testing Type Definitions

```typescript
import { describe, it, expect } from 'vitest';
import type { Task, ChangeProposal } from 'notionista';

describe('Task Types', () => {
  it('should validate task structure', () => {
    const task: Task = {
      id: 'task-123',
      name: 'Test Task',
      done: false,
      priority: 'High',
      due: '2026-01-15'
    };

    expect(task).toBeDefined();
  });
});
```

### Project Structure

```text
notionista/
├── src/                      # Type definitions and schemas
│   ├── core/                 # Core types, constants, constraints
│   ├── domain/               # Entity types and repository interfaces
│   ├── safety/               # Proposal types, validation schemas
│   ├── workflows/            # Workflow type definitions
│   └── index.ts              # Public type exports
├── examples/                 # Usage examples for Copilot
├── tests/                    # Type validation tests
├── docs/                     # Documentation
└── .copilot/                 # Copilot configuration
    ├── agents/               # Custom Copilot agents
    └── prompts/              # Reusable prompts
```
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

- Type definitions compatible with [@notionhq/notion-mcp-server](https://github.com/notionhq/notion-mcp-server)
- Designed for the [Model Context Protocol](https://modelcontextprotocol.io/) ecosystem
- Optimized for GitHub Copilot reasoning
- Developed for the [Digital Herencia](https://github.com/DigitalHerencia) team workspace

## Support

For issues, feature requests, or questions, please visit [GitHub Issues](https://github.com/DigitalHerencia/Notionista/issues).

---

**Architecture**: Copilot-governed control plane  
**Execution**: VS Code MCP client  
**Purpose**: Types, schemas, constraints for Notion automation
