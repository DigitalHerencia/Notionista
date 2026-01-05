# Product Requirements Document (PRD)

## Notionista SDK – TypeScript Interface for Notion MCP Server

**Version**: 1.0.0  
**Date**: January 5, 2026  
**Status**: Draft  
**Owner**: Engineering Team

---

## 1. Executive Summary

Notionista SDK is a TypeScript library that provides a type-safe, developer-friendly interface for interacting with Notion workspaces via the official `@notionhq/notion-mcp-server`. The SDK abstracts MCP protocol complexity, enforces safety workflows, and enables advanced automation use cases for the Digital Herencia team workspace.

### 1.1 Problem Statement

**Current State:**

- The `@notionhq/notion-mcp-server` exposes raw MCP tools requiring manual JSON construction
- No type safety for Notion property schemas, database IDs, or relation mappings
- No built-in safety mechanisms for destructive or bulk operations
- Integration requires deep knowledge of both MCP protocol and Notion API semantics
- No local caching, snapshot comparison, or conflict detection capabilities

**Desired State:**

- Strongly-typed TypeScript SDK with full IntelliSense support
- Repository pattern abstracting database operations
- Built-in Propose → Approve → Apply workflow for safe mutations
- Snapshot and diff capabilities leveraging local Notion exports
- Workflow orchestration for sprint cycles, team management, and reporting

### 1.2 Success Metrics

| Metric               | Target   | Measurement                      |
| -------------------- | -------- | -------------------------------- |
| Type Coverage        | 100%     | All public APIs fully typed      |
| Test Coverage        | ≥80%     | Unit + integration tests         |
| Safety Compliance    | 100%     | All writes use proposal workflow |
| Developer Experience | <5 min   | Time to first successful query   |
| Documentation        | Complete | All public APIs documented       |

---

## 2. User Stories & Requirements (EARS Notation)

### 2.1 Core SDK Functionality

#### US-001: Type-Safe Database Queries

**As a** developer automating Notion workflows  
**I want** to query databases with full TypeScript type safety  
**So that** I catch schema errors at compile time rather than runtime

**Requirements:**

- **REQ-001**: WHEN querying a database, THE SYSTEM SHALL return results typed to the database schema
- **REQ-002**: WHEN building a filter, THE SYSTEM SHALL validate property names and value types at compile time
- **REQ-003**: WHEN a query returns results, THE SYSTEM SHALL transform Notion API responses to domain entities

#### US-002: Safe Mutation Operations

**As a** developer modifying Notion data  
**I want** all mutations to go through a proposal workflow  
**So that** I can review changes before they are applied

**Requirements:**

- **REQ-004**: WHEN creating or updating a page, THE SYSTEM SHALL generate a ChangeProposal
- **REQ-005**: THE SYSTEM SHALL NOT execute any write operation without explicit approval
- **REQ-006**: WHEN a proposal is approved, THE SYSTEM SHALL execute the minimal set of MCP calls
- **REQ-007**: WHEN a proposal is applied, THE SYSTEM SHALL verify the changes and report results

#### US-003: Batch Operations with Limits

**As a** developer performing bulk updates  
**I want** the system to enforce batch size limits  
**So that** I don't accidentally modify more items than intended

**Requirements:**

- **REQ-008**: IF a batch operation exceeds 50 items, THEN THE SYSTEM SHALL reject the request
- **REQ-009**: WHEN performing bulk operations, THE SYSTEM SHALL generate a dry-run summary
- **REQ-010**: THE SYSTEM SHALL provide progress tracking for batch operations

### 2.2 MCP Client Layer

#### US-004: MCP Server Integration

**As a** developer using the SDK  
**I want** seamless integration with @notionhq/notion-mcp-server  
**So that** I don't need to understand MCP protocol details

**Requirements:**

- **REQ-011**: THE SYSTEM SHALL communicate with the MCP server via stdio transport
- **REQ-012**: THE SYSTEM SHALL handle MCP tool invocation, parameter serialization, and response parsing
- **REQ-013**: THE SYSTEM SHALL support all tools exposed by @notionhq/notion-mcp-server

#### US-005: Request Middleware

**As a** developer debugging issues  
**I want** configurable middleware for logging, retry, and rate limiting  
**So that** I can diagnose problems and respect API limits

**Requirements:**

- **REQ-014**: THE SYSTEM SHALL provide a middleware pipeline for MCP requests
- **REQ-015**: THE SYSTEM SHALL include built-in rate limiting (3 requests/second default)
- **REQ-016**: THE SYSTEM SHALL include exponential backoff retry for transient failures
- **REQ-017**: THE SYSTEM SHALL log all MCP tool invocations when debug mode is enabled

### 2.3 Domain Layer

#### US-006: Entity Repositories

**As a** developer working with Notion data  
**I want** repository classes for each database  
**So that** I can use familiar patterns for data access

**Requirements:**

