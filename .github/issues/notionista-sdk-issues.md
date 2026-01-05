# GitHub Issues for Notionista SDK

This document contains pre-formatted GitHub issues for all tasks defined in the implementation plan. Copy each section to create issues in your repository.

---

## Epic Issues

### EPIC-001: Project Foundation

```markdown
---
title: "[EPIC-001] Project Foundation"
labels: epic, priority-p0
---

## Epic Overview

**Epic ID**: EPIC-001
**Priority**: P0
**Estimated Effort**: L (16-24 hours total)
**Target Milestone**: M1

### Description

Set up the TypeScript project foundation including build tooling, type system, error handling, and configuration. This epic establishes the groundwork for all subsequent development.

### Success Criteria

- [ ] TypeScript project builds with zero errors
- [ ] ESLint and Prettier configured and passing
- [ ] Vitest test framework operational
- [ ] All database IDs and types defined
- [ ] Custom error hierarchy implemented
- [ ] Configuration system in place

### Related Tasks

- [ ] #TASK-001 - Initialize TypeScript project
- [ ] #TASK-002 - Define core type system
- [ ] #TASK-003 - Create error hierarchy
- [ ] #TASK-004 - Create database configuration

### Dependencies

- None (first epic)
- Blocks: EPIC-002, EPIC-003

### Technical Notes

- Use pnpm as package manager
- Target Node.js 20+
- Strict TypeScript configuration
- Zod for runtime validation

### References

- [PRD](../.copilot/reports/requirements.md)
- [Design Doc](../.copilot/reports/design.md)
- [Tasks](../.copilot/reports/tasks.md#epic-1-project-foundation)
```

---

### EPIC-002: MCP Client Layer

```markdown
---
title: "[EPIC-002] MCP Client Layer"
labels: epic, priority-p0
---

## Epic Overview

**Epic ID**: EPIC-002
**Priority**: P0
**Estimated Effort**: XL (32+ hours total)
**Target Milestone**: M1

### Description

Implement the MCP client layer that communicates with @notionhq/notion-mcp-server via stdio. Includes transport handling, middleware pipeline, and typed tool wrappers.

### Success Criteria

- [ ] Successfully spawns and manages MCP server process
- [ ] JSON-RPC communication works reliably
- [ ] Middleware pipeline executes correctly
- [ ] All Notion MCP tools have typed wrappers
- [ ] Rate limiting prevents API throttling
- [ ] Retry logic handles transient failures

### Related Tasks

- [ ] #TASK-005 - Implement stdio transport
- [ ] #TASK-006 - Implement MCP client
- [ ] #TASK-007 - Implement rate limiter middleware
- [ ] #TASK-008 - Implement retry middleware
- [ ] #TASK-009 - Implement logger middleware
- [ ] #TASK-010 - Implement cache middleware
- [ ] #TASK-011 - Create tool wrappers

### Dependencies

- Depends on: EPIC-001
- Blocks: EPIC-003, EPIC-004, EPIC-005

### Technical Notes

- @notionhq/notion-mcp-server uses stdio transport
- Spawn via `npx -y @notionhq/notion-mcp-server`
- NOTION_TOKEN passed via environment
- JSON-RPC 2.0 protocol

### References

- [Design Doc - MCP Client](../.copilot/reports/design.md#31-mcp-client)
```

---

### EPIC-003: Domain Layer

```markdown
---
title: "[EPIC-003] Domain Layer"
labels: epic, priority-p1
---

## Epic Overview

**Epic ID**: EPIC-003
**Priority**: P1
**Estimated Effort**: XL (32 hours total)
**Target Milestone**: M2

### Description

Implement the domain layer with entity classes and repository pattern for data access. All repositories follow the safety workflow returning proposals instead of executing mutations directly.

### Success Criteria

- [ ] BaseRepository abstract class implemented
- [ ] All 4 core repositories (Team, Project, Task, Meeting) complete
- [ ] Domain entities with computed properties
- [ ] All mutations return ChangeProposal
- [ ] Relation traversal supported

### Related Tasks

- [ ] #TASK-012 - Implement base repository
- [ ] #TASK-013 - Implement TeamRepository
- [ ] #TASK-014 - Implement ProjectRepository
- [ ] #TASK-015 - Implement TaskRepository
- [ ] #TASK-016 - Implement MeetingRepository
- [ ] #TASK-017 - Create domain entities

### Dependencies

- Depends on: EPIC-001, EPIC-002
- Blocks: EPIC-005, EPIC-006

### Technical Notes

- Repository pattern abstracts MCP tool calls
- All CRUD operations return domain entities
- Mutations always return proposals
- Map Notion pages to domain entities

### References

- [Design Doc - Domain Layer](../.copilot/reports/design.md#32-domain-layer)
```

