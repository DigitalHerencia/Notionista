# Technical Design Document

## Notionista SDK – Architecture & Implementation

**Version**: 1.0.0  
**Date**: January 5, 2026  
**Status**: Draft

---

## 1. Architecture Overview

### 1.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           Application Layer                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │   CLI/REPL  │  │  Workflows  │  │  Copilot    │  │   Scripts   │    │
│  │             │  │  (Sprints)  │  │   Agents    │  │             │    │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘    │
└─────────┼────────────────┼────────────────┼────────────────┼───────────┘
          │                │                │                │
          ▼                ▼                ▼                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           Domain Layer                                   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │    Teams    │  │  Projects   │  │    Tasks    │  │  Meetings   │    │
│  │ Repository  │  │ Repository  │  │ Repository  │  │ Repository  │    │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘    │
│         │                │                │                │            │
│         └────────────────┴────────────────┴────────────────┘            │
│                                   │                                      │
│                          ┌────────▼────────┐                            │
│                          │  Base Repository │                            │
│                          └────────┬────────┘                            │
└───────────────────────────────────┼─────────────────────────────────────┘
                                    │
┌───────────────────────────────────┼─────────────────────────────────────┐
│                           Safety Layer                                   │
│                    ┌──────────────▼──────────────┐                      │
│                    │     Proposal Manager         │                      │
│                    │  (Propose → Approve → Apply) │                      │
│                    └──────────────┬──────────────┘                      │
│                                   │                                      │
│  ┌─────────────┐  ┌─────────────┐│┌─────────────┐  ┌─────────────┐     │
│  │  Validator  │  │    Diff     │││  Rollback   │  │   Batch     │     │
│  │             │  │   Engine    │││  Manager    │  │  Limiter    │     │
│  └─────────────┘  └─────────────┘│└─────────────┘  └─────────────┘     │
└───────────────────────────────────┼─────────────────────────────────────┘
                                    │
┌───────────────────────────────────┼─────────────────────────────────────┐
│                           MCP Client Layer                               │
│                    ┌──────────────▼──────────────┐                      │
│                    │        MCP Client            │                      │
│                    │    (Tool Invocation)         │                      │
│                    └──────────────┬──────────────┘                      │
│                                   │                                      │
│            ┌──────────────────────┼──────────────────────┐              │
│            ▼                      ▼                      ▼              │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐         │
│  │   Rate Limiter  │  │     Retry       │  │     Logger      │         │
│  │   Middleware    │  │   Middleware    │  │   Middleware    │         │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘         │
└───────────────────────────────────┼─────────────────────────────────────┘
                                    │
                                    ▼
                    ┌───────────────────────────────┐
                    │  @notionhq/notion-mcp-server  │
                    │        (stdio transport)       │
                    └───────────────────────────────┘
                                    │
                                    ▼
                    ┌───────────────────────────────┐
                    │         Notion API            │
                    └───────────────────────────────┘
