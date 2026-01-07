import type { Task } from '../../core/types/schemas';
import type { NotionPage, PageProperties } from '../../core/types/notion';
import type { Priority } from '../../core/constants/databases';
import type { McpOperationIntent } from '../../mcp/client';
import { BaseRepository } from './base.repository';
import { DATABASE_IDS } from '../../core/constants/databases';

/**
 * Input for creating a new task
 */
export interface CreateTaskInput {
  name: string;
  done?: boolean;
  due?: string | null;
  priority?: Priority | null;
  projectId?: string;
  teamId?: string;
}

/**
 * Input for updating a task
 */
export interface UpdateTaskInput {
  name?: string;
  done?: boolean;
  due?: string | null;
  priority?: Priority | null;
  projectId?: string;
  teamId?: string;
}

/**
 * Repository for Task entities
 */
export class TaskRepository extends BaseRepository<Task, CreateTaskInput, UpdateTaskInput> {
  constructor(mcp: any) {
    super(mcp, DATABASE_IDS.TASKS);
  }

  protected getEntityName(): string {
    return 'Task';
  }

  protected toDomainEntity(page: NotionPage): Task {
    const props = page.properties;

    return {
      id: page.id,
      name: this.extractTitle(props, 'Name'),
      done: this.extractCheckbox(props, 'Done'),
      taskCode: this.extractRichText(props, 'Task Code') || undefined,
      due: this.extractDate(props, 'Due'),
      priority: this.extractSelect(props, 'Priority') as Priority | null,
      projectId: this.extractRelation(props, 'Project')[0],
      teamId: this.extractRelation(props, 'Team')[0],
    };
  }

  protected toNotionProperties(input: CreateTaskInput | UpdateTaskInput | Task): PageProperties {
    const properties: PageProperties = {};

    if ('name' in input && input.name !== undefined) {
      properties['Name'] = {
        title: [{ text: { content: input.name } }],
      };
    }

    if ('done' in input && input.done !== undefined) {
      properties['Done'] = {
        checkbox: input.done,
      };
    }

    if ('due' in input) {
      properties['Due'] = input.due ? { date: { start: input.due } } : { date: null };
    }

    if ('priority' in input) {
      properties['Priority'] = input.priority
        ? { select: { name: input.priority } }
        : { select: null };
    }

    if ('projectId' in input && input.projectId) {
      properties['Project'] = {
        relation: [{ id: input.projectId }],
      };
    }

    if ('teamId' in input && input.teamId) {
      properties['Team'] = {
        relation: [{ id: input.teamId }],
      };
    }

    return properties;
  }

  /**
   * Generate intent to find tasks by completion status
   *
   * @deprecated This method generates a query intent but doesn't execute it.
   * The query would need to be executed externally and results filtered.
   */
  findByDone(done: boolean): McpOperationIntent {
    return this.findMany({
      property: 'Done',
      checkbox: { equals: done },
    });
  }

  /**
   * Generate intent to find incomplete tasks
   *
   * @deprecated This method generates a query intent but doesn't execute it.
   */
  findIncomplete(): McpOperationIntent {
    return this.findByDone(false);
  }

  /**
   * Generate intent to find completed tasks
   *
   * @deprecated This method generates a query intent but doesn't execute it.
   */
  findCompleted(): McpOperationIntent {
    return this.findByDone(true);
  }

  /**
   * Generate intent to find tasks by project
   *
   * @deprecated This method generates a query intent but doesn't execute it.
   */
  findByProject(projectId: string): McpOperationIntent {
    return this.findMany({
      property: 'Project',
      relation: { contains: projectId },
    });
  }

  /**
   * Generate intent to find tasks by team
   *
   * @deprecated This method generates a query intent but doesn't execute it.
   */
  findByTeam(teamId: string): McpOperationIntent {
    return this.findMany({
      property: 'Team',
      relation: { contains: teamId },
    });
  }

  /**
   * Generate intent to find tasks by priority
   *
   * @deprecated This method generates a query intent but doesn't execute it.
   */
  findByPriority(priority: Priority): McpOperationIntent {
    return this.findMany({
      property: 'Priority',
      select: { equals: priority },
    });
  }

  /**
   * Generate intent to find high priority tasks
   *
   * @deprecated This method generates a query intent but doesn't execute it.
   */
  findHighPriority(): McpOperationIntent {
    return this.findByPriority('High');
  }

  /**
   * Note: Complex query methods like findOverdue, findDueToday, findDueSoon
   * are removed as they require post-query filtering that should be done
   * externally after query execution.
   *
   * Use findMany() with appropriate filters and process results externally.
   */
}