---

### EPIC-004: Query Builder

```markdown
---
title: "[EPIC-004] Query Builder"
labels: epic, priority-p1
---

## Epic Overview

**Epic ID**: EPIC-004
**Priority**: P1
**Estimated Effort**: M (8 hours)
**Target Milestone**: M2

### Description

Implement a fluent query builder API for constructing type-safe Notion database queries with filters, sorts, and pagination.

### Success Criteria

- [ ] Fluent API for building queries
- [ ] All Notion filter operators supported
- [ ] Compound filters (AND/OR) supported
- [ ] Pagination with cursors
- [ ] Convenience methods for common patterns

### Related Tasks

- [ ] #TASK-018 - Implement query builder

### Dependencies

- Depends on: EPIC-001
- Used by: EPIC-003

### Technical Notes

- Builds Notion filter object format
- Type-safe where possible
- Ergonomic API design

### References

- [Design Doc - Query Builder](../.copilot/reports/design.md#34-query-builder)
```

---

### EPIC-005: Safety Layer

```markdown
---
title: "[EPIC-005] Safety Layer"
labels: epic, priority-p0
---

## Epic Overview

**Epic ID**: EPIC-005
**Priority**: P0
**Estimated Effort**: L (24 hours)
**Target Milestone**: M3

### Description

Implement the safety layer enforcing the Propose → Approve → Apply workflow. All mutations must go through proposals with validation, diff generation, and batch limits.

### Success Criteria

- [ ] ProposalManager handles full lifecycle
- [ ] Proposals cannot be applied without approval
- [ ] Diff engine shows property changes
- [ ] Batch operations limited to 50 items
- [ ] Validation catches errors before execution

### Related Tasks

- [ ] #TASK-019 - Implement proposal manager
- [ ] #TASK-020 - Implement diff engine
- [ ] #TASK-021 - Implement batch limiter
- [ ] #TASK-022 - Implement validator

### Dependencies

- Depends on: EPIC-002
- Blocks: EPIC-006

### Technical Notes

- Core to SDK safety model
- Matches copilot-instructions.md workflow
- Must be used by all repositories

### References

- [Design Doc - Safety Layer](../.copilot/reports/design.md#33-safety-layer)
- [PRD - US-002](../.copilot/reports/requirements.md#us-002-safe-mutation-operations)
```

---

### EPIC-006: Workflows

```markdown
---
title: "[EPIC-006] Workflow Orchestration"
labels: epic, priority-p2
---

## Epic Overview

**Epic ID**: EPIC-006
**Priority**: P2
**Estimated Effort**: L (24 hours)
**Target Milestone**: M3

### Description

Implement high-level workflow orchestration for sprint cycles, daily standups, and analytics. Workflows compose repository operations into cohesive business processes.

### Success Criteria

- [ ] Sprint planning creates project + tasks + meetings
- [ ] Daily standup generates task summary by team
- [ ] Analytics provides team and project metrics
- [ ] All workflows use proposal system

### Related Tasks

- [ ] #TASK-023 - Implement sprint cycle workflow
- [ ] #TASK-024 - Implement daily standup workflow
- [ ] #TASK-025 - Implement analytics service

### Dependencies

- Depends on: EPIC-003, EPIC-005
- Blocks: EPIC-008

### Technical Notes

- Compose multiple repository calls
- Return aggregate proposals
- Generate formatted reports

### References

- [Design Doc - Workflows](../.copilot/reports/design.md)
```

---

### EPIC-007: Snapshot & Sync

