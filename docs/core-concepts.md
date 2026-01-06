---
post_title: Core Concepts - Notionista SDK
author1: Digital Herencia
post_slug: core-concepts
microsoft_alias: digitalherencia
featured_image: /assets/core-concepts.png
categories: SDK, Documentation, Architecture
tags: notion, mcp, automation, typescript, architecture, safety
ai_note: Documentation generated with AI assistance
summary: Understand the core concepts, architecture, and safety workflow of Notionista SDK
post_date: 2026-01-05
---

# Core Concepts

This guide covers the fundamental concepts and architecture of the Notionista SDK.

## Architecture Overview

Notionista is built on a layered architecture that separates concerns and provides clean abstractions:

```
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

### Layer Responsibilities

| Layer           | Purpose                              | Components                             |
| --------------- | ------------------------------------ | -------------------------------------- |
| **Application** | Business logic and user interactions | Workflows, scripts, CLI tools          |
| **Domain**      | Entity management and business rules | Repositories, entities, schemas        |
| **Safety**      | Mutation protection and validation   | ProposalManager, Validator, DiffEngine |
| **MCP Client**  | Protocol abstraction                 | McpClient, middleware, transport       |

## Safety Workflow: Propose → Approve → Apply

The cornerstone of Notionista is its three-phase safety workflow that prevents accidental data loss:

```
┌──────────┐     ┌──────────┐     ┌──────────┐
│ PROPOSE  │ ──▶ │ APPROVE  │ ──▶ │  APPLY   │
└──────────┘     └──────────┘     └──────────┘
     │                │                │
     ▼                ▼                ▼
  Generate        Review &         Execute
  Proposal       Validate         Changes
```

### Phase 1: Propose

When you call a mutation method (create, update, delete), Notionista:

1. **Validates** the input against the schema
2. **Computes** the diff between current and proposed state
3. **Detects** potential side effects (relations, rollups)
4. **Creates** a proposal object (no changes executed yet)

```typescript
// Create a proposal (nothing is written to Notion yet)
const proposal = await sdk.projects.create({
  name: 'Q1 Planning',
  status: 'Active',
  milestone: 'M1',
  startDate: new Date('2026-01-06').toISOString(),
  endDate: new Date('2026-01-20').toISOString(),
});

console.log(proposal.status); // 'pending'
console.log(proposal.type); // 'create'
```

### Phase 2: Approve

Review the proposal and explicitly approve it:

```typescript
// Review the proposed changes
console.log(proposal.formatForReview());

// Output:
// ## Change Proposal: abc123
//
// **Type**: create
// **Target Database**: Projects
// **Status**: pending
//
// ### Property Changes
//
// - **name** (low impact)
//   - Old: `null`
//   - New: `"Q1 Planning"`
// - **status** (high impact)
//   - Old: `null`
//   - New: `"Active"`
// ...

// If satisfied, approve the proposal
await proposal.approve();
console.log(proposal.status); // 'approved'
```

### Phase 3: Apply

Execute the approved changes:

```typescript
// Apply the approved proposal
const result = await proposal.apply();

if (result.success) {
  console.log(`Created project: ${result.entityId}`);
  console.log(proposal.status); // 'applied'
} else {
  console.error('Failed:', result.error);
  console.log(proposal.status); // 'failed'
}
```

### Proposal Lifecycle

```
            ┌─────────────────────────────────────┐
            │                                     │
            ▼                                     │
     ┌──────────┐                                 │
     │ PENDING  │ ──▶ [reject()] ──▶ REJECTED    │
     └──────────┘                                 │
            │                                     │
            │ [approve()]                         │
            ▼                                     │
     ┌──────────┐                                 │
     │ APPROVED │                                 │
     └──────────┘                                 │
            │                                     │
            │ [apply()]                           │
            ▼                                     │
     ┌──────────┐                                 │
     │ APPLIED  │ ◀────── Success                 │
     └──────────┘                                 │
                                                  │
     ┌──────────┐                                 │
     │  FAILED  │ ◀────── Error ─────────────────┘
     └──────────┘
```

## Repository Pattern

Each Notion database has a corresponding repository that provides type-safe CRUD operations:

### Available Repositories

| Repository     | Database | Entity Type |
| -------------- | -------- | ----------- |
| `sdk.teams`    | Teams    | `Team`      |
| `sdk.projects` | Projects | `Project`   |
| `sdk.tasks`    | Tasks    | `Task`      |
| `sdk.meetings` | Meetings | `Meeting`   |

### Repository Interface

All repositories extend `BaseRepository<T>` with these common methods:

```typescript
interface BaseRepository<T, CreateInput, UpdateInput> {
  // Read operations (no proposals needed)
  findMany(filter?: QueryFilter): Promise<T[]>;
  findById(id: string): Promise<T | null>;
  findByIdOrThrow(id: string): Promise<T>;

