---
post_title: API Reference - Notionista
author1: Digital Herencia
post_slug: api-reference
microsoft_alias: digitalherencia
featured_image: /assets/api-reference.png
categories: Control Plane, Documentation, API
tags: notion, mcp, automation, typescript, api, reference, copilot
ai_note: Documentation generated with AI assistance
summary: Complete type definitions and API reference for Notionista control plane
post_date: 2026-01-07
---

# API Reference

Complete type definitions and API reference for Notionista.

## Overview

Notionista provides **type definitions and schemas** that Copilot uses for reasoning. This is not a runtime execution API - all operations describe intent, and execution is delegated to VS Code's MCP client.

## Core Type Exports

### Entity Types

```typescript
// Task entity type
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

// Project entity type
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

// Team entity type
interface Team {
  id: string;
  name: string;
  tasksCompleted: number;
  projectsComplete: number;
}

// Meeting entity type
interface Meeting {
  id: string;
  name: string;
  type: 'Standup' | 'Planning' | 'Review' | 'Sync' | 'Other';
  cadence: 'Daily' | 'Weekly' | 'Biweekly' | 'Monthly' | 'Ad Hoc';
  date: string;
  attendees: string[];
  actionItems: string[];
}
```

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
