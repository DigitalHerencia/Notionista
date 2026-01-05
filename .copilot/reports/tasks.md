# Implementation Tasks

## Notionista SDK – Development Backlog

**Version**: 1.0.0  
**Date**: January 5, 2026  
**Status**: Planning

---

## Overview

This document breaks down the Notionista SDK implementation into trackable tasks organized by epic. Each task includes estimated effort, dependencies, and acceptance criteria.

### Effort Scale

| Size | Hours | Description                    |
| ---- | ----- | ------------------------------ |
| XS   | 1-2   | Trivial change, single file    |
| S    | 2-4   | Small feature, few files       |
| M    | 4-8   | Medium feature, multiple files |
| L    | 8-16  | Large feature, cross-cutting   |
| XL   | 16-32 | Epic-level work, multiple PRs  |

### Priority Scale

| Priority | Description                                 |
| -------- | ------------------------------------------- |
| P0       | Critical blocker, do first                  |
| P1       | High priority, core functionality           |
| P2       | Medium priority, important but not blocking |
| P3       | Low priority, nice to have                  |

---

## Epic 1: Project Foundation

### TASK-001: Initialize TypeScript project

- **Priority**: P0
- **Effort**: S
- **Dependencies**: None
- **Assignee**: TBD

**Description**:
Set up the TypeScript project with pnpm, tsconfig, and build tooling.

**Subtasks**:

- [ ] TASK-001.1: Create package.json with project metadata
- [ ] TASK-001.2: Configure tsconfig.json for strict TypeScript
- [ ] TASK-001.3: Set up tsup/esbuild for bundling
- [ ] TASK-001.4: Configure ESLint and Prettier
- [ ] TASK-001.5: Add Vitest for testing
- [ ] TASK-001.6: Create initial directory structure

**Acceptance Criteria**:

- `pnpm build` produces ESM and CJS outputs
- `pnpm test` runs test suite
- `pnpm lint` passes with zero errors
- TypeScript strict mode enabled

---

### TASK-002: Define core type system

- **Priority**: P0
- **Effort**: M
- **Dependencies**: TASK-001
- **Assignee**: TBD

**Description**:
Migrate and expand existing schemas.ts to comprehensive type definitions.

**Subtasks**:

- [ ] TASK-002.1: Create src/core/types/databases.ts with database IDs
- [ ] TASK-002.2: Create src/core/types/notion.ts for Notion API types
- [ ] TASK-002.3: Create src/core/types/mcp.ts for MCP protocol types
- [ ] TASK-002.4: Migrate schemas.ts to src/schemas/ with Zod
- [ ] TASK-002.5: Create property type enums (Status, Priority, Domain, etc.)
- [ ] TASK-002.6: Add JSDoc documentation to all exports

**Acceptance Criteria**:

- All database IDs from copilot-instructions.md are defined
- All property types match Notion workspace schema
- Zod schemas validate at runtime
- Full IntelliSense in IDE

---

### TASK-003: Create error hierarchy

- **Priority**: P1
- **Effort**: S
- **Dependencies**: TASK-001
- **Assignee**: TBD

**Description**:
Implement custom error classes for SDK-specific error handling.

**Subtasks**:

- [ ] TASK-003.1: Create base NotionistError class
- [ ] TASK-003.2: Create MCP-specific errors
- [ ] TASK-003.3: Create validation errors
- [ ] TASK-003.4: Create proposal/safety errors
- [ ] TASK-003.5: Add error codes and recovery hints

**Acceptance Criteria**:

- All errors extend NotionistError
- Each error has unique code
- Errors include `recoverable` flag
- Error messages are actionable

---

### TASK-004: Create database configuration

- **Priority**: P1
- **Effort**: S
- **Dependencies**: TASK-002
- **Assignee**: TBD

**Description**:
Create JSON configuration for database mappings and property schemas.

**Subtasks**:

