import type { ChangeProposal } from '../../safety';
import type { Team, Project, Task, Meeting } from '../../schemas';
import type {
  ProjectStatus,
  Milestone,
  Phase,
  Domain,
  Priority,
  MeetingType,
  Cadence,
} from '../../core/types';

/**
 * Input for creating a new project
 */
export interface ProjectCreateInput {
  name: string;
  status: ProjectStatus;
  milestone: Milestone | null;
  phase: Phase | null;
  domain: Domain | null;
  startDate: string | null;
  endDate: string | null;
  teamId: string;
}

/**
 * Input for creating a new task
 */
export interface TaskCreateInput {
  name: string;
  done?: boolean;
  due: string | null;
  priority: Priority | null;
  projectId?: string;
  teamId: string;
}

/**
 * Input for creating a new meeting
 */
export interface MeetingCreateInput {
  name: string;
  type: MeetingType;
  cadence: Cadence | null;
  date: string | null;
  teamIds: string[];
  projectIds?: string[];
  actionItemTaskIds?: string[];
}

/**
 * Repository interface for Team operations
 */
export interface ITeamRepository {
  findById(id: string): Promise<Team | null>;
  findMany(): Promise<Team[]>;
}

/**
 * Repository interface for Project operations
 */
export interface IProjectRepository {
  findById(id: string): Promise<Project | null>;
  findByTeam(teamId: string): Promise<Project[]>;
  findMany(): Promise<Project[]>;
  create(input: ProjectCreateInput): Promise<ChangeProposal<Project>>;
}

/**
 * Repository interface for Task operations
 */
export interface ITaskRepository {
  findById(id: string): Promise<Task | null>;
  findByTeam(teamId: string): Promise<Task[]>;
  findByProject(projectId: string): Promise<Task[]>;
  findMany(): Promise<Task[]>;
  create(input: TaskCreateInput): Promise<ChangeProposal<Task>>;
}

/**
 * Repository interface for Meeting operations
 */
export interface IMeetingRepository {
  findById(id: string): Promise<Meeting | null>;
  findByTeam(teamId: string): Promise<Meeting[]>;
  findMany(): Promise<Meeting[]>;
  create(input: MeetingCreateInput): Promise<ChangeProposal<Meeting>>;
}
