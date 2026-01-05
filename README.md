# Notionista

TypeScript SDK for Digital Herencia Notion workspace automation with MCP integration.

## Overview

Notionista provides high-level workflow orchestration for managing sprint cycles, daily standups, and analytics in your Notion workspace. Built with a safety-first approach, all operations use the **Propose → Approve → Apply** pattern to prevent accidental changes.

## Features

### 🔄 Workflow Orchestration

- **Sprint Cycle Management**: Plan 2-week sprints with automated creation of projects, tasks, and meetings
- **Daily Standup Reports**: Generate task summaries by team with completion metrics and overdue tracking
- **Analytics & Metrics**: Comprehensive team and project performance insights

### 🛡️ Safety First

- **Proposal System**: All mutations return proposals that must be explicitly approved before execution
- **Change Preview**: Review property diffs, side effects, and validation results before applying changes
- **Rollback Support**: Track proposal history and status throughout the lifecycle

### 📊 Type-Safe

- Fully typed with TypeScript strict mode
- Zod schemas for runtime validation
- IntelliSense support for all APIs

## Installation

```bash
npm install notionista
# or
pnpm add notionista
```

## Quick Start

### Sprint Planning

```typescript
import { SprintCycleWorkflow } from 'notionista';

// Initialize the workflow with repository instances
const sprintWorkflow = new SprintCycleWorkflow(
  projectRepository,
  taskRepository,
  meetingRepository
);

// Plan a new sprint
const proposal = await sprintWorkflow.planSprint({
  teamId: 'team-123',
  name: 'Sprint 1 - Q1 2026',
  startDate: new Date('2026-01-06'),
  endDate: new Date('2026-01-20'),
  milestone: 'M1',
  phase: 'P1.1',
  domain: 'ENG',
  tasks: [
    {
      name: 'Implement authentication',
      priority: 'High',
      due: '2026-01-10',
      teamId: 'team-123',
    },
    {
      name: 'Design dashboard UI',
      priority: 'Medium',
      due: '2026-01-15',
      teamId: 'team-123',
    },
  ],
});

// Review the proposal
console.log(sprintWorkflow.formatForReview(proposal));

// After approval, execute the sprint
// (Implementation requires proposal manager integration)
```

### Daily Standup

```typescript
import { DailyStandupWorkflow } from 'notionista';

const standupWorkflow = new DailyStandupWorkflow(taskRepository, teamRepository);

// Generate standup report for all teams
const report = await standupWorkflow.generateStandupReport();

// Format and display the report
console.log(standupWorkflow.formatReport(report));

// Generate quick summary for a specific team
const teamSummary = await standupWorkflow.generateTeamQuickSummary('team-123');
console.log(teamSummary);
```

### Analytics

```typescript
import { AnalyticsService } from 'notionista';

const analytics = new AnalyticsService(teamRepository, projectRepository, taskRepository);

// Get team metrics
const teamMetrics = await analytics.getTeamMetrics('team-123');
console.log(analytics.formatTeamReport(teamMetrics));

// Get project metrics
const projectMetrics = await analytics.getProjectMetrics('project-456');
console.log(`Completion Rate: ${projectMetrics.completionRate}%`);
console.log(`On Track: ${projectMetrics.onTrack ? '✅' : '❌'}`);

// Get overall analytics
const overall = await analytics.getOverallAnalytics();
console.log(analytics.formatOverallReport(overall));
```

## Architecture

```
src/
├── core/types/           # Type definitions and constants
├── safety/               # Proposal system (Propose → Approve → Apply)
├── domain/repositories/  # Repository interfaces
├── schemas/              # Zod schemas for entities
└── workflows/            # High-level workflow orchestration
    ├── sprint-cycle.ts   # Sprint planning and execution
    ├── daily-standup.ts  # Daily standup reports
    └── analytics.ts      # Team and project metrics
```

## API Reference

### SprintCycleWorkflow

Orchestrates sprint planning and execution for 2-week sprint cycles.

**Methods:**
- `planSprint(config: SprintConfig): Promise<SprintProposal>` - Plan a new sprint with project, tasks, and meetings
- `formatForReview(proposal: SprintProposal): string` - Format proposal as markdown for review

### DailyStandupWorkflow

Generates daily standup reports with task summaries by team.

**Methods:**
- `generateStandupReport(config?: StandupConfig): Promise<StandupReport>` - Generate complete standup report
- `formatReport(report: StandupReport): string` - Format report as markdown
- `generateTeamQuickSummary(teamId: string, date?: Date): Promise<string>` - Quick summary for a specific team

### AnalyticsService

Provides team and project performance metrics.

**Methods:**
- `getTeamMetrics(teamId: string): Promise<TeamMetrics>` - Get comprehensive team metrics
- `getProjectMetrics(projectId: string): Promise<ProjectMetrics>` - Get project progress and metrics
- `getOverallAnalytics(): Promise<OverallAnalytics>` - Get workspace-wide analytics
- `formatOverallReport(analytics: OverallAnalytics): string` - Format overall report as markdown
- `formatTeamReport(metrics: TeamMetrics): string` - Format team report as markdown

## Development

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Run tests
npm test

# Type checking
npm run type-check

# Linting
npm run lint
npm run lint:fix

# Format code
npm run format
```

## Project Structure

This implementation covers:
- ✅ **EPIC-006**: Workflow Orchestration
  - ✅ **TASK-023**: Sprint Cycle Workflow
  - ✅ **TASK-024**: Daily Standup Workflow
  - ✅ **TASK-025**: Analytics Service

## Dependencies

- **EPIC-003**: Domain Layer (repository interfaces defined, full implementation pending)
- **EPIC-005**: Safety Layer (ProposalManager implemented)

## Future Enhancements

- Full MCP client implementation for live Notion integration
- Repository implementations with actual Notion API calls
- CLI interface for workflow execution
- Snapshot and sync capabilities
- Bulk operations with safety limits

## License

MIT

## Contributing

This SDK is part of the Digital Herencia Notion workspace automation project. For issues and feature requests, please refer to the [GitHub issues](https://github.com/DigitalHerencia/Notionista/issues).
