# Notion MCP TypeScript Architecture Design

Based on your existing Digital Herencia workspace structure and the Notion MCP integration patterns, here's a comprehensive architecture for a TypeScript repository optimized for advanced Notion automation use cases.

## Architecture Overview

```
notionista/
├── src/
│   ├── core/                    # Core abstractions and contracts
│   │   ├── types/               # TypeScript type definitions
│   │   ├── interfaces/          # Abstract interfaces for MCP operations
│   │   ├── errors/              # Custom error hierarchy
│   │   └── constants/           # Database IDs, property names, enums
│   │
│   ├── mcp/                     # MCP client layer
│   │   ├── client.ts            # MCP connection manager
│   │   ├── tools/               # Tool-specific wrappers
│   │   │   ├── databases.ts     # query-data-source, retrieve-a-data-source
│   │   │   ├── pages.ts         # post-page, patch-page, retrieve-a-page
│   │   │   ├── blocks.ts        # block operations
│   │   │   ├── search.ts        # post-search
│   │   │   └── comments.ts      # comment operations
│   │   └── middleware/          # Request/response interceptors
│   │       ├── rate-limiter.ts
│   │       ├── retry.ts
│   │       └── logger.ts
│   │
│   ├── domain/                  # Business domain models
│   │   ├── entities/            # Domain entities
│   │   │   ├── team.ts
│   │   │   ├── project.ts
│   │   │   ├── task.ts
│   │   │   ├── meeting.ts
│   │   │   └── base-entity.ts
│   │   ├── repositories/        # Data access layer
│   │   │   ├── team.repository.ts
│   │   │   ├── project.repository.ts
│   │   │   ├── task.repository.ts
│   │   │   └── base.repository.ts
│   │   └── services/            # Domain services
│   │       ├── sprint.service.ts
│   │       ├── workflow.service.ts
│   │       └── analytics.service.ts
│   │
│   ├── workflows/               # Orchestration layer
│   │   ├── sprint-cycle.ts      # Sprint planning/execution
│   │   ├── daily-standup.ts     # Daily task management
│   │   ├── project-lifecycle.ts # Project creation/completion
│   │   └── bulk-operations.ts   # Batch processing with safety
│   │
│   ├── safety/                  # Safety layer (Propose → Approve → Apply)
│   │   ├── proposal.ts          # Change proposal generator
│   │   ├── diff.ts              # State comparison utilities
│   │   ├── validator.ts         # Pre-change validation
│   │   └── rollback.ts          # Rollback mechanisms
│   │
│   ├── sync/                    # Bidirectional sync
│   │   ├── snapshot.ts          # Local state snapshots
│   │   ├── conflict.ts          # Conflict resolution
│   │   └── cache.ts             # Query result caching
│   │
│   └── cli/                     # CLI interface (optional)
│       ├── commands/
│       └── formatters/
│
├── schemas/                     # JSON Schema definitions
│   ├── databases/               # Per-database schemas
│   └── operations/              # Operation request/response schemas
│
├── tests/
│   ├── unit/
│   ├── integration/
│   └── fixtures/                # Mock Notion responses
│
├── .github/
│   ├── agents/                  # Copilot agents
│   ├── prompts/                 # Reusable prompts
│   └── instructions/            # Coding instructions
│
└── config/
    ├── databases.json           # Database ID mappings
    └── workflows.json           # Workflow configurations
```

## Key Design Patterns

### 1. Type-Safe Database Contracts

````typescript
/**
 * Strongly-typed database definitions matching your Notion schema
 */

export const DATABASE_IDS = {
  TEAMS: '2d5a4e63-bf23-816b-9f75-000b219f7713',
  PROJECTS: '2d5a4e63-bf23-8115-a70f-000bc1ef9d05',
  TASKS: '2d5a4e63-bf23-8137-8277-000b41c867c3',
  MEETINGS: '2caa4e63-bf23-815a-8981-000bbdbb7f0b',
  PROMPTS: '2d5a4e63-bf23-81ad-ab3f-000bfbb91ed9',
  TECH_STACK: '276a4e63-bf23-80e2-bbae-000b2fa9662a',
  TEMPLATES: '2d5a4e63-bf23-8189-943d-000bdd7af066',
  SOPS: '2d8a4e63-bf23-80d1-8167-000bb402c275',
  CALENDAR: '2d5a4e63-bf23-8140-b0d7-000b33493b7e',
} as const;

export type DatabaseId = (typeof DATABASE_IDS)[keyof typeof DATABASE_IDS];