```

### 1.2 Layer Responsibilities

| Layer           | Responsibility                                         |
| --------------- | ------------------------------------------------------ |
| **Application** | User-facing interfaces: CLI, workflows, Copilot agents |
| **Domain**      | Business entities, repositories, domain services       |
| **Safety**      | Change proposals, validation, batch limits, rollback   |
| **MCP Client**  | MCP protocol, tool invocation, middleware pipeline     |
| **External**    | @notionhq/notion-mcp-server process via stdio          |

---

## 2. Directory Structure

```
notionista/
├── src/
│   ├── index.ts                    # Public API exports
│   │
│   ├── core/                       # Core types and constants
│   │   ├── types/
│   │   │   ├── databases.ts        # Database IDs and property types
│   │   │   ├── notion.ts           # Notion API response types
│   │   │   ├── mcp.ts              # MCP protocol types
│   │   │   └── index.ts
│   │   ├── errors/
│   │   │   ├── base.ts             # Custom error hierarchy
│   │   │   ├── mcp-errors.ts       # MCP-specific errors
│   │   │   ├── validation-errors.ts
│   │   │   └── index.ts
│   │   ├── constants/
│   │   │   ├── database-ids.ts     # All database UUIDs
│   │   │   ├── property-names.ts   # Property name mappings
│   │   │   └── index.ts
│   │   └── index.ts
│   │
│   ├── schemas/                    # Zod schemas (migrated from schemas.ts)
│   │   ├── team.schema.ts
│   │   ├── project.schema.ts
│   │   ├── task.schema.ts
│   │   ├── meeting.schema.ts
│   │   ├── notion-property.schema.ts
│   │   └── index.ts
│   │
│   ├── mcp/                        # MCP client layer
│   │   ├── client.ts               # Main MCP client class
│   │   ├── transport.ts            # Stdio transport handler
│   │   ├── tools/                  # Tool-specific wrappers
│   │   │   ├── databases.ts        # query-data-source, retrieve-data-source
│   │   │   ├── pages.ts            # post-page, patch-page, retrieve-page
│   │   │   ├── blocks.ts           # block operations
│   │   │   ├── search.ts           # post-search
│   │   │   ├── users.ts            # get-users, get-user
│   │   │   ├── comments.ts         # create-comment
│   │   │   └── index.ts
│   │   ├── middleware/
│   │   │   ├── types.ts            # Middleware interfaces
│   │   │   ├── rate-limiter.ts     # Rate limiting (3 req/sec)
│   │   │   ├── retry.ts            # Exponential backoff
│   │   │   ├── logger.ts           # Debug logging
│   │   │   ├── cache.ts            # Response caching
│   │   │   └── index.ts
│   │   └── index.ts
│   │
│   ├── domain/                     # Business domain
│   │   ├── entities/
│   │   │   ├── base.entity.ts      # Base entity class
│   │   │   ├── team.entity.ts
│   │   │   ├── project.entity.ts
│   │   │   ├── task.entity.ts
│   │   │   ├── meeting.entity.ts
│   │   │   └── index.ts
│   │   ├── repositories/
│   │   │   ├── base.repository.ts  # Abstract repository
│   │   │   ├── team.repository.ts
│   │   │   ├── project.repository.ts
│   │   │   ├── task.repository.ts
│   │   │   ├── meeting.repository.ts
│   │   │   └── index.ts
│   │   ├── services/
│   │   │   ├── analytics.service.ts
│   │   │   ├── relation.service.ts
│   │   │   └── index.ts
│   │   └── index.ts
│   │
│   ├── query/                      # Query builder
│   │   ├── builder.ts              # Fluent query API
│   │   ├── filters.ts              # Filter condition types
│   │   ├── sorts.ts                # Sort configuration
│   │   └── index.ts
│   │
│   ├── safety/                     # Safety layer
│   │   ├── proposal.ts             # ChangeProposal types and manager
│   │   ├── diff.ts                 # State comparison
│   │   ├── validator.ts            # Pre-change validation
│   │   ├── batch.ts                # Batch operation limits
│   │   ├── rollback.ts             # Rollback mechanisms
│   │   └── index.ts
│   │
│   ├── workflows/                  # Orchestration
│   │   ├── sprint-cycle.ts         # Sprint planning workflow
│   │   ├── daily-standup.ts        # Standup automation
│   │   ├── team-management.ts      # Team CRUD workflows
│   │   ├── reporting.ts            # Analytics and reports
│   │   └── index.ts
│   │
│   ├── sync/                       # Snapshot and sync
│   │   ├── snapshot.ts             # Snapshot manager
│   │   ├── parser/
│   │   │   ├── csv.ts              # CSV export parser
│   │   │   ├── markdown.ts         # Markdown export parser
│   │   │   └── index.ts
│   │   ├── diff.ts                 # Snapshot diff engine
│   │   └── index.ts
│   │
│   └── cli/                        # Optional CLI
│       ├── index.ts
│       └── commands/
│           ├── query.ts
│           ├── create.ts
│           └── sync.ts
│
├── config/
│   ├── databases.json              # Database configuration
│   └── workflows.json              # Workflow settings
│
├── tests/
│   ├── unit/
│   │   ├── mcp/
│   │   ├── domain/
│   │   ├── safety/
│   │   └── query/
│   ├── integration/
│   │   ├── repositories.test.ts
│   │   └── workflows.test.ts
│   └── fixtures/
│       ├── notion-responses/
│       └── snapshots/
│
├── package.json
├── tsconfig.json
├── vitest.config.ts
└── README.md
```

---

## 3. Core Components

### 3.1 MCP Client

#### 3.1.1 Transport Layer

```typescript
// src/mcp/transport.ts
import { spawn, ChildProcess } from "child_process";
import { EventEmitter } from "events";

export interface McpTransportOptions {
  command: string;
  args: string[];
  env: Record<string, string>;
}

export class StdioTransport extends EventEmitter {
  private process: ChildProcess | null = null;
  private buffer = "";

  constructor(private options: McpTransportOptions) {
    super();
  }

  async connect(): Promise<void> {
    this.process = spawn(this.options.command, this.options.args, {
      env: { ...process.env, ...this.options.env },
      stdio: ["pipe", "pipe", "inherit"],
    });

    this.process.stdout?.on("data", (chunk) => {
      this.buffer += chunk.toString();
      this.processBuffer();
    });

    this.process.on("error", (error) => this.emit("error", error));
    this.process.on("close", (code) => this.emit("close", code));
  }

  async send(message: object): Promise<void> {
    const json = JSON.stringify(message);
    this.process?.stdin?.write(json + "\n");
  }

  async disconnect(): Promise<void> {
    this.process?.kill();
    this.process = null;
  }

  private processBuffer(): void {
    // Parse JSON-RPC messages from buffer
    // Emit 'message' events for complete messages
  }
}
```

#### 3.1.2 Client with Middleware

```typescript
// src/mcp/client.ts
import { StdioTransport } from "./transport";
import type { Middleware, McpRequest, McpResponse } from "./middleware/types";

