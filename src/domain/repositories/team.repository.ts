import type { Team } from '../../core/types/schemas';
import type { NotionPage, PageProperties } from '../../core/types/notion';
import { BaseRepository } from './base.repository';
import { DATABASE_IDS } from '../../core/constants/databases';

/**
 * Input for creating a new team
 */
export interface CreateTeamInput {
  name: string;
}

/**
 * Input for updating a team
 */
export interface UpdateTeamInput {
  name?: string;
}

/**
 * Repository for Team entities
 */
export class TeamRepository extends BaseRepository<Team, CreateTeamInput, UpdateTeamInput> {
  constructor(mcp: any) {
    super(mcp, DATABASE_IDS.TEAMS);
  }

  protected getEntityName(): string {
    return 'Team';
  }

  protected toDomainEntity(page: NotionPage): Team {
    const props = page.properties;

    return {
      id: page.id,
      name: this.extractTitle(props, 'Name'),
      meetings: this.extractRelation(props, 'Meetings'),
      projects: this.extractRelation(props, 'Projects'),
      projectsComplete: this.extractNumber(props, 'Projects Complete'),
      tasks: this.extractRelation(props, 'Tasks'),
      tasksCompleted: this.extractNumber(props, 'Tasks Completed'),
    };
  }

  protected toNotionProperties(input: CreateTeamInput | UpdateTeamInput | Team): PageProperties {
    const properties: PageProperties = {};

    if ('name' in input && input.name !== undefined) {
      properties['Name'] = {
        title: [{ text: { content: input.name } }],
      };
    }

    return properties;
  }

  /**
   * Find teams by name (partial match)
   */
  async findByName(name: string): Promise<Team[]> {
    const allTeams = await this.findMany();
    return allTeams.filter(team => 
      team.name.toLowerCase().includes(name.toLowerCase())
    );
  }

  /**
   * Get team with all related projects
   */
  async findWithProjects(teamId: string): Promise<{ team: Team; projectIds: string[] }> {
    const team = await this.findByIdOrThrow(teamId);
    return {
      team,
      projectIds: team.projects,
    };
  }

  /**
   * Get team with all related tasks
   */
  async findWithTasks(teamId: string): Promise<{ team: Team; taskIds: string[] }> {
    const team = await this.findByIdOrThrow(teamId);
    return {
      team,
      taskIds: team.tasks,
    };
  }

  /**
   * Get team completion metrics
   */
  async getMetrics(teamId: string): Promise<{
    team: Team;
    projectsComplete: number;
    tasksCompleted: number;
    totalProjects: number;
    totalTasks: number;
  }> {
    const team = await this.findByIdOrThrow(teamId);
    return {
      team,
      projectsComplete: team.projectsComplete ?? 0,
      tasksCompleted: team.tasksCompleted ?? 0,
      totalProjects: team.projects.length,
      totalTasks: team.tasks.length,
    };
  }
}
