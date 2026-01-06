import type { Project } from '../../core/types/schemas';
import type { NotionPage, PageProperties } from '../../core/types/notion';
import type { ProjectStatus, Milestone, Phase, Domain } from '../../core/constants/databases';
import { BaseRepository } from './base.repository';
import { DATABASE_IDS } from '../../core/constants/databases';

/**
 * Input for creating a new project
 */
export interface CreateProjectInput {
  name: string;
  status: ProjectStatus;
  milestone?: Milestone | null;
  phase?: Phase | null;
  domain?: Domain | null;
  startDate?: string | null;
  endDate?: string | null;
  teamId?: string;
}

/**
 * Input for updating a project
 */
export interface UpdateProjectInput {
  name?: string;
  status?: ProjectStatus;
  milestone?: Milestone | null;
  phase?: Phase | null;
  domain?: Domain | null;
  startDate?: string | null;
  endDate?: string | null;
  teamId?: string;
}

/**
 * Repository for Project entities
 */
export class ProjectRepository extends BaseRepository<
  Project,
  CreateProjectInput,
  UpdateProjectInput
> {
  constructor(mcp: any) {
    super(mcp, DATABASE_IDS.PROJECTS);
  }

  protected getEntityName(): string {
    return 'Project';
  }

  protected toDomainEntity(page: NotionPage): Project {
    const props = page.properties;

    return {
      id: page.id,
      name: this.extractTitle(props, 'Name'),
      status: (this.extractSelect(props, 'Status') as ProjectStatus) || 'Active',
      milestone: this.extractSelect(props, 'Milestone') as Milestone | null,
      phase: this.extractSelect(props, 'Phase') as Phase | null,
      domain: this.extractSelect(props, 'Domain') as Domain | null,
      startDate: this.extractDate(props, 'Start Date'),
      endDate: this.extractDate(props, 'End Date'),
      teamId: this.extractRelation(props, 'Team')[0],
      taskIds: this.extractRelation(props, 'Tasks'),
    };
  }

  protected toNotionProperties(
    input: CreateProjectInput | UpdateProjectInput | Project
  ): PageProperties {
    const properties: PageProperties = {};

    if ('name' in input && input.name !== undefined) {
      properties['Name'] = {
        title: [{ text: { content: input.name } }],
      };
    }

    if ('status' in input && input.status !== undefined) {
      properties['Status'] = {
        select: { name: input.status },
      };
    }

    if ('milestone' in input) {
      properties['Milestone'] = input.milestone
        ? { select: { name: input.milestone } }
        : { select: null };
    }

    if ('phase' in input) {
      properties['Phase'] = input.phase ? { select: { name: input.phase } } : { select: null };
    }

    if ('domain' in input) {
      properties['Domain'] = input.domain ? { select: { name: input.domain } } : { select: null };
    }

    if ('startDate' in input) {
      properties['Start Date'] = input.startDate
        ? { date: { start: input.startDate } }
        : { date: null };
    }

    if ('endDate' in input) {
      properties['End Date'] = input.endDate ? { date: { start: input.endDate } } : { date: null };
    }

    if ('teamId' in input && input.teamId) {
      properties['Team'] = {
        relation: [{ id: input.teamId }],
      };
    }

    return properties;
  }

  /**
   * Find projects by status
   */
  async findByStatus(status: ProjectStatus): Promise<Project[]> {
    const allProjects = await this.findMany();
    return allProjects.filter((project) => project.status === status);
  }

  /**
   * Find projects by team
   */
  async findByTeam(teamId: string): Promise<Project[]> {
    const allProjects = await this.findMany();
    return allProjects.filter((project) => project.teamId === teamId);
  }

  /**
   * Find projects by milestone
   */
  async findByMilestone(milestone: Milestone): Promise<Project[]> {
    const allProjects = await this.findMany();
    return allProjects.filter((project) => project.milestone === milestone);
  }

  /**
   * Find projects by domain
   */
  async findByDomain(domain: Domain): Promise<Project[]> {
    const allProjects = await this.findMany();
    return allProjects.filter((project) => project.domain === domain);
  }

  /**
   * Find active projects (status = Active)
   */
  async findActive(): Promise<Project[]> {
    return this.findByStatus('Active');
  }

  /**
   * Find completed projects
   */
  async findCompleted(): Promise<Project[]> {
    return this.findByStatus('Completed');
  }

  /**
   * Get project with all related tasks
   */
  async findWithTasks(projectId: string): Promise<{ project: Project; taskIds: string[] }> {
    const project = await this.findByIdOrThrow(projectId);
    return {
      project,
      taskIds: project.taskIds,
    };
  }

  /**
   * Find projects within a date range
   */
  async findByDateRange(startDate: string, endDate: string): Promise<Project[]> {
    const allProjects = await this.findMany();
    return allProjects.filter((project) => {
      if (!project.startDate) return false;
      return project.startDate >= startDate && project.startDate <= endDate;
    });
  }
}
