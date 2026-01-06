---
post_title: API Reference - Notionista SDK
author1: Digital Herencia
post_slug: api-reference
microsoft_alias: digitalherencia
featured_image: /assets/api-reference.png
categories: SDK, Documentation, API
tags: notion, mcp, automation, typescript, api, reference
ai_note: Documentation generated with AI assistance
summary: Complete API reference for Notionista SDK with detailed method signatures and examples
post_date: 2026-01-05
---

# API Reference

Complete API documentation for Notionista SDK.

## NotionistaSdk

The main SDK class providing access to all repositories and workflows.

### Constructor

```typescript
class NotionistaSdk {
  constructor(options: SdkOptions);
}
```

### SdkOptions

| Property        | Type                                     | Required | Default  | Description              |
| --------------- | ---------------------------------------- | -------- | -------- | ------------------------ |
| `notionToken`   | `string`                                 | ✅       | -        | Notion integration token |
| `logLevel`      | `'error' \| 'warn' \| 'info' \| 'debug'` | ❌       | `'info'` | Logging verbosity        |
| `cacheTtl`      | `number`                                 | ❌       | `300`    | Cache TTL in seconds     |
| `rateLimit`     | `number`                                 | ❌       | `3`      | Requests per second      |
| `mcpServerPath` | `string`                                 | ❌       | -        | Custom MCP server path   |

### Methods

#### `connect()`

Establishes connection to the MCP server.

```typescript
await sdk.connect(): Promise<void>
```

**Example:**

```typescript
const sdk = new NotionistaSdk({ notionToken: process.env.NOTION_TOKEN! });
await sdk.connect();
```

#### `disconnect()`

Closes the connection to the MCP server.

```typescript
await sdk.disconnect(): Promise<void>
```

### Properties

| Property   | Type                | Description          |
| ---------- | ------------------- | -------------------- |
| `teams`    | `TeamRepository`    | Team operations      |
| `projects` | `ProjectRepository` | Project operations   |
| `tasks`    | `TaskRepository`    | Task operations      |
| `meetings` | `MeetingRepository` | Meeting operations   |
| `mcp`      | `McpClient`         | Low-level MCP client |

---

## BaseRepository

Abstract base class for all repositories.

### Type Parameters

```typescript
abstract class BaseRepository<TEntity, TCreateInput, TUpdateInput>
```

| Parameter      | Description                      |
| -------------- | -------------------------------- |
| `TEntity`      | The domain entity type           |
| `TCreateInput` | Input type for creating entities |
| `TUpdateInput` | Input type for updating entities |

### Methods

#### `findMany(filter?)`

Find all entities matching the optional filter.

```typescript
async findMany(filter?: QueryFilter): Promise<TEntity[]>
```

**Parameters:**

| Name     | Type          | Description                   |
| -------- | ------------- | ----------------------------- |
| `filter` | `QueryFilter` | Optional Notion filter object |

**Returns:** `Promise<TEntity[]>` - Array of matching entities

**Example:**

```typescript
// Find all tasks
const allTasks = await sdk.tasks.findMany();

// Find with filter
const incompleteTasks = await sdk.tasks.findMany({
  property: 'Done',
  checkbox: { equals: false },
});
```

#### `findById(id)`

Find a single entity by ID.

```typescript
async findById(id: string): Promise<TEntity | null>
```

**Returns:** `TEntity | null` - The entity or null if not found

#### `findByIdOrThrow(id)`

Find a single entity by ID, throwing if not found.

```typescript
async findByIdOrThrow(id: string): Promise<TEntity>
```

**Throws:** `EntityNotFoundError` if entity is not found

#### `create(input)`

Create a new entity proposal.

```typescript
async create(input: TCreateInput): Promise<ChangeProposal<TEntity>>
```

**Returns:** `ChangeProposal<TEntity>` - A proposal for review and approval

**Example:**

