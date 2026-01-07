import { z } from 'zod';

/**
 * Workflow Schema
 *
 * Defines workflow states and transitions for sprint cycles and team workflows
 * Maps to workflow patterns in copilot-instructions.md
 */

/**
 * Workflow types from copilot-instructions.md
 */
export const WorkflowTypeSchema = z.enum([
  'sprint-cycle', // 2-week sprint cycle
  'daily-standup', // Daily standup workflow
  'sprint-planning', // Sprint planning meeting
  'post-mortem', // Sprint post-mortem
  'team-sync', // Team synchronization
  'ad-hoc', // Ad-hoc workflow
]);

export type WorkflowType = z.infer<typeof WorkflowTypeSchema>;

/**
 * Workflow state
 */
export const WorkflowStateSchema = z.enum([
  'not-started',
  'in-progress',
  'blocked',
  'completed',
  'cancelled',
  'deferred',
]);

export type WorkflowState = z.infer<typeof WorkflowStateSchema>;

/**
 * Sprint cycle phases from copilot-instructions.md
 */
export const SprintPhaseSchema = z.enum([
  'P1.1',
  'P1.2',
  'P1.3',
  'P2.1',
  'P2.2',
  'P2.3',
  'P3.1',
  'P3.2',
  'P3.3',
]);

export type SprintPhase = z.infer<typeof SprintPhaseSchema>;

/**
 * Sprint milestone
 */
export const MilestoneSchema = z.enum(['M1', 'M2', 'M3']);

export type Milestone = z.infer<typeof MilestoneSchema>;

/**
 * Project status from database schemas
 */
export const ProjectStatusSchema = z.enum(['Active', 'Completed', 'On Hold', 'Cancelled']);

export type ProjectStatus = z.infer<typeof ProjectStatusSchema>;

/**
 * Task priority from database schemas
 */
export const TaskPrioritySchema = z.enum(['High', 'Medium', 'Low']);

export type TaskPriority = z.infer<typeof TaskPrioritySchema>;

/**
 * Meeting types from copilot-instructions.md
 */
export const MeetingTypeSchema = z.enum([
  'Standup',
  'Sprint Planning',
  'Post-mortem',
  'Team Sync',
  'Ad Hoc',
]);

export type MeetingType = z.infer<typeof MeetingTypeSchema>;

/**
 * Meeting cadence
 */
export const MeetingCadenceSchema = z.enum(['Daily', 'Weekly', 'Biweekly', 'Monthly', 'Ad Hoc']);

export type MeetingCadence = z.infer<typeof MeetingCadenceSchema>;

/**
 * Domain areas from database schemas
 */
export const DomainSchema = z.enum(['OPS', 'PROD', 'DES', 'ENG', 'MKT', 'RES']);

export type Domain = z.infer<typeof DomainSchema>;

/**
 * Workflow step
 * Individual step in a workflow
 */
export const WorkflowStepSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  state: WorkflowStateSchema.default('not-started'),
  order: z.number(),
  dependencies: z.array(z.string()).default([]), // IDs of steps that must complete first
  assignee: z.string().optional(),
  dueDate: z.date().optional(),
  completedAt: z.date().optional(),
});

export type WorkflowStep = z.infer<typeof WorkflowStepSchema>;

/**
 * Workflow definition
 */
export const WorkflowDefinitionSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: WorkflowTypeSchema,
  description: z.string().optional(),
  steps: z.array(WorkflowStepSchema),
  state: WorkflowStateSchema.default('not-started'),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export type WorkflowDefinition = z.infer<typeof WorkflowDefinitionSchema>;

/**
 * Sprint cycle workflow from copilot-instructions.md
 * 2-week sprint with defined meetings and lifecycle
 */
export const SprintCycleWorkflowSchema = z.object({
  id: z.string(),
  name: z.string(),
  startDate: z.date(),
  endDate: z.date(),
  milestone: MilestoneSchema.optional(),
  phase: SprintPhaseSchema.optional(),
  team: z.string(), // Team name or ID
  projects: z.array(z.string()).default([]), // Project IDs
  meetings: z
    .object({
      sprintPlanning: z.string().optional(), // Meeting ID
      dailyStandups: z.array(z.string()).default([]), // Meeting IDs
      postMortem: z.string().optional(), // Meeting ID
      teamSync: z.array(z.string()).default([]), // Meeting IDs
    })
    .optional(),
  state: WorkflowStateSchema.default('not-started'),
  metrics: z
    .object({
      totalTasks: z.number().optional(),
      completedTasks: z.number().optional(),
      totalProjects: z.number().optional(),
      completedProjects: z.number().optional(),
    })
    .optional(),
});

export type SprintCycleWorkflow = z.infer<typeof SprintCycleWorkflowSchema>;

/**
 * Project lifecycle from copilot-instructions.md
 */
export const ProjectLifecycleSchema = z.object({
  projectId: z.string(),
  status: ProjectStatusSchema,
  startDate: z.date(),
  endDate: z.date(),
  team: z.string(),
  tasks: z.array(z.string()).default([]), // Task IDs
  allTasksComplete: z.boolean().default(false),
  completionDate: z.date().optional(),
  domain: DomainSchema.optional(),
  milestone: MilestoneSchema.optional(),
  phase: SprintPhaseSchema.optional(),
});

export type ProjectLifecycle = z.infer<typeof ProjectLifecycleSchema>;

/**
 * Task lifecycle from copilot-instructions.md
 */
export const TaskLifecycleSchema = z.object({
  taskId: z.string(),
  done: z.boolean().default(false),
  project: z.string().optional(), // Project ID
  team: z.string().optional(), // Team ID
  assignedAt: z.date().optional(),
  dueDate: z.date().optional(),
  completedAt: z.date().optional(),
  priority: TaskPrioritySchema.optional(),
});

export type TaskLifecycle = z.infer<typeof TaskLifecycleSchema>;

/**
 * Workflow transition
 * Defines valid state transitions
 */
export const WorkflowTransitionSchema = z.object({
  from: WorkflowStateSchema,
  to: WorkflowStateSchema,
  action: z.string(),
  conditions: z.array(z.string()).default([]), // Conditions that must be met
  automated: z.boolean().default(false), // Can transition automatically
});

export type WorkflowTransition = z.infer<typeof WorkflowTransitionSchema>;

/**
 * Workflow execution
 * Tracks a workflow instance execution
 */
export const WorkflowExecutionSchema = z.object({
  id: z.string(),
  workflowId: z.string(),
  state: WorkflowStateSchema,
  startedAt: z.date(),
  completedAt: z.date().optional(),
  currentStep: z.string().optional(), // Current step ID
  context: z.record(z.string(), z.unknown()).optional(),
  errors: z.array(z.string()).default([]),
});

export type WorkflowExecution = z.infer<typeof WorkflowExecutionSchema>;