- [ ] TASK-004.1: Create config/databases.json
- [ ] TASK-004.2: Define property mappings for all 9 databases
- [ ] TASK-004.3: Create config loader utility
- [ ] TASK-004.4: Validate config against Zod schema

**Acceptance Criteria**:

- All databases from copilot-instructions.md configured
- Property names match Notion workspace
- Configuration is type-safe

---

## Epic 2: MCP Client Layer

### TASK-005: Implement stdio transport

- **Priority**: P0
- **Effort**: M
- **Dependencies**: TASK-001, TASK-003
- **Assignee**: TBD

**Description**:
Create the stdio transport layer for communicating with @notionhq/notion-mcp-server.

**Subtasks**:

- [ ] TASK-005.1: Create StdioTransport class
- [ ] TASK-005.2: Implement process spawning with npx
- [ ] TASK-005.3: Implement JSON-RPC message parsing
- [ ] TASK-005.4: Handle buffer management for partial reads
- [ ] TASK-005.5: Implement graceful shutdown
- [ ] TASK-005.6: Add event emitters for messages/errors/close

**Acceptance Criteria**:

- Successfully spawns MCP server process
- Sends and receives JSON-RPC messages
- Handles process crashes gracefully
- Cleans up on disconnect

---

### TASK-006: Implement MCP client

- **Priority**: P0
- **Effort**: L
- **Dependencies**: TASK-005
- **Assignee**: TBD

**Description**:
Create the main McpClient class with middleware support.

**Subtasks**:

- [ ] TASK-006.1: Create McpClient class with options
- [ ] TASK-006.2: Implement middleware pipeline
- [ ] TASK-006.3: Implement callTool method
- [ ] TASK-006.4: Handle request/response correlation
- [ ] TASK-006.5: Implement connect/disconnect lifecycle
- [ ] TASK-006.6: Add timeout handling

**Acceptance Criteria**:

- `new McpClient({ notionToken }).connect()` works
- `callTool('API-query-data-source', {...})` returns results
- Middleware chain executes in order
- Handles timeouts and retries

---

### TASK-007: Implement rate limiter middleware

- **Priority**: P1
- **Effort**: S
- **Dependencies**: TASK-006
- **Assignee**: TBD

**Description**:
Create rate limiting middleware to respect Notion API limits.

**Subtasks**:

- [ ] TASK-007.1: Implement token bucket algorithm
- [ ] TASK-007.2: Configure 3 req/sec default
- [ ] TASK-007.3: Add queue with backpressure
- [ ] TASK-007.4: Add metrics for rate limit hits

**Acceptance Criteria**:

- Limits requests to configured rate
- Queues excess requests
- Throws after configurable timeout
- Logs rate limit events

---

### TASK-008: Implement retry middleware

- **Priority**: P1
- **Effort**: S
- **Dependencies**: TASK-006
- **Assignee**: TBD

**Description**:
Create retry middleware with exponential backoff.

**Subtasks**:

- [ ] TASK-008.1: Implement exponential backoff
- [ ] TASK-008.2: Configure max retries (default 3)
- [ ] TASK-008.3: Detect retryable errors
- [ ] TASK-008.4: Add jitter to prevent thundering herd

**Acceptance Criteria**:

- Retries on transient failures
- Uses exponential backoff
- Stops after max retries
- Passes through non-retryable errors

---

### TASK-009: Implement logger middleware

- **Priority**: P2
- **Effort**: XS
- **Dependencies**: TASK-006
- **Assignee**: TBD

**Description**:
Create logging middleware for debugging.

**Subtasks**:

- [ ] TASK-009.1: Log request tool and params
- [ ] TASK-009.2: Log response timing
- [ ] TASK-009.3: Log errors with context
- [ ] TASK-009.4: Add debug mode toggle

**Acceptance Criteria**:

- Logs all MCP calls when enabled
- Includes timing information
- Respects debug flag
- Does not log in production by default

---

### TASK-010: Implement cache middleware