```markdown
---
title: "[EPIC-007] Snapshot & Sync"
labels: epic, priority-p2
---

## Epic Overview

**Epic ID**: EPIC-007
**Priority**: P2
**Estimated Effort**: M (16 hours)
**Target Milestone**: M4

### Description

Implement snapshot parsing and comparison utilities to work with Notion exports in the snapshots/ directory. Enable drift detection between local exports and live Notion state.

### Success Criteria

- [ ] Parse Notion CSV exports correctly
- [ ] Load snapshots from snapshots/ directory
- [ ] Compare snapshot to live Notion data
- [ ] Generate diff reports

### Related Tasks

- [ ] #TASK-026 - Implement CSV parser
- [ ] #TASK-027 - Implement snapshot manager

### Dependencies

- Depends on: EPIC-001, EPIC-002

### Technical Notes

- Work with existing snapshots/notion-export-\* directories
- Parse CSV files with relation URLs
- Handle date formats

### References

- [Design Doc - Snapshot Parser](../.copilot/reports/design.md#35-snapshot-parser)
```

---

### EPIC-008: Documentation & Polish

```markdown
---
title: "[EPIC-008] Documentation & Polish"
labels: epic, priority-p1
---

## Epic Overview

**Epic ID**: EPIC-008
**Priority**: P1
**Estimated Effort**: M (16 hours)
**Target Milestone**: M4

### Description

Create comprehensive documentation, example workflows, and integration tests. Ensure the SDK is production-ready with good DX.

### Success Criteria

- [ ] README enables quick start in < 5 min
- [ ] All public APIs have JSDoc
- [ ] Example scripts work end-to-end
- [ ] 80%+ test coverage
- [ ] CI pipeline configured

### Related Tasks

- [ ] #TASK-028 - Write API documentation
- [ ] #TASK-029 - Create example workflows
- [ ] #TASK-030 - Write integration tests

### Dependencies

- Depends on: All previous epics

### Technical Notes

- Documentation is part of the product
- Examples demonstrate safety workflow

### References

- All documentation in .copilot/reports/
```

---

## Task Issues

### TASK-001: Initialize TypeScript project

````markdown
---
title: "[TASK-001] Initialize TypeScript project"
labels: task, priority-p0, epic-001
assignees: ""
---

## Task Details

**Task ID**: TASK-001
**Parent Epic**: #EPIC-001
**Priority**: P0
**Effort**: S (2-4 hours)

### Description

Set up the TypeScript project with pnpm, tsconfig, and build tooling. Create the foundational project structure for the Notionista SDK.

### Subtasks

- [ ] TASK-001.1: Create package.json with project metadata
- [ ] TASK-001.2: Configure tsconfig.json for strict TypeScript
- [ ] TASK-001.3: Set up tsup/esbuild for bundling
- [ ] TASK-001.4: Configure ESLint and Prettier
- [ ] TASK-001.5: Add Vitest for testing
- [ ] TASK-001.6: Create initial directory structure

### Acceptance Criteria

- [ ] `pnpm build` produces ESM and CJS outputs in dist/
- [ ] `pnpm test` runs Vitest test suite
- [ ] `pnpm lint` passes with zero errors
- [ ] TypeScript strict mode enabled
- [ ] Directory structure matches design doc

### Dependencies

- **Blocked by**: None
- **Blocks**: TASK-002, TASK-003, TASK-004

### Technical Implementation Notes

**Files to create**:

- `package.json`
- `tsconfig.json`
- `tsup.config.ts`
- `.eslintrc.js`
- `.prettierrc`
- `vitest.config.ts`
- `src/index.ts`

**Package.json dependencies**:

```json
{
  "devDependencies": {
    "typescript": "^5.3",
    "tsup": "^8.0",
    "vitest": "^2.0",
    "@typescript-eslint/eslint-plugin": "^7.0",
    "prettier": "^3.0"
  },
  "dependencies": {
    "zod": "^3.23"
  }
}
```
````

### Testing Requirements

- [ ] Build script produces valid output
- [ ] Test script runs sample test

### Definition of Done

- [ ] Code implemented
- [ ] Tests passing
- [ ] No lint errors
- [ ] PR approved

````

---

### TASK-002: Define core type system

