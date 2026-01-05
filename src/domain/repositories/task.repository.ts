import type { Task } from '../../core/types/schemas';
import type { NotionPage, PageProperties } from '../../core/types/notion';
import type { Priority } from '../../core/constants/databases';
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
      properties['Due'] = input.due
        ? { date: { start: input.due } }
        : { date: null };
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
   * Find tasks by completion status
   */
  async findByDone(done: boolean): Promise<Task[]> {
    const allTasks = await this.findMany();
    return allTasks.filter(task => task.done === done);
  }

  /**
   * Find incomplete tasks
   */
  async findIncomplete(): Promise<Task[]> {
    return this.findByDone(false);
  }

  /**
   * Find completed tasks
   */
  async findCompleted(): Promise<Task[]> {
    return this.findByDone(true);
  }

  /**
   * Find tasks by project
   */
  async findByProject(projectId: string): Promise<Task[]> {
    const allTasks = await this.findMany();
    return allTasks.filter(task => task.projectId === projectId);
  }

  /**
   * Find tasks by team
   */
  async findByTeam(teamId: string): Promise<Task[]> {
    const allTasks = await this.findMany();
    return allTasks.filter(task => task.teamId === teamId);
  }

  /**
   * Find tasks by priority
   */
  async findByPriority(priority: Priority): Promise<Task[]> {
    const allTasks = await this.findMany();
    return allTasks.filter(task => task.priority === priority);
  }

  /**
   * Find high priority tasks
   */
  async findHighPriority(): Promise<Task[]> {
    return this.findByPriority('High');
  }

  /**
   * Find overdue tasks (incomplete with due date in the past)
   */
  async findOverdue(): Promise<Task[]> {
    const allTasks = await this.findMany();
    const now = new Date().toISOString();
    
    return allTasks.filter(task => 
      !task.done && task.due && task.due < now
    );
  }

  /**
   * Find tasks due today
   */
  async findDueToday(): Promise<Task[]> {
    const allTasks = await this.findMany();
    const today = new Date().toISOString().split('T')[0];
    
    return allTasks.filter(task => 
      task.due && task.due.startsWith(today as string)
    );
  }

  /**
   * Find tasks due within the next N days
   */
  async findDueSoon(days: number = 7): Promise<Task[]> {
    const allTasks = await this.findMany();
    const now = new Date();
    const futureDate = new Date(now);
    futureDate.setDate(futureDate.getDate() + days);
    
    const nowStr = now.toISOString();
    const futureStr = futureDate.toISOString();
    
    return allTasks.filter(task => 
      !task.done && task.due && task.due >= nowStr && task.due <= futureStr
    );
  }

  /**
   * Get task completion rate for a project
   */
  async getProjectCompletionRate(projectId: string): Promise<number> {
    const tasks = await this.findByProject(projectId);
    if (tasks.length === 0) return 0;
    
    const completed = tasks.filter(t => t.done).length;
    return (completed / tasks.length) * 100;
  }

  /**
   * Get task completion rate for a team
   */
  async getTeamCompletionRate(teamId: string): Promise<number> {
    const tasks = await this.findByTeam(teamId);
    if (tasks.length === 0) return 0;
    
    const completed = tasks.filter(t => t.done).length;
    return (completed / tasks.length) * 100;
  }
}
