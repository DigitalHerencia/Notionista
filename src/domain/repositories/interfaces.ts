import type { ChangeProposal } from '../../safety';
import type { McpOperationIntent } from '../../mcp/client';
import type { Project, Task, Meeting } from '../../schemas';
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
 *
 * Note: All methods return declarative intents, not execution results.
 */
export interface ITeamRepository {
  findById(id: string): McpOperationIntent;
  findMany(): McpOperationIntent;
}

/**
 * Repository interface for Project operations
 *
 * Note: All methods return declarative intents/proposals, not execution results.
 */
export interface IProjectRepository {
  findById(id: string): McpOperationIntent;
  findMany(): McpOperationIntent;
  create(input: ProjectCreateInput): ChangeProposal<Project>;
}

/**
 * Repository interface for Task operations
 *
 * Note: All methods return declarative intents/proposals, not execution results.
 */
export interface ITaskRepository {
  findById(id: string): McpOperationIntent;
  findMany(): McpOperationIntent;
  create(input: TaskCreateInput): ChangeProposal<Task>;
}

/**
 * Repository interface for Meeting operations
 *
 * Note: All methods return declarative intents/proposals, not execution results.
 */
export interface IMeetingRepository {
  findById(id: string): McpOperationIntent;
  findMany(): McpOperationIntent;
  create(input: MeetingCreateInput): ChangeProposal<Meeting>;
}