- **Priority**: P2
- **Effort**: M
- **Dependencies**: TASK-006
- **Assignee**: TBD

**Description**:
Create response caching middleware.

**Subtasks**:

- [ ] TASK-010.1: Implement LRU cache
- [ ] TASK-010.2: Configure TTL (default 5 min)
- [ ] TASK-010.3: Create cache key from tool + params
- [ ] TASK-010.4: Add cache invalidation hooks
- [ ] TASK-010.5: Add cache hit/miss metrics

**Acceptance Criteria**:

- Caches read-only tool responses
- Respects TTL configuration
- LRU eviction when full
- Can be disabled per-request

---

### TASK-011: Create tool wrappers

- **Priority**: P1
- **Effort**: M
- **Dependencies**: TASK-006, TASK-002
- **Assignee**: TBD

**Description**:
Create typed wrapper functions for each MCP tool.

**Subtasks**:

- [ ] TASK-011.1: Create src/mcp/tools/databases.ts
- [ ] TASK-011.2: Create src/mcp/tools/pages.ts
- [ ] TASK-011.3: Create src/mcp/tools/blocks.ts
- [ ] TASK-011.4: Create src/mcp/tools/search.ts
- [ ] TASK-011.5: Create src/mcp/tools/users.ts
- [ ] TASK-011.6: Create src/mcp/tools/comments.ts

**Acceptance Criteria**:

- Each tool has typed parameters and return type
- Wraps McpClient.callTool
- Validates inputs with Zod
- Includes JSDoc documentation

---

## Epic 3: Domain Layer

### TASK-012: Implement base repository

- **Priority**: P0
- **Effort**: L
- **Dependencies**: TASK-006, TASK-002
- **Assignee**: TBD

**Description**:
Create abstract BaseRepository class with common CRUD operations.

**Subtasks**:

- [ ] TASK-012.1: Define repository interface
- [ ] TASK-012.2: Implement findMany with query builder
- [ ] TASK-012.3: Implement findById
- [ ] TASK-012.4: Implement create (returns proposal)
- [ ] TASK-012.5: Implement update (returns proposal)
- [ ] TASK-012.6: Implement delete (returns proposal)
- [ ] TASK-012.7: Add abstract mapping methods

**Acceptance Criteria**:

- All mutations return ChangeProposal
- Query methods return domain entities
- Supports pagination
- Type-safe generics

---

### TASK-013: Implement TeamRepository

- **Priority**: P1
- **Effort**: M
- **Dependencies**: TASK-012
- **Assignee**: TBD

**Description**:
Create repository for Teams database.

**Subtasks**:

- [ ] TASK-013.1: Implement toDomainEntity mapping
- [ ] TASK-013.2: Implement toNotionProperties mapping
- [ ] TASK-013.3: Add findByName method
- [ ] TASK-013.4: Add findWithProjects (eager load)
- [ ] TASK-013.5: Add getMetrics method

**Acceptance Criteria**:

- Maps all Team properties
- Handles relation properties
- Returns typed Team entities

---

### TASK-014: Implement ProjectRepository

- **Priority**: P1
- **Effort**: M
- **Dependencies**: TASK-012
- **Assignee**: TBD

**Description**:
Create repository for Projects database.

**Subtasks**:

- [ ] TASK-014.1: Implement property mappings
- [ ] TASK-014.2: Add findByTeam method
- [ ] TASK-014.3: Add findByStatus method
- [ ] TASK-014.4: Add findByMilestone method
- [ ] TASK-014.5: Add findActive (status=Active)

**Acceptance Criteria**:

- Maps all Project properties including selects
- Handles date properties
- Supports filtered queries

---

### TASK-015: Implement TaskRepository

- **Priority**: P1
- **Effort**: M
- **Dependencies**: TASK-012
- **Assignee**: TBD

**Description**:
Create repository for Tasks database.

**Subtasks**:

