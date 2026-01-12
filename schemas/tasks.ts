/**
 * Task Database Schemas for Digital Herencia Notion Workspace
 *
 * These Zod schemas model the Tasks database structure, completion workflow,
 * and relation patterns for type-safe MCP operations.
 */

import { z } from 'zod';
import fs from 'fs';
import path from 'path';

function loadRegistrySync() {
  try {
    const p = path.resolve(__dirname, '..', 'config', 'databases.json');
    const raw = fs.readFileSync(p, 'utf8');
    const parsed = JSON.parse(raw);
    return parsed ?? {};
  } catch {
    return {};
  }
}

const _REG = loadRegistrySync();

// =============================================================================
// ENUMS & LITERALS
// =============================================================================

/**
 * Task code options (sequence identifiers)
 */
export const TaskCode = z.enum(['T01', 'T02', 'T03', 'T04', 'T05']);
export type TaskCode = z.infer<typeof TaskCode>;

// =============================================================================
// OPTION ID MAPPINGS
// =============================================================================

/**
 * Task code to option ID mapping (for MCP operations)
 */
export const TaskCodeOptionIds = {
  T01: _REG.optionIds?.tasks?.code?.T01 ?? '{{registry.optionIds.tasks.code.T01}}',
  T02: _REG.optionIds?.tasks?.code?.T02 ?? '{{registry.optionIds.tasks.code.T02}}',
  T03: _REG.optionIds?.tasks?.code?.T03 ?? '{{registry.optionIds.tasks.code.T03}}',
  T04: _REG.optionIds?.tasks?.code?.T04 ?? '{{registry.optionIds.tasks.code.T04}}',
  T05: _REG.optionIds?.tasks?.code?.T05 ?? '{{registry.optionIds.tasks.code.T05}}',
} as const;

// =============================================================================
// DATABASE IDS
// =============================================================================

/**
 * Notion database identifiers for MCP operations
 */
export const DatabaseIds = {
  tasks: _REG.databases?.tasks?.id ?? '{{registry.databases.tasks.id}}',
  projects: _REG.databases?.projects?.id ?? '{{registry.databases.projects.id}}',
  teams: _REG.databases?.teams?.id ?? '{{registry.databases.teams.id}}',
  meetings: _REG.databases?.meetings?.id ?? '{{registry.databases.meetings.id}}',
} as const;

/**
 * Property IDs for the Tasks database
 */
export const TaskPropertyIds = {
  Name: 'title',
  Done: '%3FN%3AC',
  'Task Code': '%3Er%40C',
  'Created time': 'N%5D%5Cg',
  Project: 'wgnL',
  Team: 'KP%5Eq',
  Meetings: 'ErfI',
} as const;

/**
 * Team IDs for relation filters
 */
export const TeamIds = {
  Product:
    _REG.teamDatabases?.product?.id ??
    _REG.databases?.teams?.productId ??
    '{{registry.teamDatabases.product.id}}',
  Marketing:
    _REG.teamDatabases?.marketing?.id ??
    _REG.databases?.teams?.marketingId ??
    '{{registry.teamDatabases.marketing.id}}',
  Research:
    _REG.teamDatabases?.research?.id ??
    _REG.databases?.teams?.researchId ??
    '{{registry.teamDatabases.research.id}}',
  Operations:
    _REG.teamDatabases?.operations?.id ??
    _REG.databases?.teams?.operationsId ??
    '{{registry.teamDatabases.operations.id}}',
  Design:
    _REG.teamDatabases?.design?.id ??
    _REG.databases?.teams?.designId ??
    '{{registry.teamDatabases.design.id}}',
  Engineering:
    _REG.teamDatabases?.engineering?.id ??
    _REG.databases?.teams?.engineeringId ??
    '{{registry.teamDatabases.engineering.id}}',
} as const;

// =============================================================================
// TASK PAGE SCHEMA
// =============================================================================

/**
 * Rich text element from Notion API
 */
export const RichText = z.object({
  type: z.literal('text'),
  text: z.object({
    content: z.string(),
    link: z.string().nullable().optional(),
  }),
  annotations: z
    .object({
      bold: z.boolean().optional(),
      italic: z.boolean().optional(),
      strikethrough: z.boolean().optional(),
      underline: z.boolean().optional(),
      code: z.boolean().optional(),
      color: z.string().optional(),
    })
    .optional(),
  plain_text: z.string(),
});
export type RichText = z.infer<typeof RichText>;

/**
 * Relation item schema
 */
export const RelationItem = z.object({
  id: z.string().uuid(),
});
export type RelationItem = z.infer<typeof RelationItem>;

/**
 * Task page properties from Notion API
 */