```typescript
const proposal = await sdk.tasks.create({
  name: 'New Task',
  priority: 'High',
  due: '2026-01-15T00:00:00.000Z',
});

// Review and apply
console.log(proposal.formatForReview());
await proposal.approve();
await proposal.apply();
```

#### `update(id, input)`

Update an existing entity.

```typescript
async update(id: string, input: TUpdateInput): Promise<ChangeProposal<TEntity>>
```

---

## TaskRepository

Repository for Task entities. Extends `BaseRepository`.

### Task Entity

```typescript
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
```

### CreateTaskInput

```typescript
interface CreateTaskInput {
  name: string;
  done?: boolean;
  due?: string | null;
  priority?: 'High' | 'Medium' | 'Low' | null;
  projectId?: string;
  teamId?: string;
}
```

### UpdateTaskInput

```typescript
interface UpdateTaskInput {
  name?: string;
  done?: boolean;
  due?: string | null;
  priority?: 'High' | 'Medium' | 'Low' | null;
  projectId?: string;
  teamId?: string;
}
```

### Specialized Methods

#### `findByDone(done)`

Find tasks by completion status.

```typescript
async findByDone(done: boolean): Promise<Task[]>
```

#### `findIncomplete()`

Find all incomplete tasks.

```typescript
async findIncomplete(): Promise<Task[]>
```

**Example:**

```typescript
const incompleteTasks = await sdk.tasks.findIncomplete();
console.log(`You have ${incompleteTasks.length} tasks to complete`);
```

#### `findCompleted()`

Find all completed tasks.

```typescript
async findCompleted(): Promise<Task[]>
```

#### `findByProject(projectId)`

Find tasks belonging to a specific project.

```typescript
async findByProject(projectId: string): Promise<Task[]>
```

#### `findByTeam(teamId)`

Find tasks belonging to a specific team.

```typescript
async findByTeam(teamId: string): Promise<Task[]>
```

#### `findByPriority(priority)`

Find tasks by priority level.

```typescript
async findByPriority(priority: 'High' | 'Medium' | 'Low'): Promise<Task[]>
```

#### `findHighPriority()`

Find all high-priority tasks.

```typescript
async findHighPriority(): Promise<Task[]>
```

#### `findOverdue()`

Find incomplete tasks with due dates in the past.

```typescript
async findOverdue(): Promise<Task[]>
```

**Example:**

```typescript
const overdueTasks = await sdk.tasks.findOverdue();
if (overdueTasks.length > 0) {
  console.warn(`⚠️ You have ${overdueTasks.length} overdue tasks!`);
}
```

#### `findDueToday()`

Find tasks due today.

```typescript
async findDueToday(): Promise<Task[]>
```

#### `findDueSoon(days?)`

Find incomplete tasks due within the next N days.

```typescript
async findDueSoon(days: number = 7): Promise<Task[]>
```

**Example:**

```typescript
const nextWeekTasks = await sdk.tasks.findDueSoon(7);
const next3DaysTasks = await sdk.tasks.findDueSoon(3);
```

#### `getProjectCompletionRate(projectId)`

Get task completion rate for a project.

```typescript
async getProjectCompletionRate(projectId: string): Promise<number>
```

**Returns:** Percentage (0-100) of completed tasks

#### `getTeamCompletionRate(teamId)`

Get task completion rate for a team.

```typescript
async getTeamCompletionRate(teamId: string): Promise<number>
```

---

## ProjectRepository

Repository for Project entities.

### Project Entity

```typescript
interface Project {
  id: string;
  name: string;
  status: 'Active' | 'Completed' | 'On Hold' | 'Cancelled';
  milestone: 'M1' | 'M2' | 'M3' | null;
  phase: 'P1.1' | 'P1.2' | 'P1.3' | 'P2.1' | 'P2.2' | 'P2.3' | 'P3.1' | 'P3.2' | 'P3.3' | null;
  domain: 'OPS' | 'PROD' | 'DES' | 'ENG' | 'MKT' | 'RES' | null;
  startDate: string | null;
  endDate: string | null;
  teamId?: string;
  taskIds: string[];
}
```