- [ ] TASK-015.1: Implement property mappings
- [ ] TASK-015.2: Add findIncompleteByTeam method
- [ ] TASK-015.3: Add findDueToday method
- [ ] TASK-015.4: Add findByProject method
- [ ] TASK-015.5: Add markDone convenience method
- [ ] TASK-015.6: Add findOverdue method

**Acceptance Criteria**:

- Maps all Task properties
- Checkbox property handled correctly
- Formula properties read-only

---

### TASK-016: Implement MeetingRepository

- **Priority**: P1
- **Effort**: M
- **Dependencies**: TASK-012
- **Assignee**: TBD

**Description**:
Create repository for Meetings database.

**Subtasks**:

- [ ] TASK-016.1: Implement property mappings
- [ ] TASK-016.2: Add findByDate method
- [ ] TASK-016.3: Add findByTeam method
- [ ] TASK-016.4: Add findByType method
- [ ] TASK-016.5: Add findUpcoming method

**Acceptance Criteria**:

- Maps all Meeting properties
- Handles multi-relation properties
- Date filtering works correctly

---

### TASK-017: Create domain entities

- **Priority**: P1
- **Effort**: S
- **Dependencies**: TASK-002
- **Assignee**: TBD

**Description**:
Create domain entity classes with behavior.

**Subtasks**:

- [ ] TASK-017.1: Create BaseEntity class
- [ ] TASK-017.2: Create Team entity
- [ ] TASK-017.3: Create Project entity
- [ ] TASK-017.4: Create Task entity
- [ ] TASK-017.5: Create Meeting entity

**Acceptance Criteria**:

- Entities have computed properties
- Entities validate on construction
- Entities are immutable

---

## Epic 4: Query Builder

### TASK-018: Implement query builder

- **Priority**: P1
- **Effort**: M
- **Dependencies**: TASK-002
- **Assignee**: TBD

**Description**:
Create fluent query builder API.

**Subtasks**:

- [ ] TASK-018.1: Create QueryBuilder class
- [ ] TASK-018.2: Implement where() method
- [ ] TASK-018.3: Implement and()/or() compound filters
- [ ] TASK-018.4: Implement orderBy() method
- [ ] TASK-018.5: Implement limit() and pagination
- [ ] TASK-018.6: Implement build() to Notion filter format
- [ ] TASK-018.7: Add convenience methods (whereChecked, whereRelation)

**Acceptance Criteria**:

- Fluent API chains correctly
- Builds valid Notion filter objects
- Type-safe property names (stretch)
- Handles all filter operators

---

## Epic 5: Safety Layer

### TASK-019: Implement proposal manager

- **Priority**: P0
- **Effort**: L
- **Dependencies**: TASK-006
- **Assignee**: TBD

**Description**:
Create the core proposal management system.

**Subtasks**:

- [ ] TASK-019.1: Define ChangeProposal interface
- [ ] TASK-019.2: Implement propose() method
- [ ] TASK-019.3: Implement approve() method
- [ ] TASK-019.4: Implement apply() method
- [ ] TASK-019.5: Implement reject() method
- [ ] TASK-019.6: Implement formatForReview() for human-readable output
- [ ] TASK-019.7: Track proposal history

**Acceptance Criteria**:

- Proposals stored with unique IDs
- Status transitions enforced
- Cannot apply without approval
- Formatted output is readable

---

### TASK-020: Implement diff engine

- **Priority**: P1
- **Effort**: M
- **Dependencies**: TASK-019
- **Assignee**: TBD

**Description**:
Create diff utilities for comparing states.

**Subtasks**:

- [ ] TASK-020.1: Implement property diff calculation
- [ ] TASK-020.2: Assign impact levels (low/medium/high)
- [ ] TASK-020.3: Detect relation changes
- [ ] TASK-020.4: Format diff as markdown

**Acceptance Criteria**:

- Detects all property changes
- Correctly identifies additions/removals
- Impact levels assigned by property type

---

### TASK-021: Implement batch limiter

