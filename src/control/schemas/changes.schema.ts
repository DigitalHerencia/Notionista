import { z } from 'zod';

/**
 * Change Request Schemas
 *
 * Defines change request types and templates from copilot-instructions.md
 * Maps to common change patterns in the workspace
 */

/**
 * Change request types
 */
export const ChangeRequestTypeSchema = z.enum([
  'create-project',
  'create-task',
  'mark-task-done',
  'schedule-meeting',
  'query-tasks',
  'update-project-status',
  'assign-task',
  'update-team-metrics',
  'add-relation',
  'remove-relation',
  'bulk-create',
  'bulk-update',
]);

export type ChangeRequestType = z.infer<typeof ChangeRequestTypeSchema>;

/**
 * Create project request
 * Template: "Create a project titled `<X>`, domain `<Y>`, milestone `<Z>`, linked to `<Team>`."
 */
export const CreateProjectRequestSchema = z.object({
  type: z.literal('create-project'),
  title: z.string(),
  domain: z.enum(['OPS', 'PROD', 'DES', 'ENG', 'MKT', 'RES']),
  milestone: z.enum(['M1', 'M2', 'M3']).optional(),
  phase: z
    .enum(['P1.1', 'P1.2', 'P1.3', 'P2.1', 'P2.2', 'P2.3', 'P3.1', 'P3.2', 'P3.3'])
    .optional(),
  team: z.string(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  status: z.enum(['Active', 'Completed', 'On Hold', 'Cancelled']).default('Active'),
});

export type CreateProjectRequest = z.infer<typeof CreateProjectRequestSchema>;

/**
 * Create task request
 * Template: "Create a task `<T>` for project `<P>`, due `<Date>`."
 */
export const CreateTaskRequestSchema = z.object({
  type: z.literal('create-task'),
  name: z
    .string()
    .regex(/^[A-Z][\w-]+ .+$/, 'Must start with a capitalized verb and include an object'),
  project: z.string().optional(),
  team: z.string().optional(),
  due: z.date().optional(),
  priority: z.enum(['High', 'Medium', 'Low']).default('Medium'),
});

export type CreateTaskRequest = z.infer<typeof CreateTaskRequestSchema>;

/**
 * Mark task as done request
 * Template: "Mark task `<T>` as done."
 */
export const MarkTaskDoneRequestSchema = z.object({
  type: z.literal('mark-task-done'),
  taskId: z.string(),
});

export type MarkTaskDoneRequest = z.infer<typeof MarkTaskDoneRequestSchema>;

/**
 * Schedule meeting request
 * Template: "Schedule a `<Type>` meeting for `<Date>` with `<Team>` attendees."
 */
export const ScheduleMeetingRequestSchema = z.object({
  type: z.literal('schedule-meeting'),
  meetingType: z.enum(['Standup', 'Sprint Planning', 'Post-mortem', 'Team Sync', 'Ad Hoc']),
  date: z.date(),
  teams: z.array(z.string()),
  cadence: z.enum(['Daily', 'Weekly', 'Biweekly', 'Monthly', 'Ad Hoc']).optional(),
  projects: z.array(z.string()).default([]),
});

export type ScheduleMeetingRequest = z.infer<typeof ScheduleMeetingRequestSchema>;

/**
 * Query tasks request
 * Template: "Query all incomplete tasks for `<Team>`."
 */
export const QueryTasksRequestSchema = z.object({
  type: z.literal('query-tasks'),
  team: z.string().optional(),
  done: z.boolean().optional(),
  priority: z.enum(['High', 'Medium', 'Low']).optional(),
  project: z.string().optional(),
  dueBefore: z.date().optional(),
  dueAfter: z.date().optional(),
});

export type QueryTasksRequest = z.infer<typeof QueryTasksRequestSchema>;

/**
 * Update project status request
 */
export const UpdateProjectStatusRequestSchema = z.object({
  type: z.literal('update-project-status'),
  projectId: z.string(),
  status: z.enum(['Active', 'Completed', 'On Hold', 'Cancelled']),
  reason: z.string().optional(),
});

export type UpdateProjectStatusRequest = z.infer<typeof UpdateProjectStatusRequestSchema>;

/**
 * Assign task request
 */
export const AssignTaskRequestSchema = z.object({
  type: z.literal('assign-task'),
  taskId: z.string(),
  assignee: z.string(),
  team: z.string().optional(),
  project: z.string().optional(),
});

export type AssignTaskRequest = z.infer<typeof AssignTaskRequestSchema>;

/**
 * Add relation request
 */
export const AddRelationRequestSchema = z.object({
  type: z.literal('add-relation'),
  sourceDatabase: z.string(),
  sourceId: z.string(),
  relationField: z.string(),
  targetDatabase: z.string(),
  targetIds: z.array(z.string()),
});

export type AddRelationRequest = z.infer<typeof AddRelationRequestSchema>;

/**
 * Remove relation request
 */
export const RemoveRelationRequestSchema = z.object({
  type: z.literal('remove-relation'),
  sourceDatabase: z.string(),
  sourceId: z.string(),
  relationField: z.string(),
  targetIds: z.array(z.string()),
});

export type RemoveRelationRequest = z.infer<typeof RemoveRelationRequestSchema>;

/**
 * Bulk create request
 */
export const BulkCreateRequestSchema = z.object({
  type: z.literal('bulk-create'),
  database: z.string(),
  items: z.array(z.record(z.string(), z.unknown())),
  maxItems: z.number().max(50, 'Bulk operations limited to 50 items'),
});

export type BulkCreateRequest = z.infer<typeof BulkCreateRequestSchema>;

/**
 * Bulk update request
 */
export const BulkUpdateRequestSchema = z.object({
  type: z.literal('bulk-update'),
  database: z.string(),
  updates: z.array(
    z.object({
      id: z.string(),
      changes: z.record(z.string(), z.unknown()),
    })
  ),
  maxItems: z.number().max(50, 'Bulk operations limited to 50 items'),
});

export type BulkUpdateRequest = z.infer<typeof BulkUpdateRequestSchema>;

/**
 * Union of all change request types
 */
export const ChangeRequestSchema = z.discriminatedUnion('type', [
  CreateProjectRequestSchema,
  CreateTaskRequestSchema,
  MarkTaskDoneRequestSchema,
  ScheduleMeetingRequestSchema,
  QueryTasksRequestSchema,
  UpdateProjectStatusRequestSchema,
  AssignTaskRequestSchema,
  AddRelationRequestSchema,
  RemoveRelationRequestSchema,
  BulkCreateRequestSchema,
  BulkUpdateRequestSchema,
]);

export type ChangeRequest = z.infer<typeof ChangeRequestSchema>;

/**
 * Change request template
 * Provides template strings for common change patterns
 */
export const ChangeRequestTemplateSchema = z.object({
  type: ChangeRequestTypeSchema,
  template: z.string(),
  parameters: z.array(
    z.object({
      name: z.string(),
      type: z.string(),
      required: z.boolean(),
      description: z.string().optional(),
    })
  ),
  example: z.string(),
});

export type ChangeRequestTemplate = z.infer<typeof ChangeRequestTemplateSchema>;

/**
 * Default change request templates from copilot-instructions.md
 */
export const DEFAULT_TEMPLATES: ChangeRequestTemplate[] = [
  {
    type: 'create-project',
    template: 'Create a project titled `<X>`, domain `<Y>`, milestone `<Z>`, linked to `<Team>`.',
    parameters: [
      { name: 'title', type: 'string', required: true, description: 'Project title' },
      {
        name: 'domain',
        type: 'select',
        required: true,
        description: 'OPS, PROD, DES, ENG, MKT, RES',
      },
      { name: 'milestone', type: 'select', required: false, description: 'M1, M2, M3' },
      { name: 'team', type: 'relation', required: true, description: 'Team name or ID' },
    ],
    example:
      'Create a project titled `API Integration`, domain `ENG`, milestone `M2`, linked to `Engineering Team`.',
  },
  {
    type: 'create-task',
    template: 'Create a task `<T>` for project `<P>`, due `<Date>`.',
    parameters: [
      {
        name: 'task',
        type: 'string',
        required: true,
        description: 'Task name (verb-object format)',
      },
      { name: 'project', type: 'relation', required: false, description: 'Project name or ID' },
      { name: 'due', type: 'date', required: false, description: 'Due date' },
    ],
    example:
      'Create a task `Update documentation` for project `API Integration`, due `2026-01-15`.',
  },
  {
    type: 'mark-task-done',
    template: 'Mark task `<T>` as done.',
    parameters: [{ name: 'task', type: 'string', required: true, description: 'Task name or ID' }],
    example: 'Mark task `Update documentation` as done.',
  },
  {
    type: 'schedule-meeting',
    template: 'Schedule a `<Type>` meeting for `<Date>` with `<Team>` attendees.',
    parameters: [
      {
        name: 'type',
        type: 'select',
        required: true,
        description: 'Standup, Sprint Planning, Post-mortem, Team Sync, Ad Hoc',
      },
      { name: 'date', type: 'date', required: true, description: 'Meeting date' },
      {
        name: 'team',
        type: 'relation',
        required: true,
        description: 'Team name(s) or ID(s) (can be multiple)',
      },
    ],
    example:
      'Schedule a `Sprint Planning` meeting for `2026-01-15` with `Engineering Team` attendees.',
  },
  {
    type: 'query-tasks',
    template: 'Query all incomplete tasks for `<Team>`.',
    parameters: [
      { name: 'team', type: 'relation', required: false, description: 'Team name or ID' },
    ],
    example: 'Query all incomplete tasks for `Engineering Team`.',
  },
];