```markdown
---
title: "[TASK-002] Define core type system"
labels: task, priority-p0, epic-001
assignees: ''
---

## Task Details

**Task ID**: TASK-002
**Parent Epic**: #EPIC-001
**Priority**: P0
**Effort**: M (4-8 hours)

### Description

Migrate and expand existing schemas.ts to comprehensive type definitions. Create strongly-typed constants for all database IDs and property types.

### Subtasks

- [ ] TASK-002.1: Create src/core/types/databases.ts with database IDs
- [ ] TASK-002.2: Create src/core/types/notion.ts for Notion API types
- [ ] TASK-002.3: Create src/core/types/mcp.ts for MCP protocol types
- [ ] TASK-002.4: Migrate schemas.ts to src/schemas/ with Zod
- [ ] TASK-002.5: Create property type enums (Status, Priority, Domain, etc.)
- [ ] TASK-002.6: Add JSDoc documentation to all exports

### Acceptance Criteria

- [ ] All 9 database IDs from copilot-instructions.md are defined
- [ ] All property types match Notion workspace schema
- [ ] Zod schemas validate at runtime
- [ ] Full IntelliSense support in IDE
- [ ] Existing schemas.ts logic preserved

### Dependencies

- **Blocked by**: TASK-001
- **Blocks**: TASK-004, TASK-011, TASK-012

### Technical Implementation Notes

**Files to create**:
- `src/core/types/databases.ts`
- `src/core/types/notion.ts`
- `src/core/types/mcp.ts`
- `src/core/types/index.ts`
- `src/schemas/team.schema.ts`
- `src/schemas/project.schema.ts`
- `src/schemas/task.schema.ts`
- `src/schemas/meeting.schema.ts`
- `src/schemas/index.ts`

**Reference**:
- Existing `schemas.ts` in project root
- Database IDs from `.github/copilot-instructions.md`

### Testing Requirements

- [ ] Unit tests for Zod schema validation
- [ ] Test invalid data is rejected

### Definition of Done

- [ ] Code implemented
- [ ] Tests passing
- [ ] No lint errors
- [ ] JSDoc documentation added
- [ ] PR approved
````

---

### TASK-005: Implement stdio transport

````markdown
---
title: "[TASK-005] Implement stdio transport"
labels: task, priority-p0, epic-002
assignees: ""
---

## Task Details

**Task ID**: TASK-005
**Parent Epic**: #EPIC-002
**Priority**: P0
**Effort**: M (4-8 hours)

### Description

Create the stdio transport layer for communicating with @notionhq/notion-mcp-server. Handle process spawning, JSON-RPC message parsing, and lifecycle management.

### Subtasks

- [ ] TASK-005.1: Create StdioTransport class
- [ ] TASK-005.2: Implement process spawning with npx
- [ ] TASK-005.3: Implement JSON-RPC message parsing
- [ ] TASK-005.4: Handle buffer management for partial reads
- [ ] TASK-005.5: Implement graceful shutdown
- [ ] TASK-005.6: Add event emitters for messages/errors/close

### Acceptance Criteria

- [ ] Successfully spawns MCP server process via `npx -y @notionhq/notion-mcp-server`
- [ ] Sends and receives JSON-RPC messages correctly
- [ ] Handles process crashes gracefully with error events
- [ ] Cleans up child process on disconnect
- [ ] Buffers partial messages until complete

### Dependencies

- **Blocked by**: TASK-001, TASK-003
- **Blocks**: TASK-006

### Technical Implementation Notes

**File to create**: `src/mcp/transport.ts`

**Key considerations**:

- Use Node.js `child_process.spawn()`
- Pass `NOTION_TOKEN` via env
- JSON-RPC 2.0 messages are newline-delimited
- Handle stdout buffering (messages may arrive in chunks)
- EventEmitter for async message handling

**Spawn command**:

```typescript
spawn("npx", ["-y", "@notionhq/notion-mcp-server"], {
  env: { ...process.env, NOTION_TOKEN: token },
  stdio: ["pipe", "pipe", "inherit"],
});
```
````

### Testing Requirements

- [ ] Unit test message parsing
- [ ] Unit test buffer handling
- [ ] Integration test with mock process

### Definition of Done

- [ ] Code implemented
- [ ] Tests passing
- [ ] No lint errors
- [ ] Error handling robust
- [ ] PR approved

````

---

### TASK-006: Implement MCP client

```markdown
---
title: "[TASK-006] Implement MCP client"
labels: task, priority-p0, epic-002
assignees: ''
---

