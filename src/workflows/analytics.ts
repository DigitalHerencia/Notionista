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
 * Service for generating analytics and metrics
 * Provides insights into team performance, project progress, and task completion
 */
export class AnalyticsService {
  constructor(
    private readonly teams: ITeamRepository,
    private readonly projects: IProjectRepository,
    private readonly tasks: ITaskRepository
  ) {}

  /**
   * Get comprehensive metrics for a specific team
   *
   * @param teamId Team ID to analyze
   * @returns Team metrics
   */
  async getTeamMetrics(teamId: string): Promise<TeamMetrics> {
    const allTeams = await this.teams.findMany();
    const team = allTeams.find((t) => t.id === teamId);

    if (!team) {
      throw new Error(`Team ${teamId} not found`);
    }

    const projects = await this.projects.findByTeam(teamId);
    const tasks = await this.tasks.findByTeam(teamId);

    const completedTasks = tasks.filter((t) => t.done);
    const activeTasks = tasks.filter((t) => !t.done);
    const overdueTasks = this.countOverdueTasks(activeTasks);

    const completionRate = tasks.length > 0 ? (completedTasks.length / tasks.length) * 100 : 0;

    // Calculate velocity (tasks completed per day)
    const velocity = this.calculateVelocity(completedTasks, projects);

    return {
      teamId: team.id,
      teamName: team.name,
      totalProjects: projects.length,
      activeProjects: projects.filter((p) => p.status === 'Active').length,
      completedProjects: projects.filter((p) => p.status === 'Completed').length,
      projectsByStatus: this.groupByStatus(projects),
      totalTasks: tasks.length,
      completedTasks: completedTasks.length,
      activeTasks: activeTasks.length,
      completionRate: Math.round(completionRate * 10) / 10,
      overdueTasks,
      tasksByPriority: this.groupByPriority(tasks),
      velocity: Math.round(velocity * 10) / 10,
    };
  }

