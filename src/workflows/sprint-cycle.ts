import type { ChangeProposal } from '../safety';
import type { Project, Task, Meeting } from '../schemas';
import type { Milestone, Phase, Domain } from '../core/types';
import type {
  IProjectRepository,
  ITaskRepository,
  IMeetingRepository,
  TaskCreateInput,
} from '../domain/repositories';

/**
 * Configuration for planning a sprint
 */
export interface SprintConfig {
  teamId: string;
  name: string;
  startDate: Date;
  endDate: Date;
  milestone: Milestone;
  phase: Phase;
  domain: Domain;
  tasks: TaskCreateInput[];
}

/**
 * Aggregate proposal for a complete sprint
 */
export interface SprintProposal {
  project: ChangeProposal<Project>;
  tasks: ChangeProposal<Task>[];
  meetings: ChangeProposal<Meeting>[];
  summary: SprintSummary;
}

/**
 * Summary of a sprint configuration
 */
export interface SprintSummary {
  projectName: string;
  teamId: string;
  duration: string;
  taskCount: number;
  meetingCount: number;
  milestone: Milestone;
  phase: Phase;
}

/**
 * Result of executing a sprint
 */
export interface SprintResult {
  success: boolean;
  projectId?: string;
  taskIds: string[];
  meetingIds: string[];
  errors: Error[];
  summary: string;
}

/**
 * Workflow orchestration for sprint cycle management
 * Implements the 2-week sprint planning process for Digital Herencia
 *
 * This is a DECLARATIVE workflow - it generates proposals and intents,
 * it does NOT execute operations.
 */
export class SprintCycleWorkflow {
  constructor(
    private readonly projects: IProjectRepository,
    private readonly tasks: ITaskRepository,
    private readonly meetings: IMeetingRepository
  ) {}

  /**
   * Plan a new sprint with all required artifacts
   * Returns proposals for review before execution (Propose step)
   *
   * Pure function - generates proposals without side effects
   *
   * @param config Sprint configuration
   * @returns Aggregate proposal containing project, tasks, and meetings
   */
  planSprint(config: SprintConfig): SprintProposal {
    // Validate configuration
    this.validateSprintConfig(config);

    // 1. Create project proposal
    const projectProposal = this.projects.create({
      name: config.name,
      status: 'Active',
      milestone: config.milestone,
      phase: config.phase,
      domain: config.domain,
      startDate: config.startDate.toISOString(),
      endDate: config.endDate.toISOString(),
      teamId: config.teamId,
    });

    // 2. Create task proposals linked to project
    const taskProposals = config.tasks.map((taskInput) =>
      this.tasks.create({
        ...taskInput,
        projectId: projectProposal.proposedState.id,
        teamId: config.teamId,
      })
    );

    // 3. Create meeting proposals for sprint cycle
    const meetingProposals = this.createSprintMeetings(config, projectProposal.proposedState.id);

    // 4. Generate summary
    const summary = this.generateSprintSummary(config, taskProposals.length, meetingProposals.length);

    return {
      project: projectProposal,
      tasks: taskProposals,
      meetings: meetingProposals,
      summary,
    };
  }

  /**
   * Create standard meetings for a sprint
   * - Sprint Planning meeting (start)
   * - Daily Standup template
   * - Post-mortem/Retrospective (end)
   *
   * Pure function - generates proposals without side effects
   *
   * @param config Sprint configuration
   * @param projectId Project ID to link meetings to
   * @returns Array of meeting proposals
   */
  private createSprintMeetings(config: SprintConfig, projectId: string): ChangeProposal<Meeting>[] {
    const meetings: ChangeProposal<Meeting>[] = [];

    // Sprint Planning meeting
    const planningMeeting = this.meetings.create({
      name: `Sprint Planning - ${config.name}`,
      type: 'Sprint Planning',
      cadence: 'Biweekly',
      date: config.startDate.toISOString(),
      teamIds: [config.teamId],
      projectIds: [projectId],
    });
    meetings.push(planningMeeting);

    // Daily Standup (recurring template)
    const standupMeeting = this.meetings.create({
      name: `Daily Standup - ${config.name}`,
      type: 'Standup',
      cadence: 'Daily',
      date: config.startDate.toISOString(),
      teamIds: [config.teamId],
      projectIds: [projectId],
    });
    meetings.push(standupMeeting);

    // Post-mortem / Retrospective meeting
    const postMortemMeeting = this.meetings.create({
      name: `Post-mortem - ${config.name}`,
      type: 'Post-mortem',
      cadence: 'Biweekly',
      date: config.endDate.toISOString(),
      teamIds: [config.teamId],
      projectIds: [projectId],
    });
    meetings.push(postMortemMeeting);

    return meetings;
  }