## Task Details

**Task ID**: TASK-006
**Parent Epic**: #EPIC-002
**Priority**: P0
**Effort**: L (8-16 hours)

### Description

Create the main McpClient class with middleware support. This is the primary interface for invoking MCP tools.

### Subtasks

- [ ] TASK-006.1: Create McpClient class with options
- [ ] TASK-006.2: Implement middleware pipeline
- [ ] TASK-006.3: Implement callTool method
- [ ] TASK-006.4: Handle request/response correlation via message IDs
- [ ] TASK-006.5: Implement connect/disconnect lifecycle
- [ ] TASK-006.6: Add timeout handling for requests

### Acceptance Criteria

- [ ] `new McpClient({ notionToken }).connect()` establishes connection
- [ ] `callTool('API-query-data-source', {...})` returns typed results
- [ ] Middleware chain executes in order (rate limit → retry → logger)
- [ ] Request timeouts throw appropriate errors
- [ ] Multiple concurrent requests handled correctly

### Dependencies

- **Blocked by**: TASK-005
- **Blocks**: TASK-007, TASK-008, TASK-009, TASK-010, TASK-011

### Technical Implementation Notes

**File to create**: `src/mcp/client.ts`

**Middleware pattern**:
```typescript
type Middleware = (
  req: McpRequest,
  next: () => Promise<McpResponse>
) => Promise<McpResponse>;
````

**Request correlation**:

- Assign incrementing IDs to requests
- Store pending promises in Map<id, resolver>
- Match responses by ID

### Testing Requirements

- [ ] Unit test middleware chain
- [ ] Unit test request correlation
- [ ] Integration test with transport

### Definition of Done

- [ ] Code implemented
- [ ] Tests passing
- [ ] No lint errors
- [ ] JSDoc documentation
- [ ] PR approved

````

---

### TASK-012: Implement base repository

```markdown
---
title: "[TASK-012] Implement base repository"
labels: task, priority-p0, epic-003
assignees: ''
---

## Task Details

**Task ID**: TASK-012
**Parent Epic**: #EPIC-003
**Priority**: P0
**Effort**: L (8-16 hours)

### Description

Create abstract BaseRepository class with common CRUD operations. All mutations return ChangeProposal instead of executing directly.

### Subtasks

- [ ] TASK-012.1: Define repository interface
- [ ] TASK-012.2: Implement findMany with query builder support
- [ ] TASK-012.3: Implement findById
- [ ] TASK-012.4: Implement create (returns proposal)
- [ ] TASK-012.5: Implement update (returns proposal)
- [ ] TASK-012.6: Implement delete (returns proposal)
- [ ] TASK-012.7: Add abstract mapping methods (toDomainEntity, toNotionProperties)

### Acceptance Criteria

- [ ] All mutations return ChangeProposal, not executed directly
- [ ] Query methods return domain entities (not raw Notion pages)
- [ ] Supports pagination via cursor
- [ ] Type-safe generics for entity types
- [ ] Abstract methods force concrete implementations

### Dependencies

- **Blocked by**: TASK-006, TASK-002, TASK-019
- **Blocks**: TASK-013, TASK-014, TASK-015, TASK-016

### Technical Implementation Notes

**File to create**: `src/domain/repositories/base.repository.ts`

**Generic signature**:
```typescript
abstract class BaseRepository<
  TEntity,
  TCreateInput,
  TUpdateInput,
  TSchema extends z.ZodType
>
````

**Key methods**:

- `findMany(query?: QueryBuilder): Promise<TEntity[]>`
- `findById(id: string): Promise<TEntity | null>`
- `create(input: TCreateInput): Promise<ChangeProposal<TEntity>>`
- `update(id: string, input: TUpdateInput): Promise<ChangeProposal<TEntity>>`

### Testing Requirements

- [ ] Unit test with mock MCP client
- [ ] Test proposal generation
- [ ] Test entity mapping

### Definition of Done

- [ ] Code implemented
- [ ] Tests passing
- [ ] No lint errors
- [ ] JSDoc documentation
- [ ] PR approved

````

---

### TASK-019: Implement proposal manager

```markdown
---
title: "[TASK-019] Implement proposal manager"
labels: task, priority-p0, epic-005
assignees: ''
---