  // Mutation operations (return proposals)
  create(input: CreateInput): Promise<ChangeProposal<T>>;
  update(id: string, input: UpdateInput): Promise<ChangeProposal<T>>;
}
```

### Entity Types

Entities are strongly typed using Zod schemas:

```typescript
// Task entity
interface Task {
  id: string;
  name: string;
  done: boolean;
  taskCode?: string;
  due: string | null;
  priority: 'High' | 'Medium' | 'Low' | null;
  projectId?: string;
  teamId?: string;
}

// Project entity
interface Project {
  id: string;
  name: string;
  status: 'Active' | 'Completed' | 'On Hold' | 'Cancelled';
  milestone: 'M1' | 'M2' | 'M3' | null;
  phase: 'P1.1' | 'P1.2' | ... | 'P3.3' | null;
  domain: 'OPS' | 'PROD' | 'DES' | 'ENG' | 'MKT' | 'RES' | null;
  startDate: string | null;
  endDate: string | null;
  teamId?: string;
  taskIds: string[];
}
```

## Diff Engine

The DiffEngine computes property-level differences between states:

```typescript
import { DiffEngine } from 'notionista';

const engine = new DiffEngine();

const diff = engine.computeDiff(
  { name: 'Old Project', status: 'Active' }, // current
  { name: 'New Project', status: 'Completed' } // proposed
);

console.log(diff);
// [
//   { property: 'name', oldValue: 'Old Project', newValue: 'New Project', impact: 'low' },
//   { property: 'status', oldValue: 'Active', newValue: 'Completed', impact: 'high' }
// ]
```

### Impact Levels

| Level         | Properties                | Examples                               |
| ------------- | ------------------------- | -------------------------------------- |
| 🔴 **High**   | Critical data changes     | `status`, `done`, relations, deletions |
| 🟡 **Medium** | Schedule/priority changes | `due`, `priority`, dates               |
| 🟢 **Low**    | Cosmetic changes          | `name`, descriptions, notes            |

## Validation

The Validator ensures data integrity before mutations:

```typescript
import { Validator } from 'notionista';

const validator = new Validator();

// Validate required fields
const result = validator.validateRequired({ name: 'My Task', priority: 'High' }, [
  'name',
  'priority',
  'due',
]);

if (!result.valid) {
  console.log('Errors:', result.errors);
  // ['Required field 'due' is missing']
}

// Validate select options
const selectResult = validator.validateSelectOptions(
  { status: 'Invalid', priority: 'High' },
  {
    status: ['Active', 'Completed', 'On Hold', 'Cancelled'],
    priority: ['High', 'Medium', 'Low'],
  }
);
```

### Validation Rules

You can define custom validation rules:

```typescript
const rules = [
  { field: 'name', required: true, minLength: 3, maxLength: 100 },
  { field: 'priority', allowedValues: ['High', 'Medium', 'Low'] },
  { field: 'due', type: 'date' },
  {
    field: 'email',
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Invalid email format',
  },
];

const result = validator.validate(entity, rules);
```

## Error Handling

Notionista provides typed error classes for precise error handling:

```typescript
import {
  NotionistaError,
  EntityNotFoundError,
  ValidationError,
  BatchLimitExceededError,
  McpError,
} from 'notionista';

try {
  const task = await sdk.tasks.findByIdOrThrow('invalid-id');
} catch (error) {
  if (error instanceof EntityNotFoundError) {
    console.log(`Task not found: ${error.message}`);
    console.log(`Error code: ${error.code}`); // 'ENTITY_NOT_FOUND'
  } else if (error instanceof ValidationError) {
    console.log('Validation failed:', error.errors);
  } else if (error instanceof BatchLimitExceededError) {
    console.log('Too many items in batch');
  } else if (error instanceof McpError) {
    console.log(`MCP operation failed: ${error.operation}`);
  } else {
    throw error; // Unexpected error
  }
}
```

### Error Hierarchy

```
NotionistaError (base)
├── RepositoryError
│   └── EntityNotFoundError
├── ValidationError
├── ProposalNotFoundError
├── BatchLimitExceededError
├── McpError
├── McpTransportError
├── McpConnectionError
└── ConfigurationError
```

## Database IDs

Notionista includes pre-configured database IDs for the Digital Herencia workspace:

```typescript
import { DATABASE_IDS } from 'config/databases.json';

console.log(DATABASE_IDS);
// Database IDs are maintained in config/databases.json
// See that file for current authoritative database identifiers:
// {
//   teams: { id: '...', name: 'Teams', ... },
//   projects: { id: '...', name: 'Projects', ... },
//   tasks: { id: '...', name: 'Tasks', ... },
//   meetings: { id: '...', name: 'Meetings', ... },
//   prompts: { id: '...', name: 'Prompts', ... },
//   techStack: { id: '...', name: 'Tech Stack', ... },
//   templates: { id: '...', name: 'Templates', ... },
//   sops: { id: '...', name: 'SOPs', ... },
//   calendar: { id: '...', name: 'Calendar', ... }
// }
```

## Next Steps

- Learn about the [Query Builder](./query-builder.md) for complex queries
- Explore the [Safety Layer](./safety-layer.md) in depth
- Discover [Workflows](./workflows.md) for sprint management