export const TaskPageProperties = z.object({
  Name: z.object({
    id: z.literal('title'),
    type: z.literal('title'),
    title: z.array(RichText),
  }),
  Done: z.object({
    id: z.string(),
    type: z.literal('checkbox'),
    checkbox: z.boolean(),
  }),
  'Task Code': z.object({
    id: z.string(),
    type: z.literal('select'),
    select: z
      .object({
        id: z.string(),
        name: TaskCode,
        color: z.string(),
      })
      .nullable(),
  }),
  'Created time': z.object({
    id: z.string(),
    type: z.literal('created_time'),
    created_time: z.string(),
  }),
  Project: z.object({
    id: z.string(),
    type: z.literal('relation'),
    relation: z.array(RelationItem),
    has_more: z.boolean(),
  }),
  Team: z.object({
    id: z.string(),
    type: z.literal('relation'),
    relation: z.array(RelationItem),
    has_more: z.boolean(),
  }),
  Meetings: z.object({
    id: z.string(),
    type: z.literal('relation'),
    relation: z.array(RelationItem),
    has_more: z.boolean(),
  }),
});
export type TaskPageProperties = z.infer<typeof TaskPageProperties>;

/**
 * Full task page schema from Notion API
 */
export const TaskPage = z.object({
  object: z.literal('page'),
  id: z.string().uuid(),
  created_time: z.string(),
  last_edited_time: z.string(),
  created_by: z.object({
    object: z.literal('user'),
    id: z.string().uuid(),
  }),
  last_edited_by: z.object({
    object: z.literal('user'),
    id: z.string().uuid(),
  }),
  cover: z.any().nullable(),
  icon: z.any().nullable(),
  parent: z.object({
    type: z.literal('data_source_id'),
    data_source_id: z.string().uuid(),
    database_id: z.string().uuid(),
  }),
  archived: z.boolean(),
  in_trash: z.boolean(),
  is_locked: z.boolean().optional(),
  properties: TaskPageProperties,
  url: z.string().url(),
  public_url: z.string().url().nullable(),
});
export type TaskPage = z.infer<typeof TaskPage>;

// =============================================================================
// TASK NAME PARSING
// =============================================================================

/**
 * Parsed task name components
 */
export const TaskNameComponents = z.object({
  code: TaskCode,
  verb: z.string(),
  object: z.string(),
  fullDescription: z.string(),
});
export type TaskNameComponents = z.infer<typeof TaskNameComponents>;

/**
 * Parse a task name into its components
 * Format: {TaskCode} {Verb} {Object}
 */
export function parseTaskName(name: string): TaskNameComponents | null {
  const pattern = /^(T0[1-5]|TO[2-3])\s+(\w+)\s+(.+)$/;
  const match = name.trim().match(pattern);

  if (!match) {
    return null;
  }

  const [, code, verb, rest] = match;

  if (!code || !verb || !rest) {
    return null;
  }

  const codeResult = TaskCode.safeParse(code);
  if (!codeResult.success) {
    return null;
  }

  return {
    code: codeResult.data,
    verb,
    object: rest.trim(),
    fullDescription: `${verb} ${rest.trim()}`,
  };
}

/**
 * Generate a task name from components
 */
export function generateTaskName(components: TaskNameComponents): string {
  return `${components.code} ${components.verb} ${components.object}`;
}

// =============================================================================
// MCP OPERATION HELPERS
// =============================================================================

/**
 * Create task request body for MCP post-page
 */
export const CreateTaskRequest = z.object({
  parent: z.object({
    database_id: z.string().uuid(),
  }),
  properties: z.object({
    Name: z.object({
      title: z.array(
        z.object({
          text: z.object({
            content: z.string(),
          }),
        })
      ),
    }),
    Done: z
      .object({
        checkbox: z.boolean(),
      })
      .optional(),
    'Task Code': z
      .object({
        select: z.object({
          name: TaskCode,
        }),
      })
      .optional(),
    Project: z
      .object({
        relation: z.array(z.object({ id: z.string().uuid() })),
      })
      .optional(),
    Team: z
      .object({
        relation: z.array(z.object({ id: z.string().uuid() })),
      })
      .optional(),
    Meetings: z
      .object({
        relation: z.array(z.object({ id: z.string().uuid() })),
      })
      .optional(),
  }),
});
export type CreateTaskRequest = z.infer<typeof CreateTaskRequest>;

/**
 * Update task request body for MCP patch-page
 */
export const UpdateTaskRequest = z.object({
  properties: z.object({
    Done: z
      .object({
        checkbox: z.boolean(),
      })
      .optional(),
    'Task Code': z
      .object({
        select: z.object({
          name: TaskCode,
        }),
      })
      .optional(),
    Project: z
      .object({
        relation: z.array(z.object({ id: z.string().uuid() })),
      })
      .optional(),
    Team: z
      .object({
        relation: z.array(z.object({ id: z.string().uuid() })),
      })
      .optional(),
    Meetings: z
      .object({
        relation: z.array(z.object({ id: z.string().uuid() })),
      })
      .optional(),
  }),
});
export type UpdateTaskRequest = z.infer<typeof UpdateTaskRequest>;

/**
 * Query filter for incomplete tasks
 */
export const IncompleteTasksFilter = z.object({
  filter: z.object({
    property: z.literal('Done'),
    checkbox: z.object({
      equals: z.literal(false),
    }),
  }),
});
export type IncompleteTasksFilter = z.infer<typeof IncompleteTasksFilter>;