- **REQ-018**: THE SYSTEM SHALL provide repositories for Teams, Projects, Tasks, Meetings
- **REQ-019**: WHEN querying via repository, THE SYSTEM SHALL return domain entities (not raw Notion pages)
- **REQ-020**: THE SYSTEM SHALL support filtering, sorting, and pagination via fluent query builders

#### US-007: Relation Traversal

**As a** developer navigating related data  
**I want** to traverse relations between entities  
**So that** I can load related projects, tasks, and meetings efficiently

**Requirements:**

- **REQ-021**: WHEN loading an entity with relations, THE SYSTEM SHALL support eager and lazy loading
- **REQ-022**: THE SYSTEM SHALL provide methods to resolve relation IDs to full entities
- **REQ-023**: THE SYSTEM SHALL cache resolved relations to minimize API calls

### 2.4 Workflow Layer

#### US-008: Sprint Cycle Automation

**As a** team lead managing sprints  
**I want** to automate sprint planning, execution, and retrospectives  
**So that** I can focus on work rather than Notion administration

**Requirements:**

- **REQ-024**: THE SYSTEM SHALL support creating a sprint with project, tasks, and meetings in one operation
- **REQ-025**: WHEN a sprint is created, THE SYSTEM SHALL link all artifacts via relations
- **REQ-026**: THE SYSTEM SHALL support sprint status updates and progress tracking
- **REQ-027**: THE SYSTEM SHALL generate sprint reports with completion metrics

#### US-009: Daily Standup Management

**As a** team member in daily standups  
**I want** to quickly view and update my tasks  
**So that** I can stay focused during meetings

**Requirements:**

- **REQ-028**: THE SYSTEM SHALL query tasks by team and due date for standup views
- **REQ-029**: THE SYSTEM SHALL support quick task status updates (done/not done)
- **REQ-030**: THE SYSTEM SHALL link tasks to standup meetings as action items

### 2.5 Sync & Snapshot Layer

#### US-010: Local Snapshot Management

**As a** developer with Notion exports  
**I want** to compare local snapshots with live Notion state  
**So that** I can detect drift and validate changes

**Requirements:**

- **REQ-031**: THE SYSTEM SHALL parse Notion export CSV/Markdown files from snapshots directory
- **REQ-032**: THE SYSTEM SHALL generate diffs between snapshot and live state
- **REQ-033**: THE SYSTEM SHALL support snapshot-based conflict detection

#### US-011: Query Caching

**As a** developer making repeated queries  
**I want** query results to be cached  
**So that** I minimize API calls and improve performance

**Requirements:**

- **REQ-034**: THE SYSTEM SHALL cache query results with configurable TTL
- **REQ-035**: THE SYSTEM SHALL invalidate cache entries when mutations occur
- **REQ-036**: WHERE cache is stale, THE SYSTEM SHALL refresh transparently

---

## 3. Scope

### 3.1 In Scope (MVP)

| Category          | Features                                                  |
| ----------------- | --------------------------------------------------------- |
| **MCP Client**    | Stdio transport, tool invocation, middleware pipeline     |
| **Type System**   | Zod schemas for all databases, property types, operations |
| **Repositories**  | Teams, Projects, Tasks, Meetings CRUD operations          |
| **Query Builder** | Type-safe filters, sorts, pagination                      |
| **Safety Layer**  | Proposal workflow, batch limits, dry-run summaries        |
| **Workflows**     | Sprint creation, task updates, meeting scheduling         |
| **Snapshots**     | CSV/Markdown parsing, diff generation                     |

### 3.2 Out of Scope (Future)

| Category            | Features                                         |
| ------------------- | ------------------------------------------------ |
| **UI Components**   | No React/Vue components                          |
| **Webhooks**        | No real-time sync via webhooks                   |
| **Block Content**   | Limited block manipulation (focus on properties) |
| **OAuth**           | Internal integration token only                  |
| **Multi-Workspace** | Single workspace support                         |

---

## 4. Technical Constraints

### 4.1 MCP Server Constraints

| Constraint        | Description                                 |
| ----------------- | ------------------------------------------- |
| **Transport**     | Stdio only (not HTTP)                       |
| **Process Model** | SDK spawns and manages MCP server process   |
| **Environment**   | Requires NOTION_TOKEN environment variable  |
| **Rate Limits**   | Notion API limits apply (3 req/sec typical) |

### 4.2 Digital Herencia Workspace Constraints

| Constraint           | Description                                              |
| -------------------- | -------------------------------------------------------- |
| **Database IDs**     | Fixed IDs per copilot-instructions.md                    |
| **Property Schemas** | Must match existing Notion property configurations       |
| **Relations**        | Bidirectional relations between Teams ↔ Projects ↔ Tasks |
| **Formulas/Rollups** | Read-only computed properties                            |

### 4.3 Technology Stack

| Component             | Technology     |
| --------------------- | -------------- |
| **Language**          | TypeScript 5.x |
| **Runtime**           | Node.js 20+    |
| **Schema Validation** | Zod            |
| **Testing**           | Vitest         |
| **Build**             | tsup / esbuild |
| **Package Manager**   | pnpm           |