export interface McpClientOptions {
  notionToken: string;
  debug?: boolean;
}

export class McpClient {
  private transport: StdioTransport;
  private middlewares: Middleware[] = [];
  private requestId = 0;

  constructor(options: McpClientOptions) {
    this.transport = new StdioTransport({
      command: "npx",
      args: ["-y", "@notionhq/notion-mcp-server"],
      env: { NOTION_TOKEN: options.notionToken },
    });
  }

  use(middleware: Middleware): this {
    this.middlewares.push(middleware);
    return this;
  }

  async connect(): Promise<void> {
    await this.transport.connect();
    // Initialize MCP session
  }

  async callTool<T>(name: string, params: Record<string, unknown>): Promise<T> {
    const request: McpRequest = {
      id: ++this.requestId,
      tool: name,
      params,
      timestamp: Date.now(),
    };

    // Build middleware chain
    const execute = async (): Promise<McpResponse> => {
      return this.executeToolCall(request);
    };

    const chain = this.middlewares.reduceRight((next, mw) => () => mw(request, next), execute);

    const response = await chain();
    return response.result as T;
  }

  private async executeToolCall(request: McpRequest): Promise<McpResponse> {
    // Send JSON-RPC request via transport
    // Wait for response
    // Parse and return
  }

  async disconnect(): Promise<void> {
    await this.transport.disconnect();
  }
}
```

### 3.2 Domain Layer

#### 3.2.1 Base Repository

```typescript
// src/domain/repositories/base.repository.ts
import type { McpClient } from "../../mcp/client";
import type { QueryBuilder } from "../../query/builder";
import type { ChangeProposal, ProposalManager } from "../../safety/proposal";
import type { z } from "zod";

export abstract class BaseRepository<TEntity, TCreateInput, TUpdateInput, TSchema extends z.ZodType> {
  constructor(protected readonly mcp: McpClient, protected readonly proposals: ProposalManager, protected readonly databaseId: string, protected readonly schema: TSchema) {}

  /**
   * Find all entities matching query
   */
  async findMany(query?: QueryBuilder): Promise<TEntity[]> {
    const params = query?.build() ?? { database_id: this.databaseId };
    const response = await this.mcp.callTool("API-query-data-source", {
      data_source_id: this.databaseId,
      ...params,
    });
    return this.mapResults(response);
  }

  /**
   * Find single entity by ID
   */
  async findById(id: string): Promise<TEntity | null> {
    const response = await this.mcp.callTool("API-retrieve-a-page", {
      page_id: id,
    });
    return response ? this.toDomainEntity(response) : null;
  }

  /**
   * Create entity - returns proposal for approval
   */
  async create(input: TCreateInput): Promise<ChangeProposal<TEntity>> {
    const properties = this.toNotionProperties(input);

    return this.proposals.propose({
      type: "create",
      target: { database: this.databaseId },
      currentState: null,
      proposedState: input as unknown as TEntity,
      diff: this.computeCreateDiff(input),
      sideEffects: [],
      validation: await this.validateCreate(input),
    });
  }

  /**
   * Update entity - returns proposal for approval
   */
  async update(id: string, input: TUpdateInput): Promise<ChangeProposal<TEntity>> {
    const current = await this.findById(id);
    if (!current) {
      throw new EntityNotFoundError(this.databaseId, id);
    }

    return this.proposals.propose({
      type: "update",
      target: { database: this.databaseId, pageId: id },
      currentState: current,
      proposedState: this.applyUpdate(current, input),
      diff: this.computeUpdateDiff(current, input),
      sideEffects: await this.computeSideEffects(current, input),
      validation: await this.validateUpdate(id, input),
    });
  }

  // Abstract methods for subclasses
  protected abstract toDomainEntity(page: unknown): TEntity;
  protected abstract toNotionProperties(input: TCreateInput | TUpdateInput): unknown;
  protected abstract mapResults(response: unknown): TEntity[];
  protected abstract validateCreate(input: TCreateInput): Promise<ValidationResult>;
  protected abstract validateUpdate(id: string, input: TUpdateInput): Promise<ValidationResult>;
}
```

#### 3.2.2 Task Repository Example

```typescript
// src/domain/repositories/task.repository.ts
import { BaseRepository } from "./base.repository";
import { Task, TaskSchema } from "../../schemas/task.schema";
import { DATABASE_IDS } from "../../core/constants/database-ids";

export interface CreateTaskInput {
  name: string;
  done?: boolean;
  due?: string | null;
  priority?: "High" | "Medium" | "Low" | null;
  projectId?: string;
  teamId?: string;
}

export interface UpdateTaskInput {
  name?: string;
  done?: boolean;
  due?: string | null;
  priority?: "High" | "Medium" | "Low" | null;
}

export class TaskRepository extends BaseRepository<Task, CreateTaskInput, UpdateTaskInput, typeof TaskSchema> {
  constructor(mcp: McpClient, proposals: ProposalManager) {
    super(mcp, proposals, DATABASE_IDS.TASKS, TaskSchema);
  }

