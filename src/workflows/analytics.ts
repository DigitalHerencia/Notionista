import type { Project, Task } from '../schemas';
import type { ITeamRepository, IProjectRepository, ITaskRepository } from '../domain/repositories';
import type { ProjectStatus, Priority } from '../core/types';

/**
 * Metrics for a specific team
 */
export interface TeamMetrics {
  teamId: string;
  teamName: string;
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  projectsByStatus: Record<ProjectStatus, number>;
  totalTasks: number;
  completedTasks: number;
  activeTasks: number;
  completionRate: number;
  overdueTasks: number;
  tasksByPriority: Record<Priority, number>;
  velocity: number; // Tasks completed per day
}

/**
 * Metrics for a specific project
 */
export interface ProjectMetrics {
  projectId: string;
  projectName: string;
  status: ProjectStatus;
  teamId?: string;
  teamName?: string;
  totalTasks: number;
  completedTasks: number;
  activeTasks: number;
  completionRate: number;
  overdueTasks: number;
  tasksByPriority: Record<Priority, number>;
  startDate: string | null;
  endDate: string | null;
  duration: number | null; // Days
  daysRemaining: number | null;
  onTrack: boolean;
}

/**
 * Overall analytics across all teams
 */
export interface OverallAnalytics {
  totalTeams: number;
  totalProjects: number;
  totalTasks: number;
  overallCompletionRate: number;
  projectsByStatus: Record<ProjectStatus, number>;
  tasksByPriority: Record<Priority, number>;
  topPerformingTeams: Array<{ teamId: string; teamName: string; completionRate: number }>;
  bottomPerformingTeams: Array<{ teamId: string; teamName: string; completionRate: number }>;
  criticalProjects: ProjectMetrics[]; // Projects with issues
}

/**
 * Analytics Service - Pure Functions for Metric Calculation
 *
 * @deprecated This service contains execution-oriented methods that query data.
 *
 * In a declarative control layer, analytics should be calculated from
 * externally-fetched data, not by executing queries internally.
 *
 * The correct pattern is:
 * 1. Generate query intents using repositories (findMany(), etc.)
 * 2. Execute queries externally (via VS Code MCP host)
 * 3. Pass fetched data to pure calculation functions
 *
 * These interfaces and types are retained for reference.
 * Calculation logic should be extracted to pure functions that accept
 * data as parameters rather than fetching it internally.
 */
export class AnalyticsService {
  constructor(
    private readonly teams: ITeamRepository,
    private readonly projects: IProjectRepository,
    private readonly tasks: ITaskRepository
  ) {}

  /**
   * @deprecated Use pure calculation functions with externally-fetched data
   */
  async getTeamMetrics(_teamId: string): Promise<TeamMetrics> {
    throw new Error(
      'AnalyticsService methods require execution. Use pure calculation functions with fetched data instead.'
    );
  }

  /**
   * @deprecated Use pure calculation functions with externally-fetched data
   */
  async getProjectMetrics(_projectId: string): Promise<ProjectMetrics> {
    throw new Error(
      'AnalyticsService methods require execution. Use pure calculation functions with fetched data instead.'
    );
  }

  /**
   * @deprecated Use pure calculation functions with externally-fetched data
   */
  async getOverallAnalytics(): Promise<OverallAnalytics> {
    throw new Error(
      'AnalyticsService methods require execution. Use pure calculation functions with fetched data instead.'
    );
  }
}

/**
 * Pure calculation functions for analytics
 * These functions accept data as parameters and return calculated metrics
 */

/**
 * Calculate team metrics from fetched data
 */
export function calculateTeamMetrics(
  team: { id: string; name: string },
  projects: Project[],
  tasks: Task[]
): TeamMetrics {
  const teamProjects = projects.filter((p) => p.teamId === team.id);
  const teamTasks = tasks.filter((t) => t.teamId === team.id);

  const completedTasks = teamTasks.filter((t) => t.done).length;
  const activeTasks = teamTasks.filter((t) => !t.done).length;

  return {
    teamId: team.id,
    teamName: team.name,
    totalProjects: teamProjects.length,
    activeProjects: teamProjects.filter((p) => p.status === 'Active').length,
    completedProjects: teamProjects.filter((p) => p.status === 'Completed').length,
    projectsByStatus: groupByStatus(teamProjects),
    totalTasks: teamTasks.length,
    completedTasks,
    activeTasks,
    completionRate: teamTasks.length > 0 ? (completedTasks / teamTasks.length) * 100 : 0,
    overdueTasks: countOverdueTasks(teamTasks),
    tasksByPriority: groupByPriority(teamTasks),
    velocity: 0, // Would require historical data
  };
}

/**
 * Calculate project metrics from fetched data
 */
export function calculateProjectMetrics(project: Project, tasks: Task[]): ProjectMetrics {
  const projectTasks = tasks.filter((t) => t.projectId === project.id);
  const completedTasks = projectTasks.filter((t) => t.done).length;
  const activeTasks = projectTasks.filter((t) => !t.done).length;

  return {
    projectId: project.id,
    projectName: project.name,
    status: project.status,
    teamId: project.teamId,
    teamName: undefined,
    totalTasks: projectTasks.length,
    completedTasks,
    activeTasks,
    completionRate: projectTasks.length > 0 ? (completedTasks / projectTasks.length) * 100 : 0,
    overdueTasks: countOverdueTasks(projectTasks),
    tasksByPriority: groupByPriority(projectTasks),
    startDate: project.startDate,
    endDate: project.endDate,
    duration: null,
    daysRemaining: null,
    onTrack: true,
  };
}

// Helper functions (pure)
function groupByStatus(projects: Project[]): Record<ProjectStatus, number> {
  const groups: Record<ProjectStatus, number> = {
    Active: 0,
    Completed: 0,
    'On Hold': 0,
    Cancelled: 0,
  };
  for (const project of projects) {
    groups[project.status] = (groups[project.status] || 0) + 1;
  }
  return groups;
}

function groupByPriority(tasks: Task[]): Record<Priority, number> {
  const groups: Record<Priority, number> = { High: 0, Medium: 0, Low: 0 };
  for (const task of tasks) {
    if (task.priority) {
      groups[task.priority] = (groups[task.priority] || 0) + 1;
    }
  }
  return groups;
}

function countOverdueTasks(tasks: Task[]): number {
  const now = new Date().toISOString();
  return tasks.filter((t) => !t.done && t.due && t.due < now).length;
}