## Task Details

**Task ID**: TASK-019
**Parent Epic**: #EPIC-005
**Priority**: P0
**Effort**: L (8-16 hours)

### Description

Create the core proposal management system implementing Propose → Approve → Apply workflow.

### Subtasks

- [ ] TASK-019.1: Define ChangeProposal interface
- [ ] TASK-019.2: Implement propose() method
- [ ] TASK-019.3: Implement approve() method
- [ ] TASK-019.4: Implement apply() method
- [ ] TASK-019.5: Implement reject() method
- [ ] TASK-019.6: Implement formatForReview() for human-readable output
- [ ] TASK-019.7: Track proposal history

### Acceptance Criteria

- [ ] Proposals stored with unique UUIDs
- [ ] Status transitions enforced (pending → approved → applied)
- [ ] Cannot apply without prior approval
- [ ] Cannot approve already-applied proposals
- [ ] formatForReview produces readable markdown
- [ ] History queryable

### Dependencies

- **Blocked by**: TASK-006
- **Blocks**: TASK-012, TASK-020, TASK-021

### Technical Implementation Notes

**File to create**: `src/safety/proposal.ts`

**ChangeProposal interface**:
```typescript
interface ChangeProposal<T> {
  id: string;
  type: 'create' | 'update' | 'delete' | 'bulk';
  target: { database: string; pageId?: string };
  currentState: T | null;
  proposedState: T;
  diff: PropertyDiff[];
  sideEffects: SideEffect[];
  validation: ValidationResult;
  status: 'pending' | 'approved' | 'applied' | 'rejected' | 'failed';
  createdAt: Date;
}
````

**State machine**:

- pending → approved (via approve())
- approved → applied (via apply())
- pending → rejected (via reject())
- approved → failed (if apply() throws)

### Testing Requirements

- [ ] Unit test state transitions
- [ ] Unit test invalid transitions throw
- [ ] Unit test formatForReview output

### Definition of Done

- [ ] Code implemented
- [ ] Tests passing
- [ ] No lint errors
- [ ] JSDoc documentation
- [ ] PR approved

````

---

### TASK-023: Implement sprint cycle workflow

```markdown
---
title: "[TASK-023] Implement sprint cycle workflow"
labels: task, priority-p2, epic-006
assignees: ''
---

## Task Details

**Task ID**: TASK-023
**Parent Epic**: #EPIC-006
**Priority**: P2
**Effort**: L (8-16 hours)

### Description

Create workflow for sprint planning and execution. A single call should create a project with linked tasks and meetings, returning proposals for review.

### Subtasks

- [ ] TASK-023.1: Define SprintConfig interface
- [ ] TASK-023.2: Implement planSprint() returning aggregate proposals
- [ ] TASK-023.3: Create project with proper properties
- [ ] TASK-023.4: Create linked tasks with project relation
- [ ] TASK-023.5: Create sprint meetings (planning, daily standup template, retro)
- [ ] TASK-023.6: Implement executeSprint() to apply all proposals
- [ ] TASK-023.7: Generate sprint report with metrics

### Acceptance Criteria

- [ ] `planSprint(config)` creates project + N tasks + 3 meetings
- [ ] All items properly linked via Notion relations
- [ ] Returns SprintProposal with all sub-proposals
- [ ] executeSprint applies in correct dependency order
- [ ] Report shows task count, dates, team assignment

### Dependencies

- **Blocked by**: TASK-014, TASK-015, TASK-016, TASK-019
- **Blocks**: TASK-029

### Technical Implementation Notes

**File to create**: `src/workflows/sprint-cycle.ts`

