---
post_title: Core Concepts - Notionista
author1: Digital Herencia
post_slug: core-concepts
microsoft_alias: digitalherencia
featured_image: /assets/core-concepts.png
categories: Control Plane, Documentation, Architecture
tags: notion, mcp, automation, typescript, architecture, copilot, governance
ai_note: Documentation generated with AI assistance
summary: Understand the core concepts, architecture, and governance model of Notionista control plane
post_date: 2026-01-07
---

# Core Concepts

This guide covers the fundamental concepts and architecture of Notionista as a Copilot-governed control plane.

## Architecture Overview

Notionista operates as a **declarative control plane** that Copilot reasons about:

```
┌─────────────────────────────────────────────────────────┐
│                 GitHub Copilot Chat                      │
│            (Natural Language Operator)                   │
└─────────────────┬───────────────────────────────────────┘
                  │ Reasons about
                  │ types & constraints
┌─────────────────▼───────────────────────────────────────┐
│                Notionista Control Plane                  │
│  (Types, Schemas, Constraints, Validation Rules)        │
│  • ProposalManager • Validator • DiffEngine             │
│  • Repository Types • Query Schemas                      │
│  • Constraint Metadata • Batch Guidance                  │
└─────────────────┬───────────────────────────────────────┘
                  │ Declares intent
                  │ (no execution)
┌─────────────────▼───────────────────────────────────────┐
│             VS Code MCP Client                           │
│       (Owned by VS Code, not this repo)                 │
│  • Executes MCP tool calls                               │
│  • Handles retry logic & rate limiting                   │
│  • Manages Notion API transport                          │
└─────────────────┬───────────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────────┐
│         @notionhq/notion-mcp-server                      │
│              (stdio transport)                           │
└─────────────────────────────────────────────────────────┘
```

### Layer Responsibilities

| Layer                       | Purpose                                  | Owner           |
| --------------------------- | ---------------------------------------- | --------------- |
| **GitHub Copilot Chat**     | Natural language operator and coordinator| GitHub/Microsoft|
| **Notionista Control Plane**| Types, schemas, constraints, governance  | This Repository |
| **VS Code MCP Client**      | Execution, retry logic, rate limiting    | VS Code         |
| **Notion MCP Server**       | Notion API protocol bridge               | Notion          |

## Control Plane Model

Notionista provides the **governance layer** for Copilot-driven automation:

### What Notionista Provides

- **Types & Schemas**: TypeScript definitions Copilot uses for reasoning
- **Constraints**: Metadata about batch limits, rate limits, retry policies  
- **Validation Rules**: Declarative rules for data integrity
- **Proposals**: Immutable change descriptions (not executed by this repo)
- **Diff Engine**: Compute property-level differences for review
- **Validator**: Validate proposed changes against rules

### What Notionista Does NOT Do

- ❌ Execute MCP requests (handled by VS Code)
- ❌ Manage retry logic (handled by VS Code)
- ❌ Enforce rate limits (handled by VS Code)
- ❌ Connect to Notion API (handled by MCP server)
- ❌ Run background processes or servers

## Safety Workflow: Propose → Approve → Apply

The cornerstone of Notionista is its declarative three-phase safety workflow:

```
┌──────────┐     ┌──────────┐     ┌──────────┐
│ PROPOSE  │ ──▶ │ APPROVE  │ ──▶ │  APPLY   │
└──────────┘     └──────────┘     └──────────┘
     │                │                │
     ▼                ▼                ▼
  Generate        Review &         Execute
  Proposal       Validate         (via MCP)
```

### Phase 1: Propose

When Copilot creates a proposal, Notionista:

1. **Validates** the input against the schema
2. **Computes** the diff between current and proposed state
3. **Detects** potential side effects (relations, rollups)
4. **Creates** a proposal object (no changes executed yet)

```typescript
// Copilot creates a declarative proposal (nothing executed)
const proposal: ChangeProposal<Project> = {
  id: 'proposal-abc123',
  type: 'create',
  target: { database: 'projects' },
  currentState: null,
  proposedState: {
    id: 'new-project',
    name: 'Q1 Planning',
    status: 'Active',
    milestone: 'M1',
    startDate: '2026-01-06',
    endDate: '2026-01-20'
  },
  diff: [
    { property: 'name', oldValue: null, newValue: 'Q1 Planning', impact: 'low' },
    { property: 'status', oldValue: null, newValue: 'Active', impact: 'high' }
  ],
  validation: { valid: true, errors: [], warnings: [] },
  status: 'pending'
};

// Status: 'pending' - awaiting review
```

### Phase 2: Approve

Copilot presents the proposal for review and you explicitly approve:

```typescript
// Copilot formats for human review
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

// User approves in natural language
// "Approved" or "Yes, proceed"

// Proposal status changes to 'approved'
```

### Phase 3: Apply

VS Code MCP client executes the approved changes:

```typescript
// VS Code MCP client executes (not Notionista)
// Proposal status: 'approved' → 'applied'

// If successful:
//   proposal.status === 'applied'
//   entityId returned

// If failed:
//   proposal.status === 'failed'
//   error details available
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

## Repository Type Definitions

Each Notion database has corresponding type definitions for Copilot reasoning:

### Available Repository Types

| Repository Type      | Database | Entity Type |
| -------------------- | -------- | ----------- |
| `TeamRepository`     | Teams    | `Team`      |
| `ProjectRepository`  | Projects | `Project`   |
| `TaskRepository`     | Tasks    | `Task`      |
| `MeetingRepository`  | Meetings | `Meeting`   |

### Repository Type Interface

Type definitions guide Copilot's reasoning:

```typescript
// Repository types describe structure, not execution
interface BaseRepository<T, CreateInput, UpdateInput> {
  // Query types (describe intent)
  findMany(filter?: QueryFilter): Promise<T[]>;
  findById(id: string): Promise<T | null>;
  findByIdOrThrow(id: string): Promise<T>;

  // Proposal types (describe change intent)
  create(input: CreateInput): Promise<ChangeProposal<T>>;
  update(id: string, input: UpdateInput): Promise<ChangeProposal<T>>;
}

// Copilot uses these types, execution happens via MCP
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