  /**
   * Find incomplete tasks by team
   */
  async findIncompleteByTeam(teamId: string): Promise<Task[]> {
    const response = await this.mcp.callTool("API-query-data-source", {
      data_source_id: this.databaseId,
      filter: {
        and: [
          { property: "Team", relation: { contains: teamId } },
          { property: "Done", checkbox: { equals: false } },
        ],
      },
      sorts: [{ property: "Due", direction: "ascending" }],
    });
    return this.mapResults(response);
  }

  /**
   * Find tasks due today
   */
  async findDueToday(): Promise<Task[]> {
    const today = new Date().toISOString().split("T")[0];
    const response = await this.mcp.callTool("API-query-data-source", {
      data_source_id: this.databaseId,
      filter: {
        property: "Due",
        date: { equals: today },
      },
    });
    return this.mapResults(response);
  }

  /**
   * Quick mark as done - still uses proposal workflow
   */
  async markDone(id: string): Promise<ChangeProposal<Task>> {
    return this.update(id, { done: true });
  }

  protected toDomainEntity(page: NotionPage): Task {
    return {
      id: page.id,
      name: this.extractTitle(page.properties.Name),
      done: page.properties.Done?.checkbox ?? false,
      taskCode: page.properties["Task Code"]?.formula?.string ?? undefined,
      due: page.properties.Due?.date?.start ?? null,
      priority: page.properties.Priority?.select?.name ?? null,
      projectId: page.properties.Project?.relation?.[0]?.id,
      teamId: page.properties.Team?.relation?.[0]?.id,
    };
  }

  protected toNotionProperties(input: CreateTaskInput | UpdateTaskInput): NotionProperties {
    const props: NotionProperties = {};

    if ("name" in input && input.name) {
      props.Name = { title: [{ text: { content: input.name } }] };
    }
    if ("done" in input && input.done !== undefined) {
      props.Done = { checkbox: input.done };
    }
    if ("due" in input) {
      props.Due = input.due ? { date: { start: input.due } } : null;
    }
    if ("priority" in input && input.priority) {
      props.Priority = { select: { name: input.priority } };
    }
    if ("projectId" in input && input.projectId) {
      props.Project = { relation: [{ id: input.projectId }] };
    }
    if ("teamId" in input && input.teamId) {
      props.Team = { relation: [{ id: input.teamId }] };
    }

    return props;
  }
}
```

### 3.3 Safety Layer

#### 3.3.1 Proposal Manager

```typescript
// src/safety/proposal.ts
import type { McpClient } from "../mcp/client";

export interface ChangeProposal<T> {
  id: string;
  type: "create" | "update" | "delete" | "bulk";
  target: {
    database: string;
    pageId?: string;
  };
  currentState: T | null;
  proposedState: T;
  diff: PropertyDiff[];
  sideEffects: SideEffect[];
  validation: ValidationResult;
  createdAt: Date;
  status: "pending" | "approved" | "applied" | "rejected" | "failed";
}

export interface PropertyDiff {
  property: string;
  oldValue: unknown;
  newValue: unknown;
  impact: "low" | "medium" | "high";
}

export interface SideEffect {
  type: "relation_update" | "rollup_recalc" | "cascade";
  description: string;
  affectedItems: string[];
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface ApplyResult {
  success: boolean;
  proposalId: string;
  appliedAt: Date;
  pageId?: string;
  error?: Error;
}

export class ProposalManager {
  private proposals = new Map<string, ChangeProposal<unknown>>();

  constructor(private readonly mcp: McpClient) {}

  /**
   * Create a change proposal (does NOT execute)
   */
  async propose<T>(proposal: Omit<ChangeProposal<T>, "id" | "createdAt" | "status">): Promise<ChangeProposal<T>> {
    const fullProposal: ChangeProposal<T> = {
      ...proposal,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      status: "pending",
    };

    this.proposals.set(fullProposal.id, fullProposal);
    return fullProposal;
  }

  /**
   * Get pending proposals
   */
  getPending(): ChangeProposal<unknown>[] {
    return Array.from(this.proposals.values()).filter((p) => p.status === "pending");
  }

  /**
   * Approve a proposal (marks as approved, does NOT apply)
   */
  approve(proposalId: string): void {
    const proposal = this.proposals.get(proposalId);
    if (!proposal) throw new ProposalNotFoundError(proposalId);
    if (proposal.status !== "pending") throw new InvalidProposalStateError(proposalId, proposal.status);
    proposal.status = "approved";
  }

  /**
   * Apply an approved proposal
   */
  async apply(proposalId: string): Promise<ApplyResult> {
    const proposal = this.proposals.get(proposalId);
    if (!proposal) throw new ProposalNotFoundError(proposalId);
    if (proposal.status !== "approved") throw new InvalidProposalStateError(proposalId, proposal.status);

    try {
      const result = await this.executeProposal(proposal);
      proposal.status = "applied";
      return result;
    } catch (error) {
      proposal.status = "failed";
      throw error;
    }
  }