  /**
   * Get comprehensive metrics for a specific project
   *
   * @param projectId Project ID to analyze
   * @returns Project metrics
   */
  async getProjectMetrics(projectId: string): Promise<ProjectMetrics> {
    const allProjects = await this.projects.findMany();
    const project = allProjects.find((p) => p.id === projectId);

    if (!project) {
      throw new Error(`Project ${projectId} not found`);
    }

    // Get team name if available
    let teamName: string | undefined;
    if (project.teamId) {
      const team = await this.teams.findById(project.teamId);
      teamName = team?.name;
    }

    const tasks = await this.tasks.findByProject(projectId);
    const completedTasks = tasks.filter((t) => t.done);
    const activeTasks = tasks.filter((t) => !t.done);
    const overdueTasks = this.countOverdueTasks(activeTasks);

    const completionRate = tasks.length > 0 ? (completedTasks.length / tasks.length) * 100 : 0;

    // Calculate duration and remaining time
    let duration: number | null = null;
    let daysRemaining: number | null = null;
    let onTrack = true;

    if (project.startDate && project.endDate) {
      const start = new Date(project.startDate);
      const end = new Date(project.endDate);
      const now = new Date();

      duration = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      daysRemaining = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      // Project is off-track if completion rate is significantly behind schedule
      const elapsedDays = Math.ceil((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      const expectedCompletionRate = duration > 0 ? (elapsedDays / duration) * 100 : 0;
      onTrack = completionRate >= expectedCompletionRate - 10; // 10% tolerance
    }

    return {
      projectId: project.id,
      projectName: project.name,
      status: project.status,
      teamId: project.teamId,
      teamName,
      totalTasks: tasks.length,
      completedTasks: completedTasks.length,
      activeTasks: activeTasks.length,
      completionRate: Math.round(completionRate * 10) / 10,
      overdueTasks,
      tasksByPriority: this.groupByPriority(tasks),
      startDate: project.startDate,
      endDate: project.endDate,
      duration,
      daysRemaining,
      onTrack,
    };
  }

  /**
   * Get overall analytics across all teams and projects
   *
   * @returns Overall analytics
   */
  async getOverallAnalytics(): Promise<OverallAnalytics> {
    const allTeams = await this.teams.findMany();
    const allProjects = await this.projects.findMany();
    const allTasks = await this.tasks.findMany();

    const completedTasks = allTasks.filter((t) => t.done);
    const overallCompletionRate =
      allTasks.length > 0 ? (completedTasks.length / allTasks.length) * 100 : 0;

    // Calculate team performance
    const teamMetrics = await Promise.all(allTeams.map((team) => this.getTeamMetrics(team.id)));

    const sortedByCompletion = [...teamMetrics].sort((a, b) => b.completionRate - a.completionRate);
    const topPerformingTeams = sortedByCompletion.slice(0, 3).map((m) => ({
      teamId: m.teamId,
      teamName: m.teamName,
      completionRate: m.completionRate,
    }));
    const bottomPerformingTeams = sortedByCompletion
      .slice(-3)
      .reverse()
      .map((m) => ({
        teamId: m.teamId,
        teamName: m.teamName,
        completionRate: m.completionRate,
      }));

    // Identify critical projects (off-track or with many overdue tasks)
    const projectMetrics = await Promise.all(
      allProjects.map((project) => this.getProjectMetrics(project.id))
    );
    const criticalProjects = projectMetrics.filter(
      (p) => !p.onTrack || p.overdueTasks > 3 || (p.status === 'Active' && p.completionRate < 30)
    );

    return {
      totalTeams: allTeams.length,
      totalProjects: allProjects.length,
      totalTasks: allTasks.length,
      overallCompletionRate: Math.round(overallCompletionRate * 10) / 10,
      projectsByStatus: this.groupByStatus(allProjects),
      tasksByPriority: this.groupByPriority(allTasks),
      topPerformingTeams,
      bottomPerformingTeams,
      criticalProjects,
    };
  }

  /**
   * Generate a formatted analytics report
   *
   * @param analytics Overall analytics
   * @returns Markdown-formatted report
   */
  formatOverallReport(analytics: OverallAnalytics): string {
    const lines: string[] = [
      `# Analytics Report`,
      ``,
      `## Overall Summary`,
      ``,
      `- **Teams**: ${analytics.totalTeams}`,
      `- **Projects**: ${analytics.totalProjects}`,
      `- **Tasks**: ${analytics.totalTasks}`,
      `- **Overall Completion Rate**: ${analytics.overallCompletionRate}%`,
      ``,
      `### Projects by Status`,
      ``,
    ];

    for (const [status, count] of Object.entries(analytics.projectsByStatus)) {
      if (count > 0) {
        lines.push(`- ${status}: ${count}`);
      }
    }

    lines.push(``);
    lines.push(`### Tasks by Priority`);
    lines.push(``);

    for (const [priority, count] of Object.entries(analytics.tasksByPriority)) {
      if (count > 0) {
        lines.push(`- ${priority}: ${count}`);
      }
    }

    lines.push(``);
    lines.push(`## Top Performing Teams`);
    lines.push(``);

    for (const team of analytics.topPerformingTeams) {
      lines.push(`- **${team.teamName}**: ${team.completionRate}% completion`);
    }

    if (analytics.bottomPerformingTeams.length > 0) {
      lines.push(``);
      lines.push(`## Teams Needing Support`);
      lines.push(``);

      for (const team of analytics.bottomPerformingTeams) {
        lines.push(`- **${team.teamName}**: ${team.completionRate}% completion`);
      }
    }

    if (analytics.criticalProjects.length > 0) {
      lines.push(``);
      lines.push(`## ⚠️ Critical Projects`);
      lines.push(``);

      for (const project of analytics.criticalProjects) {
        lines.push(`### ${project.projectName}`);
        lines.push(`- Status: ${project.status}`);
        lines.push(`- Completion: ${project.completionRate}%`);
        lines.push(`- Overdue Tasks: ${project.overdueTasks}`);
        if (project.daysRemaining !== null) {
          lines.push(`- Days Remaining: ${project.daysRemaining}`);
        }
        lines.push(`- On Track: ${project.onTrack ? '✅' : '❌'}`);
        lines.push(``);
      }
    }

    return lines.join('\n');
  }

  /**
   * Generate a team performance report
   *
   * @param teamMetrics Team metrics
   * @returns Markdown-formatted report
   */
  formatTeamReport(teamMetrics: TeamMetrics): string {
    const lines: string[] = [
      `# Team Report: ${teamMetrics.teamName}`,
      ``,
      `## Overview`,
      ``,
      `- **Projects**: ${teamMetrics.totalProjects} (${teamMetrics.activeProjects} active, ${teamMetrics.completedProjects} completed)`,
      `- **Tasks**: ${teamMetrics.totalTasks} (${teamMetrics.completedTasks} completed, ${teamMetrics.activeTasks} active)`,
      `- **Completion Rate**: ${teamMetrics.completionRate}%`,
      `- **Overdue Tasks**: ${teamMetrics.overdueTasks}`,
      `- **Velocity**: ${teamMetrics.velocity} tasks/day`,
      ``,
      `### Projects by Status`,
      ``,
    ];

    for (const [status, count] of Object.entries(teamMetrics.projectsByStatus)) {
      if (count > 0) {
        lines.push(`- ${status}: ${count}`);
      }
    }

    lines.push(``);
    lines.push(`### Tasks by Priority`);
    lines.push(``);

    for (const [priority, count] of Object.entries(teamMetrics.tasksByPriority)) {
      if (count > 0) {
        lines.push(`- ${priority}: ${count}`);
      }
    }

    return lines.join('\n');
  }

  /**
   * Count overdue tasks
   */
  private countOverdueTasks(tasks: Task[]): number {
    const now = new Date();
    return tasks.filter((task) => {
      if (task.done || !task.due) return false;
      return new Date(task.due) < now;
    }).length;
  }

  /**
   * Group projects by status
   */
  private groupByStatus(projects: Project[]): Record<ProjectStatus, number> {
    const result: Record<ProjectStatus, number> = {
      Active: 0,
      Completed: 0,
      'On Hold': 0,
      Cancelled: 0,
    };

    for (const project of projects) {
      result[project.status]++;
    }

    return result;
  }

  /**
   * Group tasks by priority
   */
  private groupByPriority(tasks: Task[]): Record<Priority, number> {
    const result: Record<Priority, number> = {
      High: 0,
      Medium: 0,
      Low: 0,
    };

    for (const task of tasks) {
      if (task.priority) {
        result[task.priority]++;
      }
    }

    return result;
  }

  /**
   * Calculate velocity (tasks completed per day)
   * Based on completed tasks and project duration
   */
  private calculateVelocity(completedTasks: Task[], projects: Project[]): number {
    if (completedTasks.length === 0 || projects.length === 0) return 0;

    // Find earliest start date and latest end date
    const dates = projects.filter((p) => p.startDate).map((p) => new Date(p.startDate!).getTime());

    if (dates.length === 0) return 0;

    const earliestStart = Math.min(...dates);
    const now = Date.now();
    const daysPassed = Math.ceil((now - earliestStart) / (1000 * 60 * 60 * 24));

    return daysPassed > 0 ? completedTasks.length / daysPassed : 0;
  }
}