- **Priority**: P1
- **Effort**: S
- **Dependencies**: TASK-019
- **Assignee**: TBD

**Description**:
Enforce batch size limits for bulk operations.

**Subtasks**:

- [ ] TASK-021.1: Create BatchLimiter class
- [ ] TASK-021.2: Configure max batch size (50)
- [ ] TASK-021.3: Generate dry-run summaries
- [ ] TASK-021.4: Track progress for large batches

**Acceptance Criteria**:

- Rejects batches over limit
- Provides clear error messages
- Dry-run shows what would change

---

### TASK-022: Implement validator

- **Priority**: P1
- **Effort**: M
- **Dependencies**: TASK-002
- **Assignee**: TBD

**Description**:
Create pre-change validation utilities.

**Subtasks**:

- [ ] TASK-022.1: Validate required properties
- [ ] TASK-022.2: Validate select option values
- [ ] TASK-022.3: Validate relation targets exist
- [ ] TASK-022.4: Validate date formats
- [ ] TASK-022.5: Generate warnings for suspicious changes

**Acceptance Criteria**:

- Catches invalid data before MCP call
- Returns structured validation result
- Distinguishes errors from warnings

---

## Epic 6: Workflows

### TASK-023: Implement sprint cycle workflow

- **Priority**: P2
- **Effort**: L
- **Dependencies**: TASK-014, TASK-015, TASK-016, TASK-019
- **Assignee**: TBD

**Description**:
Create workflow for sprint planning and execution.

**Subtasks**:

- [ ] TASK-023.1: Define SprintConfig interface
- [ ] TASK-023.2: Implement planSprint() returning proposals
- [ ] TASK-023.3: Create project with proper properties
- [ ] TASK-023.4: Create linked tasks
- [ ] TASK-023.5: Create sprint meetings (planning, standup template, retro)
- [ ] TASK-023.6: Implement executeSprint() to apply proposals
- [ ] TASK-023.7: Generate sprint report

**Acceptance Criteria**:

- Single call creates project + tasks + meetings
- All items properly linked via relations
- Returns proposals for review
- Report shows progress metrics

---

### TASK-024: Implement daily standup workflow

- **Priority**: P2
- **Effort**: M
- **Dependencies**: TASK-015, TASK-016
- **Assignee**: TBD

**Description**:
Create workflow for daily standup management.

**Subtasks**:

- [ ] TASK-024.1: Query tasks due today by team
- [ ] TASK-024.2: Query incomplete tasks by team
- [ ] TASK-024.3: Generate standup summary
- [ ] TASK-024.4: Create/update today's standup meeting
- [ ] TASK-024.5: Link action items to meeting

**Acceptance Criteria**:

- Shows relevant tasks per team
- Formats nicely for standup
- Updates meeting with action items

---

### TASK-025: Implement analytics service

- **Priority**: P2
- **Effort**: M
- **Dependencies**: TASK-013, TASK-014, TASK-015
- **Assignee**: TBD

**Description**:
Create service for workspace analytics.

**Subtasks**:

- [ ] TASK-025.1: Implement getTeamMetrics()
- [ ] TASK-025.2: Implement getProjectProgress()
- [ ] TASK-025.3: Implement getCompletionRates()
- [ ] TASK-025.4: Implement getOverdueTasks()
- [ ] TASK-025.5: Format reports as markdown

**Acceptance Criteria**:

- Aggregates data across databases
- Returns typed metrics objects
- Markdown output is readable

---

## Epic 7: Snapshot & Sync

### TASK-026: Implement CSV parser

- **Priority**: P2
- **Effort**: M
- **Dependencies**: TASK-002
- **Assignee**: TBD

**Description**:
Create parser for Notion CSV exports.

**Subtasks**:

- [ ] TASK-026.1: Parse standard CSV format
- [ ] TASK-026.2: Extract page IDs from URLs
- [ ] TASK-026.3: Normalize property values
- [ ] TASK-026.4: Handle relation references
- [ ] TASK-026.5: Parse all databases in snapshot