// Property type definitions
export type ProjectStatus = 'Active' | 'Completed' | 'On Hold' | 'Cancelled';
export type Milestone = 'M1' | 'M2' | 'M3';
export type Phase = 'P1.1' | 'P1.2' | 'P1.3' | 'P2.1' | 'P2.2' | 'P2.3' | 'P3.1' | 'P3.2' | 'P3.3';
export type Domain = 'OPS' | 'PROD' | 'DES' | 'ENG' | 'MKT' | 'RES';
export type Priority = 'High' | 'Medium' | 'Low';
export type MeetingType = 'Standup' | 'Sprint Planning' | 'Post-mortem' | 'Team Sync' | 'Ad Hoc';
export type Cadence = 'Daily' | 'Weekly' | 'Biweekly' | 'Monthly' | 'Ad Hoc';
````

### 2. Repository Pattern with MCP Abstraction

````typescript
import type { DatabaseId } from '../../core/types/databases';
import type { McpClient } from '../../mcp/client';
import type { QueryFilter, PageProperties } from '../../core/types/notion';

export abstract class BaseRepository<TEntity, TCreateInput, TUpdateInput> {
  constructor(
    protected readonly mcp: McpClient,
    protected readonly databaseId: DatabaseId
  ) {}

  /**
   * Query entities with type-safe filters
   */
  abstract findMany(filter?: QueryFilter): Promise<TEntity[]>;

  /**
   * Find single entity by ID
   */
  abstract findById(id: string): Promise<TEntity | null>;

  /**
   * Create new entity - returns proposal for safety workflow
   */
  abstract create(input: TCreateInput): Promise<ChangeProposal<TEntity>>;

  /**
   * Update entity - returns proposal for safety workflow
   */
  abstract update(id: string, input: TUpdateInput): Promise<ChangeProposal<TEntity>>;

  /**
   * Convert Notion page properties to domain entity
   */
  protected abstract toDomainEntity(page: NotionPage): TEntity;

  /**
   * Convert domain input to Notion properties
   */
  protected abstract toNotionProperties(input: TCreateInput | TUpdateInput): PageProperties;
}
````

### 3. Safety Layer (Propose → Approve → Apply)

````typescript
export interface ChangeProposal<T> {
  id: string;
  type: 'create' | 'update' | 'delete' | 'bulk';
  target: {
    database: DatabaseId;
    pageId?: string;
  };
  currentState: T | null;
  proposedState: T;
  diff: PropertyDiff[];
  sideEffects: SideEffect[];
  validation: ValidationResult;
  createdAt: Date;
}

export interface PropertyDiff {
  property: string;
  oldValue: unknown;
  newValue: unknown;
  impact: 'low' | 'medium' | 'high';
}

export interface SideEffect {
  type: 'relation_update' | 'rollup_recalc' | 'cascade';
  description: string;
  affectedItems: string[];
}

export class ProposalManager {
  private pendingProposals = new Map<string, ChangeProposal<unknown>>();

  /**
   * Create a change proposal (does NOT execute)
   */
  async propose<T>(change: Omit<ChangeProposal<T>, 'id' | 'createdAt'>): Promise<ChangeProposal<T>> {
    const proposal: ChangeProposal<T> = {
      ...change,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    };

    this.pendingProposals.set(proposal.id, proposal);
    return proposal;
  }

  /**
   * Execute approved proposal
   */
  async apply(proposalId: string): Promise<ApplyResult> {
    const proposal = this.pendingProposals.get(proposalId);
    if (!proposal) throw new ProposalNotFoundError(proposalId);

    // Execute the change via MCP
    // ... implementation
  }

  /**
   * Format proposal for human review
   */
  formatForReview<T>(proposal: ChangeProposal<T>): string {
    // Generate markdown summary
    // ... implementation
  }
}
````

### 4. Workflow Orchestration

````typescript
import type { ProjectRepository } from '../domain/repositories/project.repository';
import type { TaskRepository } from '../domain/repositories/task.repository';
import type { MeetingRepository } from '../domain/repositories/meeting.repository';
import type { ProposalManager } from '../safety/proposal';

export interface SprintConfig {
  teamId: string;
  name: string;
  startDate: Date;
  endDate: Date;
  milestone: Milestone;
  phase: Phase;
  tasks: TaskInput[];
}

export class SprintCycleWorkflow {
  constructor(
    private readonly projects: ProjectRepository,
    private readonly tasks: TaskRepository,
    private readonly meetings: MeetingRepository,
    private readonly proposals: ProposalManager
  ) {}