  /**
   * Reject a proposal
   */
  reject(proposalId: string, reason?: string): void {
    const proposal = this.proposals.get(proposalId);
    if (!proposal) throw new ProposalNotFoundError(proposalId);
    proposal.status = "rejected";
  }

  /**
   * Format proposal for human review
   */
  formatForReview<T>(proposal: ChangeProposal<T>): string {
    const lines: string[] = [`## Change Proposal: ${proposal.id}`, "", `**Type**: ${proposal.type}`, `**Database**: ${proposal.target.database}`, proposal.target.pageId ? `**Page ID**: ${proposal.target.pageId}` : "", "", "### Changes", ""];

    for (const diff of proposal.diff) {
      lines.push(`- **${diff.property}**: \`${diff.oldValue}\` → \`${diff.newValue}\` (${diff.impact} impact)`);
    }

    if (proposal.sideEffects.length > 0) {
      lines.push("", "### Side Effects", "");
      for (const effect of proposal.sideEffects) {
        lines.push(`- ${effect.type}: ${effect.description}`);
      }
    }

    if (!proposal.validation.valid) {
      lines.push("", "### ⚠️ Validation Errors", "");
      for (const error of proposal.validation.errors) {
        lines.push(`- ${error}`);
      }
    }

    return lines.join("\n");
  }

  private async executeProposal(proposal: ChangeProposal<unknown>): Promise<ApplyResult> {
    switch (proposal.type) {
      case "create":
        return this.executeCreate(proposal);
      case "update":
        return this.executeUpdate(proposal);
      case "delete":
        return this.executeDelete(proposal);
      default:
        throw new Error(`Unsupported proposal type: ${proposal.type}`);
    }
  }

  private async executeCreate(proposal: ChangeProposal<unknown>): Promise<ApplyResult> {
    const response = await this.mcp.callTool("API-post-page", {
      parent: { database_id: proposal.target.database },
      properties: proposal.proposedState,
    });

    return {
      success: true,
      proposalId: proposal.id,
      appliedAt: new Date(),
      pageId: response.id,
    };
  }

  private async executeUpdate(proposal: ChangeProposal<unknown>): Promise<ApplyResult> {
    await this.mcp.callTool("API-patch-page", {
      page_id: proposal.target.pageId,
      properties: proposal.proposedState,
    });

    return {
      success: true,
      proposalId: proposal.id,
      appliedAt: new Date(),
      pageId: proposal.target.pageId,
    };
  }

  private async executeDelete(proposal: ChangeProposal<unknown>): Promise<ApplyResult> {
    await this.mcp.callTool("API-patch-page", {
      page_id: proposal.target.pageId,
      archived: true,
    });

    return {
      success: true,
      proposalId: proposal.id,
      appliedAt: new Date(),
      pageId: proposal.target.pageId,
    };
  }
}
```

### 3.4 Query Builder

```typescript
// src/query/builder.ts
import type { DatabaseId } from "../core/types/databases";

export type FilterOperator = "equals" | "does_not_equal" | "contains" | "does_not_contain" | "starts_with" | "ends_with" | "is_empty" | "is_not_empty" | "greater_than" | "less_than" | "greater_than_or_equal_to" | "less_than_or_equal_to";

export interface FilterCondition {
  property: string;
  type: "text" | "number" | "checkbox" | "select" | "date" | "relation";
  operator: FilterOperator;
  value: unknown;
}

export interface SortCondition {
  property: string;
  direction: "ascending" | "descending";
}

export class QueryBuilder {
  private filters: FilterCondition[] = [];
  private compoundFilters: { type: "and" | "or"; conditions: FilterCondition[] }[] = [];
  private sorts: SortCondition[] = [];
  private pageSize = 100;
  private cursor?: string;

  constructor(private readonly databaseId: string) {}

  /**
   * Add a filter condition
   */
  where(property: string, operator: FilterOperator, value: unknown): this {
    this.filters.push({ property, type: this.inferType(value), operator, value });
    return this;
  }

  /**
   * Add AND compound filter
   */
  and(...conditions: FilterCondition[]): this {
    this.compoundFilters.push({ type: "and", conditions });
    return this;
  }

  /**
   * Add OR compound filter
   */
  or(...conditions: FilterCondition[]): this {
    this.compoundFilters.push({ type: "or", conditions });
    return this;
  }

  /**
   * Add checkbox filter (convenience method)
   */
  whereChecked(property: string, checked: boolean): this {
    this.filters.push({
      property,
      type: "checkbox",
      operator: "equals",
      value: checked,
    });
    return this;
  }

  /**
   * Add relation filter (convenience method)
   */
  whereRelation(property: string, relatedId: string): this {
    this.filters.push({
      property,
      type: "relation",
      operator: "contains",
      value: relatedId,
    });
    return this;
  }

  /**
   * Add sort
   */
  orderBy(property: string, direction: "ascending" | "descending" = "ascending"): this {
    this.sorts.push({ property, direction });
    return this;
  }

