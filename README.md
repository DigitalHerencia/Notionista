# Notionista - TypeScript SDK for Digital Herencia Notion Workspace

A type-safe TypeScript SDK for automating Digital Herencia's Notion workspace using the Model Context Protocol (MCP).

## Features

- **Type-Safe Domain Layer**: Strongly-typed entities for Teams, Projects, Tasks, and Meetings
- **Repository Pattern**: Clean abstraction over MCP operations with CRUD methods
- **Safety Workflow**: All mutations return `ChangeProposal` objects (Propose → Approve → Apply pattern)
- **Relation Traversal**: Navigate between related entities (teams, projects, tasks)
- **Computed Properties**: Automatic rollup calculations (completion rates, metrics)
- **Property Diff**: Track changes between current and proposed states
- **Side Effect Detection**: Understand the impact of changes before applying them

## Installation

```bash
npm install
```

## Project Structure

```
notionista/
├── src/
│   ├── core/
│   │   ├── constants/      # Database IDs and type definitions
│   │   ├── errors/         # Custom error hierarchy
│   │   └── types/          # TypeScript type definitions
│   │       ├── schemas.ts  # Zod schemas for entities
│   │       ├── proposals.ts # ChangeProposal types
│   │       └── notion.ts   # Notion API types
│   ├── mcp/
│   │   └── client.ts       # MCP client interface
│   └── domain/
│       └── repositories/   # Repository implementations
│           ├── base.repository.ts
│           ├── team.repository.ts
│           ├── project.repository.ts
│           ├── task.repository.ts
│           └── meeting.repository.ts
```

## Usage

### Basic Repository Operations

```typescript
import { TeamRepository, MockMcpClient } from 'notionista';

// Initialize repository with MCP client
const client = new MockMcpClient();
const teamRepo = new TeamRepository(client);

// Find all teams
const teams = await teamRepo.findMany();

// Find a specific team
const team = await teamRepo.findById('team-id');

// Search teams by name
const engineeringTeams = await teamRepo.findByName('engineering');
```

### Safety Workflow (Propose → Approve → Apply)

All create and update operations return a `ChangeProposal` instead of executing immediately:

```typescript
import { TeamRepository, MockMcpClient } from 'notionista';

const teamRepo = new TeamRepository(new MockMcpClient());

// Step 1: Create a proposal
const proposal = await teamRepo.create({
  name: 'Engineering Team'
});

// Step 2: Review the proposal
console.log('Type:', proposal.type); // 'create'
console.log('Proposed state:', proposal.proposedState);
console.log('Property diffs:', proposal.diff);
console.log('Side effects:', proposal.sideEffects);
console.log('Validation:', proposal.validation);

// Step 3: Apply the proposal (after approval)
const newTeam = await teamRepo.executeCreate(proposal);
console.log('Created team:', newTeam);
```

### Update Operations

```typescript
// Step 1: Get current state and create update proposal
const updateProposal = await teamRepo.update('team-id', {
  name: 'Updated Team Name'
});

// Step 2: Review changes
console.log('Current:', updateProposal.currentState);
console.log('Proposed:', updateProposal.proposedState);
console.log('Diffs:', updateProposal.diff);

// Step 3: Apply the update
const updatedTeam = await teamRepo.executeUpdate(updateProposal);
```

### Project Repository

```typescript
import { ProjectRepository, MockMcpClient } from 'notionista';

const projectRepo = new ProjectRepository(new MockMcpClient());

// Create a project proposal
const proposal = await projectRepo.create({
  name: 'Sprint 1',
  status: 'Active',
  milestone: 'M1',
  phase: 'P1.1',
  domain: 'ENG',
  startDate: '2026-01-01',
  endDate: '2026-01-14',
  teamId: 'team-id'
});

// Find projects by status
const activeProjects = await projectRepo.findActive();
const completedProjects = await projectRepo.findCompleted();

// Find by milestone
const m1Projects = await projectRepo.findByMilestone('M1');

// Find by team
const teamProjects = await projectRepo.findByTeam('team-id');
```

### Task Repository