  /**
   * Initialize a new sprint with all required artifacts
   * Returns proposals for review before execution
   */
  async planSprint(config: SprintConfig): Promise<SprintProposal> {
    // 1. Create project proposal
    const projectProposal = await this.projects.create({
      name: config.name,
      status: 'Active',
      milestone: config.milestone,
      phase: config.phase,
      startDate: config.startDate,
      endDate: config.endDate,
      teamId: config.teamId,
    });

    // 2. Create task proposals
    const taskProposals = await Promise.all(
      config.tasks.map((task) =>
        this.tasks.create({
          ...task,
          projectId: projectProposal.proposedState.id,
          teamId: config.teamId,
        })
      )
    );

    // 3. Create meeting proposals
    const meetingProposals = await this.createSprintMeetings(config);

    return {
      project: projectProposal,
      tasks: taskProposals,
      meetings: meetingProposals,
      summary: this.generateSprintSummary(projectProposal, taskProposals, meetingProposals),
    };
  }

  /**
   * Execute all approved sprint proposals
   */
  async executeSprint(sprintProposal: SprintProposal): Promise<SprintResult> {
    // Apply in dependency order: project → tasks → meetings
    // ... implementation
  }
}
````

### 5. MCP Client with Middleware

````typescript
import type { McpTool, McpRequest, McpResponse } from './types';

type Middleware = (req: McpRequest, next: () => Promise<McpResponse>) => Promise<McpResponse>;

export class McpClient {
  private middlewares: Middleware[] = [];

  constructor(private readonly serverUrl: string) {
    // Default middlewares
    this.use(rateLimiterMiddleware({ requestsPerSecond: 3 }));
    this.use(retryMiddleware({ maxRetries: 3, backoff: 'exponential' }));
    this.use(loggerMiddleware());
  }

  use(middleware: Middleware): this {
    this.middlewares.push(middleware);
    return this;
  }

  async call<T>(tool: McpTool, params: Record<string, unknown>): Promise<T> {
    const request: McpRequest = { tool, params, timestamp: Date.now() };

    // Build middleware chain
    const chain = this.middlewares.reduceRight(
      (next, middleware) => () => middleware(request, next),
      () => this.executeCall<T>(request)
    );

    return chain();
  }

  private async executeCall<T>(request: McpRequest): Promise<T> {
    // Actual MCP tool invocation
    // ... implementation
  }
}
````

### 6. Type-Safe Query Builder

````typescript
export class NotionQueryBuilder<T extends DatabaseId> {
  private filters: FilterCondition[] = [];
  private sorts: SortCondition[] = [];
  private pageSize = 100;

  constructor(private readonly databaseId: T) {}

  where<K extends keyof DatabaseSchema[T]>(
    property: K,
    operator: FilterOperator,
    value: DatabaseSchema[T][K]
  ): this {
    this.filters.push({ property: String(property), operator, value });
    return this;
  }

  and(...conditions: FilterCondition[]): this {
    this.filters.push({ type: 'and', conditions });
    return this;
  }

  or(...conditions: FilterCondition[]): this {
    this.filters.push({ type: 'or', conditions });
    return this;
  }

  orderBy(property: string, direction: 'ascending' | 'descending' = 'ascending'): this {
    this.sorts.push({ property, direction });
    return this;
  }

  limit(size: number): this {
    this.pageSize = Math.min(size, 100);
    return this;
  }

  build(): QueryDataSourceParams {
    return {
      database_id: this.databaseId,
      filter: this.buildFilter(),
      sorts: this.sorts,
      page_size: this.pageSize,
    };
  }
}

// Usage example:
// const query = new NotionQueryBuilder(DATABASE_IDS.TASKS)
//   .where('done', 'equals', false)
//   .where('priority', 'equals', 'High')
//   .orderBy('due', 'ascending')
//   .limit(50)
//   .build();
````

## Advanced Use Cases

### 1. Batch Operations with Safety

````typescript
export class BulkOperationManager {
  private readonly BATCH_SIZE = 50;

  async bulkUpdate<T>(
    repository: BaseRepository<T, unknown, unknown>,
    items: Array<{ id: string; updates: Partial<T> }>
  ): Promise<BulkProposal<T>> {
    // Enforce batch limits
    if (items.length > this.BATCH_SIZE) {
      throw new BatchLimitExceededError(items.length, this.BATCH_SIZE);
    }

    // Generate individual proposals
    const proposals = await Promise.all(items.map((item) => repository.update(item.id, item.updates)));

    // Aggregate into bulk proposal
    return {
      type: 'bulk',
      count: proposals.length,
      proposals,
      dryRunSummary: this.generateDryRunSummary(proposals),
      estimatedDuration: this.estimateDuration(proposals),
    };
  }
}
````