  /**
   * Set page size
   */
  limit(size: number): this {
    this.pageSize = Math.min(size, 100);
    return this;
  }

  /**
   * Set cursor for pagination
   */
  startAfter(cursor: string): this {
    this.cursor = cursor;
    return this;
  }

  /**
   * Build the query parameters
   */
  build(): QueryDataSourceParams {
    return {
      data_source_id: this.databaseId,
      filter: this.buildFilter(),
      sorts: this.sorts.length > 0 ? this.sorts : undefined,
      page_size: this.pageSize,
      start_cursor: this.cursor,
    };
  }

  private buildFilter(): object | undefined {
    if (this.filters.length === 0 && this.compoundFilters.length === 0) {
      return undefined;
    }

    const conditions = this.filters.map((f) => this.toNotionFilter(f));

    if (conditions.length === 1) {
      return conditions[0];
    }

    return { and: conditions };
  }

  private toNotionFilter(filter: FilterCondition): object {
    const { property, type, operator, value } = filter;

    switch (type) {
      case "checkbox":
        return { property, checkbox: { [operator]: value } };
      case "select":
        return { property, select: { [operator]: value } };
      case "relation":
        return { property, relation: { [operator]: value } };
      case "date":
        return { property, date: { [operator]: value } };
      case "number":
        return { property, number: { [operator]: value } };
      default:
        return { property, rich_text: { [operator]: value } };
    }
  }

  private inferType(value: unknown): FilterCondition["type"] {
    if (typeof value === "boolean") return "checkbox";
    if (typeof value === "number") return "number";
    return "text";
  }
}

// Factory function
export function query(databaseId: string): QueryBuilder {
  return new QueryBuilder(databaseId);
}
```

### 3.5 Snapshot Parser

```typescript
// src/sync/parser/csv.ts
import { parse } from "csv-parse/sync";
import { readFileSync } from "fs";
import { join } from "path";

export interface SnapshotRecord {
  id: string;
  properties: Record<string, unknown>;
  source: "csv" | "markdown";
  filePath: string;
}

export class CsvSnapshotParser {
  /**
   * Parse a Notion CSV export file
   */
  parse(filePath: string): SnapshotRecord[] {
    const content = readFileSync(filePath, "utf-8");
    const records = parse(content, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    return records.map((record: Record<string, string>, index: number) => ({
      id: this.extractId(record) ?? `row-${index}`,
      properties: this.normalizeProperties(record),
      source: "csv" as const,
      filePath,
    }));
  }

  /**
   * Parse Teams CSV from snapshot
   */
  parseTeams(snapshotDir: string): SnapshotRecord[] {
    const filePath = join(snapshotDir, "Digital Herencia", "Teams 2d5a4e63bf2381519b98c81833668844.csv");
    return this.parse(filePath);
  }

  /**
   * Parse Tasks CSV from snapshot
   */
  parseTasks(snapshotDir: string): SnapshotRecord[] {
    const filePath = join(snapshotDir, "Digital Herencia", "Tasks 2d5a4e63bf23816fa217ef754ce4a70e.csv");
    return this.parse(filePath);
  }

  private extractId(record: Record<string, string>): string | undefined {
    // Notion exports include URLs with page IDs
    for (const value of Object.values(record)) {
      const match = value.match(/notion\.so\/([a-f0-9-]+)/);
      if (match) return match[1];
    }
    return undefined;
  }

  private normalizeProperties(record: Record<string, string>): Record<string, unknown> {
    const normalized: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(record)) {
      // Parse common patterns
      if (value === "Yes" || value === "No") {
        normalized[key] = value === "Yes";
      } else if (value.includes("(https://www.notion.so/")) {
        // Extract relation references
        normalized[key] = this.parseRelations(value);
      } else if (value.match(/^\d{4}-\d{2}-\d{2}/)) {
        normalized[key] = value; // Keep as ISO date string
      } else {
        normalized[key] = value;
      }
    }

    return normalized;
  }

