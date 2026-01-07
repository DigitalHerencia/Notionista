import { z } from 'zod';

/**
 * Database Target Schemas
 *
 * Defines schemas for all core databases from copilot-instructions.md
 * Maps to Digital Herencia workspace structure
 */

/**
 * Team schema from copilot-instructions.md
 */
export const TeamTargetSchema = z.object({
  id: z.string(),
  name: z.string(), // title property
  tasksCompleted: z.number().optional(), // formula rollup
  projectsComplete: z.number().optional(), // formula rollup
  projects: z.array(z.string()).default([]), // relation to Projects
  tasks: z.array(z.string()).default([]), // relation to Tasks
  meetings: z.array(z.string()).default([]), // relation to Meetings
});

export type TeamTarget = z.infer<typeof TeamTargetSchema>;

/**
 * Project schema from copilot-instructions.md
 */
export const ProjectTargetSchema = z.object({
  id: z.string(),
  name: z.string(), // title property
  status: z.enum(['Active', 'Completed', 'On Hold', 'Cancelled']),
  milestone: z.enum(['M1', 'M2', 'M3']).optional(),
  phase: z
    .enum(['P1.1', 'P1.2', 'P1.3', 'P2.1', 'P2.2', 'P2.3', 'P3.1', 'P3.2', 'P3.3'])
    .optional(),
  domain: z.enum(['OPS', 'PROD', 'DES', 'ENG', 'MKT', 'RES']).optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  team: z.string().optional(), // relation to Team
  tasks: z.array(z.string()).default([]), // relation to Tasks
});

export type ProjectTarget = z.infer<typeof ProjectTargetSchema>;

/**
 * Task schema from copilot-instructions.md
 */
export const TaskTargetSchema = z.object({
  id: z.string(),
  name: z.string(), // title property (verb-object format)
  done: z.boolean().default(false), // checkbox
  taskCode: z.string().optional(), // formula
  due: z.date().optional(), // date
  priority: z.enum(['High', 'Medium', 'Low']).optional(),
  project: z.string().optional(), // relation to Project
  team: z.string().optional(), // relation to Team
});

export type TaskTarget = z.infer<typeof TaskTargetSchema>;

/**
 * Meeting schema from copilot-instructions.md
 */
export const MeetingTargetSchema = z.object({
  id: z.string(),
  name: z.string(), // title property (format: "<Type> <YYYY-MM-DD>")
  type: z.enum(['Standup', 'Sprint Planning', 'Post-mortem', 'Team Sync', 'Ad Hoc']),
  cadence: z.enum(['Daily', 'Weekly', 'Biweekly', 'Monthly', 'Ad Hoc']).optional(),
  date: z.date(),
  attendees: z.array(z.string()).default([]), // relation to Teams
  actionItems: z.array(z.string()).default([]), // relation to Tasks
  projects: z.array(z.string()).default([]), // relation to Projects
});

export type MeetingTarget = z.infer<typeof MeetingTargetSchema>;

/**
 * Prompt schema from copilot-instructions.md
 */
export const PromptTargetSchema = z.object({
  id: z.string(),
  name: z.string(), // title property
  controlLayer: z.enum(['System', 'User', 'Assistant']).optional(),
  useCase: z.array(z.string()).default([]), // multi-select
  team: z.string().optional(), // relation to Team
});

export type PromptTarget = z.infer<typeof PromptTargetSchema>;

/**
 * Tech Stack schema from copilot-instructions.md
 */
export const TechStackTargetSchema = z.object({
  id: z.string(),
  name: z.string(), // title property
  category: z.enum(['Language', 'Framework', 'Tool', 'Platform']).optional(),
  programmingLanguages: z.array(z.string()).default([]), // multi-select
  tags: z.array(z.string()).default([]), // multi-select
});

export type TechStackTarget = z.infer<typeof TechStackTargetSchema>;

/**
 * Template schema from copilot-instructions.md
 */
export const TemplateTargetSchema = z.object({
  id: z.string(),
  name: z.string(), // title property
  type: z.string().optional(),
  content: z.unknown().optional(), // Page content
});

export type TemplateTarget = z.infer<typeof TemplateTargetSchema>;

/**
 * SOP schema from copilot-instructions.md
 * Note: Marked as deprecated in copilot-instructions.md
 */
export const SOPTargetSchema = z.object({
  id: z.string(),
  name: z.string(), // title property
  content: z.unknown().optional(), // Page content
  deprecated: z.boolean().default(true),
});

export type SOPTarget = z.infer<typeof SOPTargetSchema>;

/**
 * Calendar schema from copilot-instructions.md
 */
export const CalendarTargetSchema = z.object({
  id: z.string(),
  name: z.string(), // title property
  date: z.date(),
  type: z.string().optional(),
  attendees: z.array(z.string()).default([]),
});

export type CalendarTarget = z.infer<typeof CalendarTargetSchema>;

/**
 * Database target union
 * All possible database targets in the workspace
 */
export const DatabaseTargetUnionSchema = z.discriminatedUnion('database', [
  z.object({ database: z.literal('teams'), data: TeamTargetSchema }),
  z.object({ database: z.literal('projects'), data: ProjectTargetSchema }),
  z.object({ database: z.literal('tasks'), data: TaskTargetSchema }),
  z.object({ database: z.literal('meetings'), data: MeetingTargetSchema }),
  z.object({ database: z.literal('prompts'), data: PromptTargetSchema }),
  z.object({ database: z.literal('tech-stack'), data: TechStackTargetSchema }),
  z.object({ database: z.literal('templates'), data: TemplateTargetSchema }),
  z.object({ database: z.literal('sops'), data: SOPTargetSchema }),
  z.object({ database: z.literal('calendar'), data: CalendarTargetSchema }),
]);

export type DatabaseTargetUnion = z.infer<typeof DatabaseTargetUnionSchema>;

/**
 * Target identifier
 * Identifies a specific target for operations
 */
export const TargetIdentifierSchema = z.object({
  database: z.string(),
  pageId: z.string().optional(),
  pageIds: z.array(z.string()).optional(),
});

export type TargetIdentifier = z.infer<typeof TargetIdentifierSchema>;

/**
 * Naming conventions from copilot-instructions.md
 */
export const NamingConventionsSchema = z.object({
  projects: z.string().regex(/^[A-Z].*$/, 'Must be descriptive, no prefix required'),
  tasks: z
    .string()
    .regex(/^[A-Z][a-z]+ .*$/, 'Must be verb-object format (e.g., "Update documentation")'),
  meetings: z
    .string()
    .regex(
      /^(Standup|Sprint Planning|Post-mortem|Team Sync|Ad Hoc) \d{4}-\d{2}-\d{2}$/,
      'Must be "<Type> <YYYY-MM-DD>"'
    ),
  teams: z.string().regex(/^.+ Team$/, 'Must be "<Domain> Team"'),
});

export type NamingConventions = z.infer<typeof NamingConventionsSchema>;