### Specialized Methods

#### `findByStatus(status)`

Find projects by status.

```typescript
async findByStatus(status: ProjectStatus): Promise<Project[]>
```

#### `findActive()`

Find all active projects.

```typescript
async findActive(): Promise<Project[]>
```

#### `findByTeam(teamId)`

Find projects belonging to a team.

```typescript
async findByTeam(teamId: string): Promise<Project[]>
```

#### `findByMilestone(milestone)`

Find projects by milestone.

```typescript
async findByMilestone(milestone: 'M1' | 'M2' | 'M3'): Promise<Project[]>
```

---

## ChangeProposal

Represents a proposed change that requires approval.

### Interface

```typescript
interface ChangeProposal<T> {
  id: string;
  type: 'create' | 'update' | 'delete' | 'bulk';
  target: {
    database: string;
    pageId?: string;
  };
  currentState: T | null;
  proposedState: T;
  diff: PropertyDiff[];
  sideEffects: SideEffect[];
  validation: ValidationResult;
  status: 'pending' | 'approved' | 'applied' | 'rejected' | 'failed';
  createdAt: Date;
  appliedAt?: Date;
}
```

### Methods

#### `approve()`

Approve the proposal for execution.

```typescript
approve(): void
```

#### `reject()`

Reject the proposal.

```typescript
reject(): void
```

#### `apply()`

Execute the approved proposal.

```typescript
async apply(): Promise<ApplyResult>
```

#### `formatForReview()`

Format proposal as markdown for human review.

```typescript
formatForReview(): string
```

---

## ProposalManager

Manages the proposal lifecycle.

### Methods

#### `propose(change)`

Create a new change proposal.

```typescript
async propose<T>(
  change: Omit<ChangeProposal<T>, 'id' | 'createdAt' | 'status'>
): Promise<ChangeProposal<T>>
```

#### `approve(proposalId)`

Approve a proposal.

```typescript
approve(proposalId: string): void
```

#### `apply(proposalId, executor)`

Execute an approved proposal.

```typescript
async apply(
  proposalId: string,
  executor: (proposal: ChangeProposal) => Promise<string>
): Promise<ApplyResult>
```

#### `reject(proposalId)`

Reject a pending proposal.

```typescript
reject(proposalId: string): void
```

#### `get(proposalId)`

Get a proposal by ID.

```typescript
get(proposalId: string): ChangeProposal | undefined
```

#### `list(status?)`

List all proposals with optional status filter.

```typescript
list(status?: ProposalStatus): ChangeProposal[]
```

#### `formatForReview(proposal)`

Format proposal for human review.

```typescript
formatForReview<T>(proposal: ChangeProposal<T>): string
```

---

## DiffEngine

Computes property-level differences between states.

### Methods

#### `computeDiff(current, proposed)`

Compute diff between two states.

```typescript
computeDiff<T extends Record<string, unknown>>(
  current: T | null,
  proposed: T
): PropertyDiff[]
```

#### `assessImpact(property, oldValue, newValue)`

Assess the impact level of a change.

```typescript
assessImpact(property: string, oldValue: unknown, newValue: unknown): ImpactLevel
```

**Returns:** `'low' | 'medium' | 'high'`

#### `hasRelationChanges(diffs)`

Check if any relations changed.

```typescript
hasRelationChanges(diffs: PropertyDiff[]): boolean
```

#### `formatAsMarkdown(diffs)`

Format diff as markdown.

```typescript
formatAsMarkdown(diffs: PropertyDiff[]): string
```

#### `generateSummary(diffs)`

Generate human-readable summary.

```typescript
generateSummary(diffs: PropertyDiff[]): string
```

---

## Validator

Validates entity data before mutations.

### Methods

