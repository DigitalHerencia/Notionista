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
   * Note: Query methods like findByName, findWithProjects, findWithTasks,
   * and getMetrics are removed.
   *
   * These methods required executing queries and filtering results,
   * which violates the declarative control layer principle.
   *
   * Use findMany() to generate query intents, then execute and process
   * results externally. Metrics should be calculated from fetched data.
   */
}