```typescript
import { TaskRepository, MockMcpClient } from 'notionista';

const taskRepo = new TaskRepository(new MockMcpClient());

// Create a task proposal
const proposal = await taskRepo.create({
  name: 'Implement feature X',
  done: false,
  priority: 'High',
  due: '2026-01-15',
  projectId: 'project-id',
  teamId: 'team-id'
});

// Find incomplete tasks
const incompleteTasks = await taskRepo.findIncomplete();

// Find high priority tasks
const highPriorityTasks = await taskRepo.findHighPriority();

// Find overdue tasks
const overdueTasks = await taskRepo.findOverdue();

// Calculate completion rate
const completionRate = await taskRepo.getProjectCompletionRate('project-id');
console.log(`Project is ${completionRate}% complete`);
```

### Meeting Repository

```typescript
import { MeetingRepository, MockMcpClient } from 'notionista';

const meetingRepo = new MeetingRepository(new MockMcpClient());

// Create a meeting proposal
const proposal = await meetingRepo.create({
  name: 'Sprint Planning 2026-01-15',
  type: 'Sprint Planning',
  cadence: 'Biweekly',
  date: '2026-01-15T10:00:00Z',
  attendeeTeamIds: ['team-1', 'team-2'],
  projectIds: ['project-1']
});

// Find meetings by type
const standups = await meetingRepo.findStandups();
const sprintPlannings = await meetingRepo.findSprintPlannings();

// Find upcoming meetings
const upcomingMeetings = await meetingRepo.findUpcoming();
```

## ChangeProposal Structure

```typescript
interface ChangeProposal<T> {
  id: string;                    // Unique proposal ID
  type: 'create' | 'update';     // Operation type
  target: {
    database: DatabaseId;        // Target database
    pageId?: string;             // Page ID (for updates)
  };
  currentState: T | null;        // Current state (null for creates)
  proposedState: T;              // Proposed new state
  diff: PropertyDiff[];          // Property-level changes
  sideEffects: SideEffect[];     // Related impacts
  validation: ValidationResult;  // Validation status
  createdAt: Date;              // Proposal timestamp
}
```

## Property Diffs

Each proposal includes detailed diffs showing what changed:

```typescript
interface PropertyDiff {
  property: string;              // Property name
  oldValue: unknown;            // Current value
  newValue: unknown;            // Proposed value
  impact: 'low' | 'medium' | 'high'; // Change impact
}
```

## Database IDs

The following databases are configured:

- **TEAMS**: `2d5a4e63-bf23-8151-9b98-c81833668844`
- **PROJECTS**: `2d5a4e63-bf23-81b1-b507-f5ac308958e6`
- **TASKS**: `2d5a4e63-bf23-816f-a217-ef754ce4a70e`
- **MEETINGS**: `2d5a4e63-bf23-8168-af99-d85e20bfb76f`

## Development

### Build

```bash
npm run build
```

### Test

```bash
npm test
```

### Type Check

```bash
npm run type-check
```

### Lint

```bash
npm run lint
```

## Architecture

This SDK follows a layered architecture:

1. **Core Layer**: Type definitions, constants, and error handling
2. **MCP Layer**: Abstract interface for MCP client operations
3. **Domain Layer**: Repository pattern with entity mappings
4. **Safety Layer**: ChangeProposal system for mutation safety

## Type Safety

All entities are validated using Zod schemas with TypeScript type inference:

```typescript
import { Team, Project, Task, Meeting } from 'notionista';

// All types are automatically inferred
const team: Team = {
  id: 'team-id',
  name: 'Engineering Team',
  projects: ['project-1', 'project-2'],
  tasks: ['task-1', 'task-2'],
  meetings: ['meeting-1'],
  projectsComplete: 5,
  tasksCompleted: 23
};
```

## Error Handling

Custom error hierarchy for better error handling:

```typescript
import {
  NotionistaError,
  RepositoryError,
  EntityNotFoundError,
  DomainValidationError
} from 'notionista';

try {
  const team = await teamRepo.findByIdOrThrow('non-existent');
} catch (error) {
  if (error instanceof EntityNotFoundError) {
    console.error('Team not found:', error.message);
  }
}
```

## License

MIT

## Contributing

This SDK is designed to work with Digital Herencia's specific Notion workspace structure. See `SPEC.md` for architecture details.