#### `validate(entity, rules, context?)`

Validate entity against rules.

```typescript
validate(
  entity: Record<string, unknown>,
  rules: ValidationRule[],
  context?: ValidationContext
): ValidationResult
```

#### `validateRequired(entity, requiredFields)`

Validate required fields.

```typescript
validateRequired(
  entity: Record<string, unknown>,
  requiredFields: string[]
): ValidationResult
```

#### `validateSelectOptions(entity, selectOptions)`

Validate select option values.

```typescript
validateSelectOptions(
  entity: Record<string, unknown>,
  selectOptions: Record<string, string[]>
): ValidationResult
```

#### `validateDates(entity, dateFields)`

Validate date formats.

```typescript
validateDates(
  entity: Record<string, unknown>,
  dateFields: string[]
): ValidationResult
```

#### `validateRelations(entity, relationFields, existingIds?)`

Validate relation targets.

```typescript
validateRelations(
  entity: Record<string, unknown>,
  relationFields: Record<string, string>,
  existingIds?: Map<string, Set<string>>
): ValidationResult
```

#### `generateWarnings(current, proposed)`

Generate warnings for suspicious changes.

```typescript
generateWarnings(
  current: Record<string, unknown>,
  proposed: Record<string, unknown>
): ValidationResult
```

---

## BatchLimiter

Enforces batch size limits for bulk operations.

### Constructor

```typescript
class BatchLimiter {
  constructor(config?: Partial<BatchConfig>);
}
```

### BatchConfig

| Property       | Type       | Default | Description              |
| -------------- | ---------- | ------- | ------------------------ |
| `maxBatchSize` | `number`   | `50`    | Maximum items per batch  |
| `allowSplit`   | `boolean`  | `false` | Auto-split large batches |
| `onProgress`   | `function` | -       | Progress callback        |

### Methods

#### `validateBatchSize(itemCount)`

Validate batch size against limit.

```typescript
validateBatchSize(itemCount: number): void
```

**Throws:** `BatchLimitExceededError` if limit exceeded

#### `isWithinLimit(itemCount)`

Check if batch size is within limit.

```typescript
isWithinLimit(itemCount: number): boolean
```

#### `splitBatch(items)`

Split batch into chunks.

```typescript
splitBatch<T>(items: T[]): T[][]
```

#### `generateDryRunSummary(itemCount)`

Generate dry-run summary.

```typescript
generateDryRunSummary(itemCount: number): BatchOperation
```

#### `executeBatch(items, executor)`

Execute batch with progress tracking.

```typescript
async executeBatch<T, R>(
  items: T[],
  executor: (item: T) => Promise<R>
): Promise<BatchResult>
```

---

## Type Definitions

### PropertyDiff

```typescript
interface PropertyDiff {
  property: string;
  oldValue: unknown;
  newValue: unknown;
  impact: 'low' | 'medium' | 'high';
}
```

### SideEffect

```typescript
interface SideEffect {
  type: 'relation_update' | 'rollup_recalc' | 'cascade';
  description: string;
  affectedItems: string[];
}
```

### ValidationResult

```typescript
interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}
```

### ValidationRule

```typescript
interface ValidationRule {
  field: string;
  required?: boolean;
  type?: 'string' | 'number' | 'boolean' | 'date' | 'array' | 'object';
  allowedValues?: unknown[];
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: unknown) => boolean;
  message?: string;
}
```

### ApplyResult

```typescript
interface ApplyResult {
  proposalId: string;
  success: boolean;
  entityId?: string;
  error?: Error;
  timestamp: Date;
}
```

### BatchOperation

```typescript
interface BatchOperation {
  id: string;
  itemCount: number;
  estimatedDuration: number;
  chunks: number;
}
```

### BatchResult

```typescript
interface BatchResult {
  successful: number;
  failed: number;
  errors: Array<{ index: number; error: Error }>;
  duration: number;
}
```