  /**
   * Generate a human-readable summary of the sprint
   *
   * @param config Sprint configuration
   * @param taskCount Number of tasks
   * @param meetingCount Number of meetings
   * @returns Sprint summary
   */
  private generateSprintSummary(
    config: SprintConfig,
    taskCount: number,
    meetingCount: number
  ): SprintSummary {
    const durationMs = config.endDate.getTime() - config.startDate.getTime();
    const durationDays = Math.ceil(durationMs / (1000 * 60 * 60 * 24));

    return {
      projectName: config.name,
      teamId: config.teamId,
      duration: `${durationDays} days`,
      taskCount,
      meetingCount,
      milestone: config.milestone,
      phase: config.phase,
    };
  }

  /**
   * Validate sprint configuration
   *
   * @param config Sprint configuration to validate
   * @throws Error if configuration is invalid
   */
  private validateSprintConfig(config: SprintConfig): void {
    if (!config.name || config.name.trim().length === 0) {
      throw new Error('Sprint name is required');
    }

    if (!config.teamId || config.teamId.trim().length === 0) {
      throw new Error('Team ID is required');
    }

    if (config.startDate >= config.endDate) {
      throw new Error('Sprint end date must be after start date');
    }

    const durationMs = config.endDate.getTime() - config.startDate.getTime();
    const durationDays = Math.ceil(durationMs / (1000 * 60 * 60 * 24));

    // Warn if sprint is not ~2 weeks (10-16 days)
    if (durationDays < 10 || durationDays > 16) {
      console.warn(`Sprint duration is ${durationDays} days. Recommended: 10-16 days (2 weeks)`);
    }

    if (!config.tasks || config.tasks.length === 0) {
      throw new Error('Sprint must have at least one task');
    }
  }

  /**
   * Format sprint proposal for review
   *
   * @param proposal Sprint proposal to format
   * @returns Markdown-formatted review text
   */
  formatForReview(proposal: SprintProposal): string {
    const lines: string[] = [
      `# Sprint Planning Proposal`,
      ``,
      `## Summary`,
      ``,
      `- **Project**: ${proposal.summary.projectName}`,
      `- **Team**: ${proposal.summary.teamId}`,
      `- **Duration**: ${proposal.summary.duration}`,
      `- **Milestone**: ${proposal.summary.milestone}`,
      `- **Phase**: ${proposal.summary.phase}`,
      `- **Tasks**: ${proposal.summary.taskCount}`,
      `- **Meetings**: ${proposal.summary.meetingCount}`,
      ``,
      `## Project`,
      ``,
      `- **ID**: ${proposal.project.id}`,
      `- **Name**: ${proposal.project.proposedState.name}`,
      `- **Status**: ${proposal.project.proposedState.status}`,
      `- **Start**: ${proposal.project.proposedState.startDate}`,
      `- **End**: ${proposal.project.proposedState.endDate}`,
      ``,
      `## Tasks (${proposal.tasks.length})`,
      ``,
    ];

    for (let i = 0; i < proposal.tasks.length; i++) {
      const task = proposal.tasks[i];
      if (task) {
        lines.push(`${i + 1}. **${task.proposedState.name}**`);
        if (task.proposedState.priority) {
          lines.push(`   - Priority: ${task.proposedState.priority}`);
        }
        if (task.proposedState.due) {
          lines.push(`   - Due: ${task.proposedState.due}`);
        }
      }
    }

    lines.push(``);
    lines.push(`## Meetings (${proposal.meetings.length})`);
    lines.push(``);

    for (const meeting of proposal.meetings) {
      lines.push(`- **${meeting.proposedState.name}**`);
      lines.push(`  - Type: ${meeting.proposedState.type}`);
      lines.push(`  - Date: ${meeting.proposedState.date}`);
    }

    lines.push(``);
    lines.push(`---`);
    lines.push(``);
    lines.push(
      `**Note**: All changes are proposals only. Use \`executeSprint()\` after approval to apply.`
    );

    return lines.join('\n');
  }
}