/**
 * Query filter for completed tasks
 */
export const CompletedTasksFilter = z.object({
  filter: z.object({
    property: z.literal('Done'),
    checkbox: z.object({
      equals: z.literal(true),
    }),
  }),
});
export type CompletedTasksFilter = z.infer<typeof CompletedTasksFilter>;

/**
 * Query filter for tasks by project
 */
export const TasksByProjectFilter = z.object({
  filter: z.object({
    property: z.literal('Project'),
    relation: z.object({
      contains: z.string().uuid(),
    }),
  }),
});
export type TasksByProjectFilter = z.infer<typeof TasksByProjectFilter>;

/**
 * Query filter for tasks by team
 */
export const TasksByTeamFilter = z.object({
  filter: z.object({
    property: z.literal('Team'),
    relation: z.object({
      contains: z.string().uuid(),
    }),
  }),
});
export type TasksByTeamFilter = z.infer<typeof TasksByTeamFilter>;

/**
 * Query filter for tasks by meeting
 */
export const TasksByMeetingFilter = z.object({
  filter: z.object({
    property: z.literal('Meetings'),
    relation: z.object({
      contains: z.string().uuid(),
    }),
  }),
});
export type TasksByMeetingFilter = z.infer<typeof TasksByMeetingFilter>;

/**
 * Combined filter for today's incomplete tasks
 */
export const TodaysIncompleteTasksFilter = z.object({
  filter: z.object({
    and: z.array(
      z.union([
        z.object({
          property: z.literal('Done'),
          checkbox: z.object({
            equals: z.literal(false),
          }),
        }),
        z.object({
          property: z.literal('Meetings'),
          relation: z.object({
            contains: z.string().uuid(),
          }),
        }),
      ])
    ),
  }),
});
export type TodaysIncompleteTasksFilter = z.infer<typeof TodaysIncompleteTasksFilter>;

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Get the next task code in sequence
 */
export function getNextTaskCode(currentCode: TaskCode): TaskCode | null {
  const codes: TaskCode[] = ['T01', 'T02', 'T03', 'T04', 'T05'];
  const currentIndex = codes.indexOf(currentCode);
  if (currentIndex === -1 || currentIndex === codes.length - 1) {
    return null;
  }
  return codes[currentIndex + 1] ?? null;
}

/**
 * Get task code sequence number (1-5)
 */
export function getTaskCodeNumber(code: TaskCode): number {
  const mapping: Record<TaskCode, number> = {
    T01: 1,
    T02: 2,
    T03: 3,
    T04: 4,
    T05: 5,
  };
  return mapping[code];
}

/**
 * Check if a task is complete
 */
export function isTaskComplete(task: TaskPage): boolean {
  return task.properties.Done.checkbox;
}

/**
 * Extract plain text from title array
 */
export function extractTaskTitle(titleArray: RichText[]): string {
  return titleArray.map((t) => t.plain_text).join('');
}

/**
 * Get task code from title if present
 */
export function extractTaskCodeFromTitle(title: string): TaskCode | null {
  const pattern = /^(T0[1-5]|TO[2-3])\s/;
  const match = title.match(pattern);
  if (!match) {
    return null;
  }
  const result = TaskCode.safeParse(match[1]);
  return result.success ? result.data : null;
}

/**
 * Validate task has required relations
 */
export function validateTaskRelations(task: TaskPage): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (task.properties.Project.relation.length === 0) {
    errors.push('Task must be linked to a project');
  }

  if (task.properties.Team.relation.length === 0) {
    errors.push('Task must be linked to a team');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Calculate task completion percentage for a set of tasks
 */
export function calculateCompletionPercentage(tasks: TaskPage[]): number {
  if (tasks.length === 0) {
    return 0;
  }

  const completedCount = tasks.filter(isTaskComplete).length;
  return Math.round((completedCount / tasks.length) * 100);
}

/**
 * Group tasks by task code
 */
export function groupTasksByCode(tasks: TaskPage[]): Record<TaskCode, TaskPage[]> {
  const grouped: Record<TaskCode, TaskPage[]> = {
    T01: [],
    T02: [],
    T03: [],
    T04: [],
    T05: [],
  };

  for (const task of tasks) {
    const code = task.properties['Task Code'].select?.name;
    if (code) {
      grouped[code].push(task);
    }
  }

  return grouped;
}

/**
 * Sort tasks by creation time (oldest first)
 */
export function sortTasksByCreationTime(tasks: TaskPage[]): TaskPage[] {
  return [...tasks].sort(
    (a, b) =>
      new Date(a.properties['Created time'].created_time).getTime() -
      new Date(b.properties['Created time'].created_time).getTime()
  );
}

/**
 * Filter tasks by completion status
 */
export function filterTasksByStatus(tasks: TaskPage[], done: boolean): TaskPage[] {
  return tasks.filter((task) => task.properties.Done.checkbox === done);
}
