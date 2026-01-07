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
  // Repositories are kept for interface compatibility but not used
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(
    private readonly _tasks: ITaskRepository,
    private readonly _teams: ITeamRepository
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
        ? Math.round(
            (teamSummaries.reduce((sum, ts) => sum + ts.completionRate, 0) / teamSummaries.length) *
              10
          ) / 10
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
 *
 * @param team - The team to generate summary for
 * @param allTasks - All tasks (will be filtered to team tasks)
 * @param includeDone - Whether to include completed tasks in details
 * @param currentTime - Current time for overdue calculation (defaults to Date.now())
 */
function generateTeamTaskSummary(
  team: Team,
  allTasks: Task[],
  includeDone: boolean,
  currentTime: string = new Date().toISOString()
): TeamTaskSummary {
  const teamTasks = allTasks.filter((task) => task.teamId === team.id);

  const filteredTasks = includeDone ? teamTasks : teamTasks.filter((task) => !task.done);

  const taskDetails: TaskDetail[] = filteredTasks.map((task) => ({
    id: task.id,
    name: task.name,
    done: task.done,
    priority: task.priority,
    due: task.due,
    isOverdue: !task.done && task.due ? task.due < currentTime : false,
    projectId: task.projectId,
  }));

  const completedTasks = teamTasks.filter((t) => t.done).length;
  const activeTasks = teamTasks.filter((t) => !t.done).length;
  const overdueTasks = teamTasks.filter((t) => !t.done && t.due && t.due < currentTime).length;
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
