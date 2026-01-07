import type { Task, Team } from '../schemas';
import type { ITaskRepository, ITeamRepository } from '../domain/repositories';

/**
 * Configuration for generating a daily standup report
 */
export interface StandupConfig {
  teamIds?: string[]; // If empty, generate for all teams
  date?: Date; // Date for the standup (default: today)
  includeDone?: boolean; // Include completed tasks (default: false)
}

/**
 * Task summary for a team
 */
export interface TeamTaskSummary {
  teamId: string;
  teamName: string;
  totalTasks: number;
  completedTasks: number;
  activeTasks: number;
  overdueTasks: number;
  highPriorityTasks: number;
  completionRate: number;
  tasks: TaskDetail[];
}

/**
 * Detailed task information
 */
export interface TaskDetail {
  id: string;
  name: string;
  done: boolean;
  priority: string | null;
  due: string | null;
  isOverdue: boolean;
  projectId?: string;
}

/**
 * Complete standup report
 */
export interface StandupReport {
  date: Date;
  teams: TeamTaskSummary[];
  overallSummary: {
    totalTeams: number;
    totalTasks: number;
    completedTasks: number;
    activeTasks: number;
    overdueTasks: number;
    averageCompletionRate: number;
  };
}

/**
 * Daily Standup Workflow - Pure Calculation Functions
 *
 * @deprecated This workflow contains execution-oriented methods that query data.
 *
 * In a declarative control layer, standup reports should be generated from
 * externally-fetched data, not by executing queries internally.
 *
 * The correct pattern is:
 * 1. Generate query intents using repositories
 * 2. Execute queries externally (via VS Code MCP host)
 * 3. Pass fetched data to pure calculation functions
 */
export class DailyStandupWorkflow {
  constructor(
    private readonly tasks: ITaskRepository,
    private readonly teams: ITeamRepository
  ) {}

  /**
   * @deprecated Use generateStandupReportFromData() with externally-fetched data
   */
  async generateStandupReport(_config: StandupConfig = {}): Promise<StandupReport> {
    throw new Error(
      'DailyStandupWorkflow methods require execution. Use generateStandupReportFromData() with fetched data instead.'
    );
  }
}

/**
 * Generate standup report from fetched data (pure function)
 */
export function generateStandupReportFromData(
  teams: Team[],
  tasks: Task[],
  config: StandupConfig = {}
): StandupReport {
  const date = config.date || new Date();
  const includeDone = config.includeDone || false;

  // Filter teams if specific IDs provided
  const targetTeams = config.teamIds
    ? teams.filter((team) => config.teamIds!.includes(team.id))
    : teams;

  // Generate team summaries
  const teamSummaries = targetTeams.map((team) =>
    generateTeamTaskSummary(team, tasks, includeDone)
  );

  // Calculate overall summary
  const overallSummary = {
    totalTeams: teamSummaries.length,
    totalTasks: teamSummaries.reduce((sum, ts) => sum + ts.totalTasks, 0),
    completedTasks: teamSummaries.reduce((sum, ts) => sum + ts.completedTasks, 0),
    activeTasks: teamSummaries.reduce((sum, ts) => sum + ts.activeTasks, 0),
    overdueTasks: teamSummaries.reduce((sum, ts) => sum + ts.overdueTasks, 0),
    averageCompletionRate:
      teamSummaries.length > 0
        ? teamSummaries.reduce((sum, ts) => sum + ts.completionRate, 0) / teamSummaries.length
        : 0,
  };

  return {
    date,
    teams: teamSummaries,
    overallSummary,
  };
}

/**
 * Generate task summary for a single team (pure function)
 */