  private parseRelations(value: string): string[] {
    const ids: string[] = [];
    const matches = value.matchAll(/notion\.so\/([a-f0-9-]+)/g);
    for (const match of matches) {
      ids.push(match[1]);
    }
    return ids;
  }
}
```

---

## 4. Data Flow

### 4.1 Query Flow

```
User Code → Repository.findMany(query)
              │
              ├── QueryBuilder.build() → Query Params
              │
              ▼
          McpClient.callTool('API-query-data-source', params)
              │
              ├── Middleware: RateLimiter → Retry → Logger → Cache
              │
              ▼
          StdioTransport.send(JSON-RPC)
              │
              ▼
          @notionhq/notion-mcp-server
              │
              ▼
          Notion API
              │
              ▼
          Response → Repository.mapResults() → Domain Entities
```

### 4.2 Mutation Flow (Propose → Approve → Apply)

```
User Code → Repository.create(input)
              │
              ├── Validate input
              ├── Compute diff
              ├── Detect side effects
              │
              ▼
          ProposalManager.propose()
              │
              ▼
          ChangeProposal (status: pending)
              │
          [User reviews proposal]
              │
              ▼
          ProposalManager.approve(proposalId)
              │
              ▼
          ChangeProposal (status: approved)
              │
              ▼
          ProposalManager.apply(proposalId)
              │
              ├── McpClient.callTool('API-post-page', ...)
              │
              ▼
          ApplyResult (success, pageId)
              │
          [Optional: Verify by re-querying]
```

---

## 5. Error Handling

### 5.1 Error Hierarchy

```typescript
// src/core/errors/base.ts
export abstract class NotionistError extends Error {
  abstract readonly code: string;
  abstract readonly recoverable: boolean;
}

// src/core/errors/mcp-errors.ts
export class McpConnectionError extends NotionistError {
  code = "MCP_CONNECTION_FAILED";
  recoverable = true;
}

export class McpToolError extends NotionistError {
  code = "MCP_TOOL_ERROR";
  recoverable = false;

  constructor(public readonly tool: string, public readonly notionError: unknown) {
    super(`MCP tool ${tool} failed`);
  }
}

export class RateLimitError extends NotionistError {
  code = "RATE_LIMITED";
  recoverable = true;

  constructor(public readonly retryAfter: number) {
    super(`Rate limited, retry after ${retryAfter}ms`);
  }
}

// src/core/errors/validation-errors.ts
export class EntityNotFoundError extends NotionistError {
  code = "ENTITY_NOT_FOUND";
  recoverable = false;

  constructor(public readonly database: string, public readonly entityId: string) {
    super(`Entity ${entityId} not found in ${database}`);
  }
}

export class ProposalNotFoundError extends NotionistError {
  code = "PROPOSAL_NOT_FOUND";
  recoverable = false;
}

export class BatchLimitExceededError extends NotionistError {
  code = "BATCH_LIMIT_EXCEEDED";
  recoverable = false;