**SprintConfig interface**:
```typescript
interface SprintConfig {
  teamId: string;
  name: string;
  startDate: Date;
  endDate: Date;
  milestone: Milestone;
  phase: Phase;
  domain: Domain;
  tasks: TaskInput[];
}
````

**Execution order**:

1. Create project first (get ID)
2. Create tasks with project relation
3. Create meetings with project and team relations

### Testing Requirements

- [ ] Unit test proposal aggregation
- [ ] Integration test with mock repositories

### Definition of Done

- [ ] Code implemented
- [ ] Tests passing
- [ ] No lint errors
- [ ] JSDoc documentation
- [ ] Example workflow documented
- [ ] PR approved

````

---

### TASK-026: Implement CSV parser

```markdown
---
title: "[TASK-026] Implement CSV parser"
labels: task, priority-p2, epic-007
assignees: ''
---

## Task Details

**Task ID**: TASK-026
**Parent Epic**: #EPIC-007
**Priority**: P2
**Effort**: M (4-8 hours)

### Description

Create parser for Notion CSV exports found in snapshots/ directory. Extract page IDs, normalize property values, and handle relation references.

### Subtasks

- [ ] TASK-026.1: Parse standard CSV format
- [ ] TASK-026.2: Extract page IDs from Notion URLs in cells
- [ ] TASK-026.3: Normalize property values (dates, booleans, etc.)
- [ ] TASK-026.4: Handle relation references (URLs with IDs)
- [ ] TASK-026.5: Parse all database CSVs in snapshot

### Acceptance Criteria

- [ ] Parses Teams, Tasks, Projects CSVs correctly
- [ ] Extracts page IDs from URLs like `notion.so/2d5a4e63...`
- [ ] Handles special characters in text
- [ ] Returns typed SnapshotRecord[]

### Dependencies

- **Blocked by**: TASK-002
- **Blocks**: TASK-027

### Technical Implementation Notes

**File to create**: `src/sync/parser/csv.ts`

**Sample CSV format** (from snapshots/):
```csv
Name,Created time,Project,Done,Meetings,Task Code,Team
"T03 Align team OKRs","January 5, 2026",OPS-M1-P1.1 (https://notion.so/...),No,Meeting (https://...),TO3,Operations Team (https://...)
````

**Parsing challenges**:

- URLs embedded in cell values
- Multiple relation URLs in one cell
- Date format: "January 5, 2026 10:40 AM"

**Use csv-parse library**:

```typescript
import { parse } from "csv-parse/sync";
```

### Testing Requirements

- [ ] Unit test with fixture CSVs from snapshots/
- [ ] Test ID extraction
- [ ] Test relation parsing

### Definition of Done

- [ ] Code implemented
- [ ] Tests passing
- [ ] No lint errors
- [ ] PR approved

```

---

## Quick Reference: All Tasks by Epic

### Epic 1: Foundation (P0)
- TASK-001: Initialize TypeScript project [S]
- TASK-002: Define core type system [M]
- TASK-003: Create error hierarchy [S]
- TASK-004: Create database configuration [S]

### Epic 2: MCP Client (P0)
- TASK-005: Implement stdio transport [M]
- TASK-006: Implement MCP client [L]
- TASK-007: Implement rate limiter middleware [S]
- TASK-008: Implement retry middleware [S]
- TASK-009: Implement logger middleware [XS]
- TASK-010: Implement cache middleware [M]
- TASK-011: Create tool wrappers [M]

### Epic 3: Domain (P1)
- TASK-012: Implement base repository [L]
- TASK-013: Implement TeamRepository [M]
- TASK-014: Implement ProjectRepository [M]
- TASK-015: Implement TaskRepository [M]
- TASK-016: Implement MeetingRepository [M]
- TASK-017: Create domain entities [S]

### Epic 4: Query (P1)
- TASK-018: Implement query builder [M]

### Epic 5: Safety (P0)
- TASK-019: Implement proposal manager [L]
- TASK-020: Implement diff engine [M]
- TASK-021: Implement batch limiter [S]
- TASK-022: Implement validator [M]

### Epic 6: Workflows (P2)
- TASK-023: Implement sprint cycle workflow [L]
- TASK-024: Implement daily standup workflow [M]
- TASK-025: Implement analytics service [M]

### Epic 7: Snapshot (P2)
- TASK-026: Implement CSV parser [M]
- TASK-027: Implement snapshot manager [M]

### Epic 8: Docs (P1)
- TASK-028: Write API documentation [M]
- TASK-029: Create example workflows [S]
- TASK-030: Write integration tests [L]
```