function generateTeamTaskSummary(
  team: Team,
  allTasks: Task[],
  includeDone: boolean
): TeamTaskSummary {
  const teamTasks = allTasks.filter((task) => task.teamId === team.id);
  const now = new Date().toISOString();

  const filteredTasks = includeDone ? teamTasks : teamTasks.filter((task) => !task.done);

  const taskDetails: TaskDetail[] = filteredTasks.map((task) => ({
    id: task.id,
    name: task.name,
    done: task.done,
    priority: task.priority,
    due: task.due,
    isOverdue: !task.done && task.due ? task.due < now : false,
    projectId: task.projectId,
  }));

  const completedTasks = teamTasks.filter((t) => t.done).length;
  const activeTasks = teamTasks.filter((t) => !t.done).length;
  const overdueTasks = teamTasks.filter((t) => !t.done && t.due && t.due < now).length;
  const highPriorityTasks = teamTasks.filter((t) => !t.done && t.priority === 'High').length;

  return {
    teamId: team.id,
    teamName: team.name,
    totalTasks: teamTasks.length,
    completedTasks,
    activeTasks,
    overdueTasks,
    highPriorityTasks,
    completionRate: teamTasks.length > 0 ? (completedTasks / teamTasks.length) * 100 : 0,
    tasks: taskDetails,
  };
}
      : allTeams;

    // Generate team summaries
    const teamSummaries = await Promise.all(
      targetTeams.map((team) => this.generateTeamSummary(team, date, includeDone))
    );

    // Calculate overall summary
    const overallSummary = this.calculateOverallSummary(teamSummaries);

    return {
      date,
      teams: teamSummaries,
      overallSummary,
    };
  }

  /**
   * Generate task summary for a specific team
   *
   * @param team Team to summarize
   * @param date Reference date for the standup
   * @param includeDone Include completed tasks
   * @returns Team task summary
   */
  private async generateTeamSummary(
    team: Team,
    date: Date,
    includeDone: boolean
  ): Promise<TeamTaskSummary> {
    // Get all tasks for this team
    const allTasks = await this.tasks.findByTeam(team.id);

    // Filter tasks based on configuration
    const tasks = includeDone ? allTasks : allTasks.filter((task) => !task.done);

    // Convert to detailed format with overdue calculation
    const taskDetails = tasks.map((task) => this.createTaskDetail(task, date));

    // Calculate metrics
    const completedTasks = allTasks.filter((t) => t.done).length;
    const activeTasks = allTasks.filter((t) => !t.done).length;
    const overdueTasks = taskDetails.filter((t) => t.isOverdue).length;
    const highPriorityTasks = taskDetails.filter((t) => t.priority === 'High').length;
    const completionRate = allTasks.length > 0 ? (completedTasks / allTasks.length) * 100 : 0;

    return {
      teamId: team.id,
      teamName: team.name,
      totalTasks: allTasks.length,
      completedTasks,
      activeTasks,
      overdueTasks,
      highPriorityTasks,
      completionRate: Math.round(completionRate * 10) / 10, // Round to 1 decimal
      tasks: taskDetails,
    };
  }

  /**
   * Create detailed task information with overdue status
   *
   * @param task Task to detail
   * @param referenceDate Date to check if task is overdue
   * @returns Task detail
   */
  private createTaskDetail(task: Task, referenceDate: Date): TaskDetail {
    let isOverdue = false;
    if (!task.done && task.due) {
      const dueDate = new Date(task.due);
      isOverdue = dueDate < referenceDate;
    }

    return {
      id: task.id,
      name: task.name,
      done: task.done,
      priority: task.priority,
      due: task.due,
      isOverdue,
      projectId: task.projectId,
    };
  }

  /**
   * Calculate overall summary across all teams
   *
   * @param teamSummaries Array of team summaries
   * @returns Overall summary
   */
  private calculateOverallSummary(teamSummaries: TeamTaskSummary[]) {
    const totalTasks = teamSummaries.reduce((sum, team) => sum + team.totalTasks, 0);
    const completedTasks = teamSummaries.reduce((sum, team) => sum + team.completedTasks, 0);
    const activeTasks = teamSummaries.reduce((sum, team) => sum + team.activeTasks, 0);
    const overdueTasks = teamSummaries.reduce((sum, team) => sum + team.overdueTasks, 0);

    const averageCompletionRate =
      teamSummaries.length > 0
        ? teamSummaries.reduce((sum, team) => sum + team.completionRate, 0) / teamSummaries.length
        : 0;

    return {
      totalTeams: teamSummaries.length,
      totalTasks,
      completedTasks,
      activeTasks,
      overdueTasks,
      averageCompletionRate: Math.round(averageCompletionRate * 10) / 10,
    };
  }

  /**
   * Format standup report as markdown
   *
   * @param report Standup report to format
   * @returns Markdown-formatted report
   */
  formatReport(report: StandupReport): string {
    const lines: string[] = [
      `# Daily Standup Report`,
      ``,
      `**Date**: ${report.date.toLocaleDateString()}`,
      ``,
      `## Overall Summary`,
      ``,
      `- **Teams**: ${report.overallSummary.totalTeams}`,
      `- **Total Tasks**: ${report.overallSummary.totalTasks}`,
      `- **Completed**: ${report.overallSummary.completedTasks}`,
      `- **Active**: ${report.overallSummary.activeTasks}`,
      `- **Overdue**: ${report.overallSummary.overdueTasks} ⚠️`,
      `- **Average Completion Rate**: ${report.overallSummary.averageCompletionRate}%`,
      ``,
    ];

    // Add team summaries
    for (const team of report.teams) {
      lines.push(`## ${team.teamName}`);
      lines.push(``);
      lines.push(`**Metrics**:`);
      lines.push(`- Total: ${team.totalTasks}`);
      lines.push(`- Completed: ${team.completedTasks}`);
      lines.push(`- Active: ${team.activeTasks}`);
      lines.push(`- Overdue: ${team.overdueTasks}${team.overdueTasks > 0 ? ' ⚠️' : ''}`);
      lines.push(`- High Priority: ${team.highPriorityTasks}`);
      lines.push(`- Completion Rate: ${team.completionRate}%`);
      lines.push(``);

      if (team.tasks.length > 0) {
        lines.push(`**Tasks**:`);
        lines.push(``);

        // Group tasks by status
        const activeTasks = team.tasks.filter((t) => !t.done);
        const completedTasks = team.tasks.filter((t) => t.done);

        if (activeTasks.length > 0) {
          lines.push(`*Active Tasks:*`);
          for (const task of activeTasks) {
            const priorityBadge = task.priority ? ` [${task.priority}]` : '';
            const overdueBadge = task.isOverdue ? ' ⚠️ OVERDUE' : '';
            const dueDateStr = task.due ? ` - Due: ${new Date(task.due).toLocaleDateString()}` : '';
            lines.push(`- [ ] ${task.name}${priorityBadge}${dueDateStr}${overdueBadge}`);
          }
          lines.push(``);
        }

        if (completedTasks.length > 0) {
          lines.push(`*Completed Tasks:*`);
          for (const task of completedTasks) {
            lines.push(`- [x] ${task.name}`);
          }
          lines.push(``);
        }
      }

      lines.push(`---`);
      lines.push(``);
    }

    return lines.join('\n');
  }

  /**
   * Generate a quick summary for a specific team
   *
   * @param teamId Team ID to summarize
   * @param date Reference date (default: today)
   * @returns Formatted team summary
   */
  async generateTeamQuickSummary(teamId: string, date: Date = new Date()): Promise<string> {
    const allTeams = await this.teams.findMany();
    const team = allTeams.find((t) => t.id === teamId);

    if (!team) {
      throw new Error(`Team ${teamId} not found`);
    }

    const summary = await this.generateTeamSummary(team, date, false);

    const lines: string[] = [
      `**${summary.teamName}** - Quick Summary`,
      ``,
      `📊 ${summary.activeTasks} active • ✅ ${summary.completedTasks} done • ⚠️ ${summary.overdueTasks} overdue`,
      `📈 Completion: ${summary.completionRate}%`,
    ];

    if (summary.highPriorityTasks > 0) {
      lines.push(`🔥 ${summary.highPriorityTasks} high priority tasks`);
    }

    return lines.join('\n');
  }
}