  constructor(public readonly requested: number, public readonly limit: number) {
    super(`Batch size ${requested} exceeds limit of ${limit}`);
  }
}
```

---

## 6. Configuration

### 6.1 Database Configuration

```json
{
  "databases": {
    "teams": {
      "id": "2d5a4e63-bf23-816b-9f75-000b219f7713",
      "properties": {
        "name": { "type": "title", "notionName": "Team name" },
        "projects": { "type": "relation", "target": "projects" },
        "tasks": { "type": "relation", "target": "tasks" },
        "projectsComplete": { "type": "formula", "readonly": true },
        "tasksCompleted": { "type": "formula", "readonly": true }
      }
    },
    "projects": {
      "id": "2d5a4e63-bf23-8115-a70f-000bc1ef9d05",
      "properties": {
        "name": { "type": "title", "notionName": "Name" },
        "status": { "type": "select", "options": ["Active", "Completed", "On Hold", "Cancelled"] },
        "milestone": { "type": "select", "options": ["M1", "M2", "M3"] },
        "phase": { "type": "select", "options": ["P1.1", "P1.2", "P1.3", "P2.1", "P2.2", "P2.3", "P3.1", "P3.2", "P3.3"] },
        "domain": { "type": "select", "options": ["OPS", "PROD", "DES", "ENG", "MKT", "RES"] },
        "startDate": { "type": "date", "notionName": "Start Date" },
        "endDate": { "type": "date", "notionName": "End Date" },
        "team": { "type": "relation", "target": "teams" }
      }
    },
    "tasks": {
      "id": "2d5a4e63-bf23-8137-8277-000b41c867c3",
      "properties": {
        "name": { "type": "title", "notionName": "Name" },
        "done": { "type": "checkbox", "notionName": "Done" },
        "taskCode": { "type": "formula", "notionName": "Task Code", "readonly": true },
        "due": { "type": "date", "notionName": "Due" },
        "priority": { "type": "select", "options": ["High", "Medium", "Low"] },
        "project": { "type": "relation", "target": "projects" },
        "team": { "type": "relation", "target": "teams" }
      }
    },
    "meetings": {
      "id": "2caa4e63-bf23-815a-8981-000bbdbb7f0b",
      "properties": {
        "name": { "type": "title", "notionName": "Name" },
        "type": { "type": "select", "options": ["Standup", "Sprint Planning", "Post-mortem", "Team Sync", "Ad Hoc"] },
        "cadence": { "type": "select", "options": ["Daily", "Weekly", "Biweekly", "Monthly", "Ad Hoc"] },
        "date": { "type": "date", "notionName": "Date" },
        "teams": { "type": "relation", "target": "teams" },
        "projects": { "type": "relation", "target": "projects" },
        "actionItems": { "type": "relation", "target": "tasks" }
      }
    }
  },
  "safety": {
    "maxBatchSize": 50,
    "rateLimitPerSecond": 3,
    "requireApprovalForBulk": true,
    "requireApprovalForDelete": true
  },
  "cache": {
    "enabled": true,
    "ttlSeconds": 300,
    "maxEntries": 1000
  }
}
```

---

## 7. Testing Strategy

### 7.1 Test Categories

| Category        | Scope                        | Approach                        |
| --------------- | ---------------------------- | ------------------------------- |
| **Unit**        | Individual functions/classes | Mock MCP client                 |
| **Integration** | Repository + MCP             | Use fixtures, optional live API |
| **Workflow**    | Full workflow execution      | End-to-end with proposals       |
| **Snapshot**    | CSV/Markdown parsing         | Use snapshot fixtures           |

### 7.2 Test Fixtures

```
tests/fixtures/
├── notion-responses/
│   ├── query-tasks.json
│   ├── retrieve-page.json
│   └── post-page.json
└── snapshots/
    ├── teams.csv
    ├── tasks.csv
    └── projects.csv
```

### 7.3 Example Test

```typescript
// tests/unit/domain/task.repository.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { TaskRepository } from "../../../src/domain/repositories/task.repository";
import { createMockMcpClient, createMockProposalManager } from "../../helpers";

describe("TaskRepository", () => {
  let repo: TaskRepository;
  let mockMcp: ReturnType<typeof createMockMcpClient>;
  let mockProposals: ReturnType<typeof createMockProposalManager>;

  beforeEach(() => {
    mockMcp = createMockMcpClient();
    mockProposals = createMockProposalManager();
    repo = new TaskRepository(mockMcp, mockProposals);
  });

  describe("findIncompleteByTeam", () => {
    it("should query with correct filters", async () => {
      mockMcp.callTool.mockResolvedValue({ results: [] });

      await repo.findIncompleteByTeam("team-123");

      expect(mockMcp.callTool).toHaveBeenCalledWith("API-query-data-source", {
        data_source_id: expect.any(String),
        filter: {
          and: [
            { property: "Team", relation: { contains: "team-123" } },
            { property: "Done", checkbox: { equals: false } },
          ],
        },
        sorts: [{ property: "Due", direction: "ascending" }],
      });
    });
  });

  describe("create", () => {
    it("should return a proposal, not execute immediately", async () => {
      const proposal = await repo.create({
        name: "New Task",
        priority: "High",
      });

      expect(proposal.status).toBe("pending");
      expect(proposal.type).toBe("create");
      expect(mockMcp.callTool).not.toHaveBeenCalledWith("API-post-page", expect.anything());
    });
  });
});
```

---

## 8. Interfaces

### 8.1 Public API Surface

```typescript
// src/index.ts - Public exports

// Client
export { McpClient, type McpClientOptions } from "./mcp/client";

// Repositories
export { TeamRepository } from "./domain/repositories/team.repository";
export { ProjectRepository } from "./domain/repositories/project.repository";
export { TaskRepository } from "./domain/repositories/task.repository";
export { MeetingRepository } from "./domain/repositories/meeting.repository";

// Query Builder
export { query, QueryBuilder } from "./query/builder";

// Safety
export { ProposalManager, type ChangeProposal, type ApplyResult } from "./safety/proposal";

// Workflows
export { SprintCycleWorkflow } from "./workflows/sprint-cycle";
export { DailyStandupWorkflow } from "./workflows/daily-standup";

// Schemas
export * from "./schemas";

// Types
export * from "./core/types";

// Errors
export * from "./core/errors";

// Factory function for quick setup
export function createNotionista(options: McpClientOptions): Notionista {
  const mcp = new McpClient(options);
  const proposals = new ProposalManager(mcp);

  return {
    mcp,
    proposals,
    teams: new TeamRepository(mcp, proposals),
    projects: new ProjectRepository(mcp, proposals),
    tasks: new TaskRepository(mcp, proposals),
    meetings: new MeetingRepository(mcp, proposals),
    workflows: {
      sprint: new SprintCycleWorkflow(/* ... */),
      standup: new DailyStandupWorkflow(/* ... */),
    },
    connect: () => mcp.connect(),
    disconnect: () => mcp.disconnect(),
  };
}
```

---

## 9. Implementation Considerations

### 9.1 MCP Server Process Management

- SDK spawns `npx -y @notionhq/notion-mcp-server` as child process
- Must handle process lifecycle (start, monitor, restart on crash)
- Environment variable `NOTION_TOKEN` passed to child process
- Graceful shutdown on SDK disconnect

### 9.2 Stdio Protocol Handling

- JSON-RPC 2.0 over stdio
- Newline-delimited messages
- Must handle partial reads and buffer management
- Request/response correlation via message IDs

### 9.3 Caching Strategy

- Cache query results with configurable TTL (default 5 min)
- Invalidate on mutations to affected databases
- Use content-addressable keys for deduplication
- Memory-bounded LRU cache

### 9.4 Rate Limiting

- Default 3 requests/second (Notion API limit)
- Token bucket algorithm for smooth rate limiting
- Queue overflow handling with backpressure
- Per-database rate limit tracking (optional)