**Acceptance Criteria**:

- Parses Teams, Tasks, Projects CSVs
- Extracts page IDs correctly
- Handles special characters

---

### TASK-027: Implement snapshot manager

- **Priority**: P2
- **Effort**: M
- **Dependencies**: TASK-026
- **Assignee**: TBD

**Description**:
Create snapshot management utilities.

**Subtasks**:

- [ ] TASK-027.1: Load snapshot from directory
- [ ] TASK-027.2: Compare snapshot to live state
- [ ] TASK-027.3: Generate diff report
- [ ] TASK-027.4: Detect additions/removals/changes
- [ ] TASK-027.5: Export current state to snapshot format

**Acceptance Criteria**:

- Loads snapshots/notion-export-\* directories
- Compares to live Notion data
- Reports drift clearly

---

## Epic 8: Documentation & Polish

### TASK-028: Write API documentation

- **Priority**: P1
- **Effort**: M
- **Dependencies**: All implementation tasks
- **Assignee**: TBD

**Description**:
Create comprehensive API documentation.

**Subtasks**:

- [ ] TASK-028.1: Write README.md with quick start
- [ ] TASK-028.2: Document all public exports
- [ ] TASK-028.3: Add code examples
- [ ] TASK-028.4: Document configuration options
- [ ] TASK-028.5: Add troubleshooting guide

**Acceptance Criteria**:

- README gets developer started in < 5 min
- All public APIs documented
- Examples are runnable

---

### TASK-029: Create example workflows

- **Priority**: P2
- **Effort**: S
- **Dependencies**: TASK-023, TASK-024
- **Assignee**: TBD

**Description**:
Create example scripts demonstrating SDK usage.

**Subtasks**:

- [ ] TASK-029.1: Example: Query tasks by team
- [ ] TASK-029.2: Example: Create sprint with tasks
- [ ] TASK-029.3: Example: Daily standup report
- [ ] TASK-029.4: Example: Bulk task update with approval

**Acceptance Criteria**:

- Examples are self-contained
- Examples run against live workspace
- Examples demonstrate safety workflow

---

### TASK-030: Write integration tests

- **Priority**: P1
- **Effort**: L
- **Dependencies**: All Epic 2-6 tasks
- **Assignee**: TBD

**Description**:
Create integration test suite.

**Subtasks**:

- [ ] TASK-030.1: Set up test fixtures
- [ ] TASK-030.2: Test MCP client connection
- [ ] TASK-030.3: Test repository CRUD operations
- [ ] TASK-030.4: Test workflow execution
- [ ] TASK-030.5: Test proposal workflow end-to-end

**Acceptance Criteria**:

- 80%+ code coverage
- Tests run in CI
- Uses fixtures (not live API by default)

---

## Task Summary

| Epic          | Tasks  | Estimated Hours |
| ------------- | ------ | --------------- |
| 1. Foundation | 4      | 16              |
| 2. MCP Client | 7      | 32              |
| 3. Domain     | 6      | 32              |
| 4. Query      | 1      | 8               |
| 5. Safety     | 4      | 24              |
| 6. Workflows  | 3      | 24              |
| 7. Snapshot   | 2      | 16              |
| 8. Docs       | 3      | 16              |
| **Total**     | **30** | **168**         |

---

## Milestone Plan

### Milestone 1: Core SDK (Week 1-2)

Tasks: TASK-001 through TASK-012

**Goal**: Working MCP client with base repository

### Milestone 2: Domain Layer (Week 3)

Tasks: TASK-013 through TASK-018

**Goal**: All repositories and query builder complete

### Milestone 3: Safety & Workflows (Week 4)

Tasks: TASK-019 through TASK-025

**Goal**: Full proposal workflow and sprint automation

### Milestone 4: Polish (Week 5)

Tasks: TASK-026 through TASK-030

**Goal**: Documentation, snapshots, and testing complete