---

## 5. Database Schema Reference

### 5.1 Core Databases

| Database       | ID                                     | Purpose                  |
| -------------- | -------------------------------------- | ------------------------ |
| **Teams**      | `2d5a4e63-bf23-816b-9f75-000b219f7713` | Team entities (6 active) |
| **Projects**   | `2d5a4e63-bf23-8115-a70f-000bc1ef9d05` | Sprint/project tracking  |
| **Tasks**      | `2d5a4e63-bf23-8137-8277-000b41c867c3` | Task items               |
| **Meetings**   | `2caa4e63-bf23-815a-8981-000bbdbb7f0b` | Meeting scheduling       |
| **Prompts**    | `2d5a4e63-bf23-81ad-ab3f-000bfbb91ed9` | AI prompt library        |
| **Tech Stack** | `276a4e63-bf23-80e2-bbae-000b2fa9662a` | Technology catalog       |
| **Templates**  | `2d5a4e63-bf23-8189-943d-000bdd7af066` | Page templates           |
| **SOPs**       | `2d8a4e63-bf23-80d1-8167-000bb402c275` | Standard procedures      |
| **Calendar**   | `2d5a4e63-bf23-8140-b0d7-000b33493b7e` | Calendar events          |

### 5.2 Property Types (from schemas.ts)

```typescript
// Teams
Team: { id, name, meetings[], projects[], tasks[], projectsComplete, tasksCompleted }

// Projects
Project: { id, name, status, milestone, phase, domain, startDate, endDate, teamId, taskIds[] }

// Tasks
Task: { id, name, done, taskCode, due, priority, projectId, teamId }

// Meetings
Meeting: { id, name, type, cadence, date, attendeeTeamIds[], actionItemTaskIds[], projectIds[], teamIds[] }
```

---

## 6. Acceptance Criteria

### 6.1 MVP Release Criteria

- [ ] All REQ-001 through REQ-036 implemented and tested
- [ ] 80%+ test coverage
- [ ] API documentation complete
- [ ] Example workflows demonstrating sprint creation
- [ ] Successful integration with live Digital Herencia workspace

### 6.2 Quality Gates

| Gate       | Criteria                                   |
| ---------- | ------------------------------------------ |
| **Build**  | Zero TypeScript errors, zero ESLint errors |
| **Test**   | All tests pass, coverage ≥80%              |
| **Safety** | All write operations use proposal workflow |
| **Docs**   | All public exports documented with JSDoc   |

---

## 7. Risks & Mitigations

| Risk                     | Impact | Likelihood | Mitigation                              |
| ------------------------ | ------ | ---------- | --------------------------------------- |
| MCP server API changes   | High   | Low        | Pin @notionhq/notion-mcp-server version |
| Notion API rate limits   | Medium | Medium     | Built-in rate limiter and retry         |
| Schema drift             | Medium | Medium     | Snapshot comparison validates schema    |
| Bulk operation accidents | High   | Low        | Strict batch limits and proposals       |

---

## 8. Dependencies

### 8.1 External Dependencies

| Dependency                    | Version | Purpose                   |
| ----------------------------- | ------- | ------------------------- |
| `@notionhq/notion-mcp-server` | latest  | MCP server for Notion API |
| `zod`                         | ^3.23   | Schema validation         |
| `tsx`                         | ^4.x    | TypeScript execution      |
| `vitest`                      | ^2.x    | Testing framework         |

### 8.2 Internal Dependencies

| Artifact       | Location                          | Purpose                        |
| -------------- | --------------------------------- | ------------------------------ |
| Database IDs   | `.github/copilot-instructions.md` | Reference for all database IDs |
| Zod Schemas    | `schemas.ts`                      | Existing type definitions      |
| Notion Exports | `snapshots/`                      | Local state for comparison     |

---

## 9. Appendix

### 9.1 MCP Tools Reference

Tools available from `@notionhq/notion-mcp-server`:

| Tool                         | Operation            | Category |
| ---------------------------- | -------------------- | -------- |
| `API-retrieve-a-data-source` | Get database schema  | Read     |
| `API-query-data-source`      | Query database pages | Read     |
| `API-retrieve-a-page`        | Get single page      | Read     |
| `API-post-page`              | Create page          | Write    |
| `API-patch-page`             | Update page          | Write    |
| `API-update-a-block`         | Update block         | Write    |
| `API-get-block-children`     | List block children  | Read     |
| `API-post-search`            | Search pages         | Read     |
| `API-get-users`              | List users           | Read     |
| `API-create-a-comment`       | Add comment          | Write    |

### 9.2 Glossary

| Term              | Definition                                              |
| ----------------- | ------------------------------------------------------- |
| **MCP**           | Model Context Protocol - standardized AI tool interface |
| **Proposal**      | Change request requiring approval before execution      |
| **Repository**    | Data access pattern abstracting database operations     |
| **Snapshot**      | Local export of Notion workspace state                  |
| **Domain Entity** | Business object (Team, Project, Task, Meeting)          |