### 2. Snapshot & Sync

````typescript
export class SnapshotManager {
  private snapshotsDir = '.notion-snapshots';

  /**
   * Capture current state of a database
   */
  async captureSnapshot(databaseId: DatabaseId): Promise<Snapshot> {
    const pages = await this.mcp.queryAll(databaseId);

    const snapshot: Snapshot = {
      id: crypto.randomUUID(),
      databaseId,
      capturedAt: new Date(),
      pageCount: pages.length,
      pages: pages.map((p) => ({
        id: p.id,
        properties: p.properties,
        lastEditedTime: p.last_edited_time,
      })),
    };

    await this.persistSnapshot(snapshot);
    return snapshot;
  }

  /**
   * Compare current state with snapshot
   */
  async diff(snapshotId: string): Promise<SnapshotDiff> {
    const snapshot = await this.loadSnapshot(snapshotId);
    const currentPages = await this.mcp.queryAll(snapshot.databaseId);

    return {
      added: this.findAdded(snapshot.pages, currentPages),
      removed: this.findRemoved(snapshot.pages, currentPages),
      modified: this.findModified(snapshot.pages, currentPages),
    };
  }
}
````

### 3. Analytics & Reporting

````typescript
export class AnalyticsService {
  async getTeamMetrics(teamId: string): Promise<TeamMetrics> {
    const [projects, tasks] = await Promise.all([
      this.projects.findByTeam(teamId),
      this.tasks.findByTeam(teamId),
    ]);

    const completedTasks = tasks.filter((t) => t.done);
    const overdueTasks = tasks.filter((t) => !t.done && t.due && new Date(t.due) < new Date());

    return {
      totalProjects: projects.length,
      activeProjects: projects.filter((p) => p.status === 'Active').length,
      completedProjects: projects.filter((p) => p.status === 'Completed').length,
      totalTasks: tasks.length,
      completedTasks: completedTasks.length,
      completionRate: (completedTasks.length / tasks.length) * 100,
      overdueTasks: overdueTasks.length,
      tasksByPriority: this.groupBy(tasks, 'priority'),
    };
  }

  async generateSprintReport(projectId: string): Promise<SprintReport> {
    // ... implementation
  }
}
````

## Configuration

````json
{
  "databases": {
    "teams": {
      "id": "2d5a4e63-bf23-816b-9f75-000b219f7713",
      "properties": {
        "name": { "type": "title", "required": true },
        "projects": { "type": "relation", "target": "projects" },
        "tasks": { "type": "relation", "target": "tasks" }
      }
    },
    "projects": {
      "id": "2d5a4e63-bf23-8115-a70f-000bc1ef9d05",
      "properties": {
        "name": { "type": "title", "required": true },
        "status": { "type": "select", "options": ["Active", "Completed", "On Hold", "Cancelled"] },
        "milestone": { "type": "select", "options": ["M1", "M2", "M3"] },
        "phase": { "type": "select", "options": ["P1.1", "P1.2", "P1.3", "P2.1", "P2.2", "P2.3", "P3.1", "P3.2", "P3.3"] },
        "domain": { "type": "select", "options": ["OPS", "PROD", "DES", "ENG", "MKT", "RES"] },
        "startDate": { "type": "date" },
        "endDate": { "type": "date" },
        "team": { "type": "relation", "target": "teams" }
      }
    }
  },
  "safetyLimits": {
    "maxBatchSize": 50,
    "rateLimitPerSecond": 3,
    "requireApprovalForBulk": true
  }
}
````

## Key Benefits

| Aspect              | Benefit                                                            |
| ------------------- | ------------------------------------------------------------------ |
| **Type Safety**     | Full TypeScript coverage with database schema types                |
| **Safety Workflow** | Built-in Propose → Approve → Apply pattern prevents accidents      |
| **Testability**     | Repository pattern enables easy mocking and unit testing           |
| **Extensibility**   | Middleware chain allows adding logging, retry, rate limiting       |
| **Domain Clarity**  | Clean separation between MCP operations and business logic         |
| **Batch Safety**    | Enforced limits and dry-run summaries for bulk operations          |
| **Sync Support**    | Snapshot/diff capabilities for auditing and conflict detection     |
| **Copilot-Ready**   | Architecture aligns with agent patterns for automated workflows    |

This architecture gives you a robust foundation for advanced Notion automation while maintaining the safety guarantees required by your workspace policies.