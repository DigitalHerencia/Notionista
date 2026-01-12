/**
 * Meeting Database Schemas for Digital Herencia Notion Workspace
 *
 * These Zod schemas model the Meetings database structure, template types,
 * and block content for type-safe MCP operations.
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
 * Meeting types available in the Meetings database
 */
export const MeetingType = z.enum([
  'Operations',
  'Standup',
  'Weekly Sync',
  'Post-mortem',
  'Sprint Planning',
  'Design',
  'Engineering',
]);
export type MeetingType = z.infer<typeof MeetingType>;

/**
 * Meeting cadence options
 */
export const MeetingCadence = z.enum(['Daily', 'Weekly', 'Biweekly', 'Ad Hoc']);
export type MeetingCadence = z.infer<typeof MeetingCadence>;

/**
 * Meeting type to select option ID mapping (for MCP operations)
 */
export const MeetingTypeOptionIds = {
  Operations:
    _REG.optionIds?.meetings?.type?.Operations ?? '{{registry.optionIds.meetings.type.Operations}}',
  Standup:
    _REG.optionIds?.meetings?.type?.Standup ?? '{{registry.optionIds.meetings.type.Standup}}',
  'Weekly Sync':
    _REG.optionIds?.meetings?.type?.['Weekly Sync'] ??
    '{{registry.optionIds.meetings.type.Weekly Sync}}',
  'Post-mortem':
    _REG.optionIds?.meetings?.type?.['Post-mortem'] ??
    '{{registry.optionIds.meetings.type.Post-mortem}}',
  'Sprint Planning':
    _REG.optionIds?.meetings?.type?.['Sprint Planning'] ??
    '{{registry.optionIds.meetings.type.Sprint Planning}}',
  Design: _REG.optionIds?.meetings?.type?.Design ?? '{{registry.optionIds.meetings.type.Design}}',
  Engineering:
    _REG.optionIds?.meetings?.type?.Engineering ??
    '{{registry.optionIds.meetings.type.Engineering}}',
} as const;

/**
 * Cadence to select option ID mapping
 */
export const CadenceOptionIds = {
  Daily:
    _REG.optionIds?.meetings?.cadence?.Daily ?? '{{registry.optionIds.meetings.cadence.Daily}}',
  Weekly:
    _REG.optionIds?.meetings?.cadence?.Weekly ?? '{{registry.optionIds.meetings.cadence.Weekly}}',
  Biweekly:
    _REG.optionIds?.meetings?.cadence?.Biweekly ??
    '{{registry.optionIds.meetings.cadence.Biweekly}}',
  'Ad Hoc':
    _REG.optionIds?.meetings?.cadence?.['Ad Hoc'] ??
    '{{registry.optionIds.meetings.cadence.Ad Hoc}}',
} as const;

// =============================================================================
// DATABASE IDS
// =============================================================================

/**
 * Notion database identifiers for MCP operations
 */
export const DatabaseIds = {
  meetings: _REG.databases?.meetings?.id ?? '{{registry.databases.meetings.id}}',
  teams: _REG.databases?.teams?.id ?? '{{registry.databases.teams.id}}',
  projects: _REG.databases?.projects?.id ?? '{{registry.databases.projects.id}}',
  tasks: _REG.databases?.tasks?.id ?? '{{registry.databases.tasks.id}}',
} as const;

/**
 * Template IDs for each meeting type
 */
export const MeetingTemplateIds = {
  'Daily Standup':
    _REG.templateIds?.meetings?.['Daily Standup'] ??
    '{{registry.templateIds.meetings.Daily Standup}}',
  'Operations Meeting':
    _REG.templateIds?.meetings?.['Operations Meeting'] ??
    '{{registry.templateIds.meetings.Operations Meeting}}',
  'Design Meeting':
    _REG.templateIds?.meetings?.['Design Meeting'] ??
    '{{registry.templateIds.meetings.Design Meeting}}',
  'Engineering Meeting':
    _REG.templateIds?.meetings?.['Engineering Meeting'] ??
    '{{registry.templateIds.meetings.Engineering Meeting}}',
  'Weekly Sync':
    _REG.templateIds?.meetings?.['Weekly Sync'] ?? '{{registry.templateIds.meetings.Weekly Sync}}',
  'Sprint Planning':
    _REG.templateIds?.meetings?.['Sprint Planning'] ??
    '{{registry.templateIds.meetings.Sprint Planning}}',
  'Post-mortem':
    _REG.templateIds?.meetings?.['Post-mortem'] ?? '{{registry.templateIds.meetings.Post-mortem}}',
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
// MEETING PAGE SCHEMA
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
 * Date mention in rich text (used for @Today in meeting titles)
 */
export const DateMention = z.object({
  type: z.literal('mention'),
  mention: z.object({
    type: z.literal('date'),
    date: z.object({
      start: z.string(), // YYYY-MM-DD
      end: z.string().nullable().optional(),
      time_zone: z.string().nullable().optional(),
    }),
  }),
  plain_text: z.string(),
});
export type DateMention = z.infer<typeof DateMention>;

/**
 * Meeting page properties from Notion API
 */
export const MeetingPageProperties = z.object({
  Name: z.object({
    id: z.literal('title'),
    type: z.literal('title'),
    title: z.array(z.union([RichText, DateMention])),
  }),
  Type: z.object({
    id: z.string(),
    type: z.literal('select'),
    select: z
      .object({
        id: z.string(),
        name: MeetingType,
        color: z.string(),
      })
      .nullable(),
  }),
  Cadence: z.object({
    id: z.string(),
    type: z.literal('select'),
    select: z
      .object({
        id: z.string(),
        name: MeetingCadence,
        color: z.string(),
      })
      .nullable(),
  }),
  Created: z.object({
    id: z.string(),
    type: z.literal('date'),
    date: z
      .object({
        start: z.string(),
        end: z.string().nullable().optional(),
        time_zone: z.string().nullable().optional(),
      })
      .nullable(),
  }),
  Archived: z.object({
    id: z.string(),
    type: z.literal('checkbox'),
    checkbox: z.boolean(),
  }),
  Team: z.object({
    id: z.string(),
    type: z.literal('relation'),
    relation: z.array(z.object({ id: z.string() })),
    has_more: z.boolean(),
  }),
  Projects: z.object({
    id: z.string(),
    type: z.literal('relation'),
    relation: z.array(z.object({ id: z.string() })),
    has_more: z.boolean(),
  }),
});
export type MeetingPageProperties = z.infer<typeof MeetingPageProperties>;

/**
 * Complete meeting page from Notion API
 */
export const MeetingPage = z.object({
  object: z.literal('page'),
  id: z.string().uuid(),
  created_time: z.string(),
  last_edited_time: z.string(),
  archived: z.boolean(),
  in_trash: z.boolean(),
  url: z.string().url(),
  properties: MeetingPageProperties,
});
export type MeetingPage = z.infer<typeof MeetingPage>;

// =============================================================================
// BLOCK CONTENT SCHEMAS
// =============================================================================

/**
 * Base block structure
 */
const BaseBlock = z.object({
  object: z.literal('block'),
  id: z.string().uuid(),
  created_time: z.string(),
  last_edited_time: z.string(),
  has_children: z.boolean(),
  archived: z.boolean(),
  in_trash: z.boolean(),
});

/**
 * Heading 1 block
 */
export const Heading1Block = BaseBlock.extend({
  type: z.literal('heading_1'),
  heading_1: z.object({
    rich_text: z.array(RichText),
    is_toggleable: z.boolean().optional(),
    color: z.string().optional(),
  }),
});
export type Heading1Block = z.infer<typeof Heading1Block>;

/**
 * Heading 2 block
 */
export const Heading2Block = BaseBlock.extend({
  type: z.literal('heading_2'),
  heading_2: z.object({
    rich_text: z.array(RichText),
    is_toggleable: z.boolean().optional(),
    color: z.string().optional(),
  }),
});
export type Heading2Block = z.infer<typeof Heading2Block>;

/**
 * Paragraph block
 */
export const ParagraphBlock = BaseBlock.extend({
  type: z.literal('paragraph'),
  paragraph: z.object({
    rich_text: z.array(RichText),
    color: z.string().optional(),
  }),
});
export type ParagraphBlock = z.infer<typeof ParagraphBlock>;

/**
 * Bulleted list item block
 */
export const BulletedListItemBlock = BaseBlock.extend({
  type: z.literal('bulleted_list_item'),
  bulleted_list_item: z.object({
    rich_text: z.array(RichText),
    color: z.string().optional(),
  }),
});
export type BulletedListItemBlock = z.infer<typeof BulletedListItemBlock>;

/**
 * Numbered list item block
 */
export const NumberedListItemBlock = BaseBlock.extend({
  type: z.literal('numbered_list_item'),
  numbered_list_item: z.object({
    rich_text: z.array(RichText),
    color: z.string().optional(),
  }),
});
export type NumberedListItemBlock = z.infer<typeof NumberedListItemBlock>;

/**
 * To-do block (checkbox item)
 */
export const ToDoBlock = BaseBlock.extend({
  type: z.literal('to_do'),
  to_do: z.object({
    rich_text: z.array(RichText),
    checked: z.boolean(),
    color: z.string().optional(),
  }),
});
export type ToDoBlock = z.infer<typeof ToDoBlock>;

/**
 * Union of all meeting-related block types
 */
export const MeetingBlock = z.discriminatedUnion('type', [
  Heading1Block,
  Heading2Block,
  ParagraphBlock,
  BulletedListItemBlock,
  NumberedListItemBlock,
  ToDoBlock,
]);
export type MeetingBlock = z.infer<typeof MeetingBlock>;

// =============================================================================
// MEETING CONTENT TEMPLATES
// =============================================================================

/**
 * Daily Standup content structure
 */
export const DailyStandupContent = z.object({
  yesterday: z.array(z.string()),
  today: z.array(z.string()),
  blockers: z.array(z.string()),
  actionItems: z.array(
    z.object({
      text: z.string(),
      checked: z.boolean().default(false),
    })
  ),
});
export type DailyStandupContent = z.infer<typeof DailyStandupContent>;

/**
 * Operations Meeting content structure
 */
export const OperationsMeetingContent = z.object({
  progressUpdates: z.array(z.string()),
  metricsReview: z.string().optional(),
  topicsToDiscuss: z.array(z.string()),
  otherActions: z.array(
    z.object({
      action: z.string(),
      owner: z.string().optional(),
      dueDate: z.string().optional(),
    })
  ),
  notes: z.array(z.string()),
  followUpActions: z.array(z.string()),
});
export type OperationsMeetingContent = z.infer<typeof OperationsMeetingContent>;

/**
 * Design Meeting content structure
 */
export const DesignMeetingContent = z.object({
  goals: z.array(z.string()),
  discussionNotes: z.array(z.string()),
  actionItems: z.array(
    z.object({
      text: z.string(),
      checked: z.boolean().default(false),
    })
  ),
});
export type DesignMeetingContent = z.infer<typeof DesignMeetingContent>;

/**
 * Engineering Meeting content structure
 */
export const EngineeringMeetingContent = z.object({
  stretch: z.array(z.string()),
  tasks: z.array(
    z.object({
      name: z.string(),
      owner: z.string(),
      definition: z.string(),
      why: z.string(),
      testingPlan: z.string(),
      successCriteria: z.string(),
    })
  ),
  questions: z.array(z.string()),
  notes: z.array(z.string()),
});
export type EngineeringMeetingContent = z.infer<typeof EngineeringMeetingContent>;

/**
 * Weekly Sync content structure
 */
export const WeeklySyncContent = z.object({
  lastWeek: z.array(z.string()),
  thisWeek: z.array(z.string()),
  blockers: z.array(z.string()),
  actionItems: z.array(
    z.object({
      text: z.string(),
      checked: z.boolean().default(false),
    })
  ),
});
export type WeeklySyncContent = z.infer<typeof WeeklySyncContent>;

/**
 * Sprint Planning content structure
 */
export const SprintPlanningContent = z.object({
  sprintGoal: z.string(),
  sprintBacklog: z.array(
    z.object({
      code: z.string(), // e.g., "PROD-M1-P1.1-PRD"
      description: z.string(),
      team: z.string(),
      dateRange: z.string(), // e.g., "Jan 1–15"
    })
  ),
  teamRoles: z.array(
    z.object({
      team: z.string(),
      responsibilities: z.string(),
    })
  ),
  notes: z.array(z.string()),
});
export type SprintPlanningContent = z.infer<typeof SprintPlanningContent>;

/**
 * Post-mortem content structure
 */
export const PostMortemContent = z.object({
  userFacingImpact: z.array(z.string()),
  timeline: z.array(z.string()),
  relevantMetrics: z.string().optional(),
  causeAnalysis: z.string(),
  resolution: z.string(),
  futureWork: z.string(),
  actionItems: z.array(
    z.object({
      text: z.string(),
      checked: z.boolean().default(false),
    })
  ),
});
export type PostMortemContent = z.infer<typeof PostMortemContent>;

/**
 * Union of all meeting content types
 */
export const MeetingContent = z.discriminatedUnion('type', [
  z.object({ type: z.literal('Standup'), content: DailyStandupContent }),
  z.object({ type: z.literal('Operations'), content: OperationsMeetingContent }),
  z.object({ type: z.literal('Design'), content: DesignMeetingContent }),
  z.object({ type: z.literal('Engineering'), content: EngineeringMeetingContent }),
  z.object({ type: z.literal('Weekly Sync'), content: WeeklySyncContent }),
  z.object({ type: z.literal('Sprint Planning'), content: SprintPlanningContent }),
  z.object({ type: z.literal('Post-mortem'), content: PostMortemContent }),
]);
export type MeetingContent = z.infer<typeof MeetingContent>;

// =============================================================================
// CONTEXT CARRYOVER SCHEMAS
// =============================================================================

/**
 * Previous meeting context for carryover
 */
export const PreviousMeetingContext = z.object({
  meetingId: z.string().uuid(),
  date: z.string(), // YYYY-MM-DD
  type: MeetingType,
  completedItems: z.array(z.string()),
  incompleteItems: z.array(z.string()),
  unresolvedBlockers: z.array(z.string()),
  openActionItems: z.array(z.string()),
});
export type PreviousMeetingContext = z.infer<typeof PreviousMeetingContext>;

/**
 * Tasks context for meeting population
 */
export const TasksContext = z.object({
  dueToday: z.array(
    z.object({
      id: z.string().uuid(),
      name: z.string(),
      priority: z.enum(['High', 'Medium', 'Low']),
      projectId: z.string().uuid().optional(),
      teamId: z.string().uuid().optional(),
    })
  ),
  overdue: z.array(
    z.object({
      id: z.string().uuid(),
      name: z.string(),
      dueDate: z.string(),
    })
  ),
  highPriority: z.array(
    z.object({
      id: z.string().uuid(),
      name: z.string(),
    })
  ),
});
export type TasksContext = z.infer<typeof TasksContext>;

/**
 * Projects context for meeting population
 */
export const ProjectsContext = z.object({
  activeProjects: z.array(
    z.object({
      id: z.string().uuid(),
      name: z.string(),
      phase: z.string(), // e.g., "P1.1"
      milestone: z.string(), // e.g., "M1"
      endDate: z.string().optional(),
      teamId: z.string().uuid(),
    })
  ),
});
export type ProjectsContext = z.infer<typeof ProjectsContext>;

/**
 * Complete context for generating meeting content
 */
export const MeetingGenerationContext = z.object({
  targetDate: z.string(), // YYYY-MM-DD
  meetingType: MeetingType,
  teams: z.array(z.string().uuid()),
  previousMeeting: PreviousMeetingContext.optional(),
  tasks: TasksContext,
  projects: ProjectsContext,
});
export type MeetingGenerationContext = z.infer<typeof MeetingGenerationContext>;

// =============================================================================
// MCP OPERATION HELPERS
// =============================================================================

/**
 * Query filter for meetings by date
 */
export const MeetingDateFilter = z.object({
  property: z.literal('Created'),
  date: z.object({
    equals: z.string().optional(),
    before: z.string().optional(),
    after: z.string().optional(),
    on_or_before: z.string().optional(),
    on_or_after: z.string().optional(),
  }),
});
export type MeetingDateFilter = z.infer<typeof MeetingDateFilter>;

/**
 * Query filter for meetings by type
 */
export const MeetingTypeFilter = z.object({
  property: z.literal('Type'),
  select: z.object({
    equals: MeetingType.optional(),
  }),
});
export type MeetingTypeFilter = z.infer<typeof MeetingTypeFilter>;

/**
 * Block creation request for appending content
 */
export const BlockCreateRequest = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('heading_1'),
    heading_1: z.object({
      rich_text: z.array(
        z.object({ type: z.literal('text'), text: z.object({ content: z.string() }) })
      ),
    }),
  }),
  z.object({
    type: z.literal('paragraph'),
    paragraph: z.object({
      rich_text: z.array(
        z.object({ type: z.literal('text'), text: z.object({ content: z.string() }) })
      ),
    }),
  }),
  z.object({
    type: z.literal('bulleted_list_item'),
    bulleted_list_item: z.object({
      rich_text: z.array(
        z.object({ type: z.literal('text'), text: z.object({ content: z.string() }) })
      ),
    }),
  }),
  z.object({
    type: z.literal('to_do'),
    to_do: z.object({
      rich_text: z.array(
        z.object({ type: z.literal('text'), text: z.object({ content: z.string() }) })
      ),
      checked: z.boolean(),
    }),
  }),
]);
export type BlockCreateRequest = z.infer<typeof BlockCreateRequest>;

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Get template ID for a meeting type
 */
export function getTemplateId(meetingName: keyof typeof MeetingTemplateIds): string {
  return MeetingTemplateIds[meetingName];
}

/**
 * Get team ID by name
 */
export function getTeamId(teamName: keyof typeof TeamIds): string {
  return TeamIds[teamName];
}

/**
 * Format meeting name with date mention
 */
export function formatMeetingName(type: string, date: string): string {
  return `${type} @${date}`;
}

/**
 * Parse project code from standard format
 * Example: "PROD-M1-P1.1-PRD" → { domain: "PROD", milestone: "M1", phase: "P1.1", code: "PRD" }
 */
export function parseProjectCode(code: string): {
  domain: string;
  milestone: string;
  phase: string;
  code: string;
} | null {
  const match = code.match(/^([A-Z]+)-M(\d)-P(\d\.\d)-([A-Z]+)$/);
  if (!match || !match[1] || !match[2] || !match[3] || !match[4]) return null;
  return {
    domain: match[1],
    milestone: `M${match[2]}`,
    phase: `P${match[3]}`,
    code: match[4],
  };
}

/**
 * Create a bullet list item block request
 */
export function createBulletItem(content: string): BlockCreateRequest {
  return {
    type: 'bulleted_list_item',
    bulleted_list_item: {
      rich_text: [{ type: 'text', text: { content } }],
    },
  };
}

/**
 * Create a to-do block request
 */
export function createToDoItem(content: string, checked = false): BlockCreateRequest {
  return {
    type: 'to_do',
    to_do: {
      rich_text: [{ type: 'text', text: { content } }],
      checked,
    },
  };
}

/**
 * Create a heading block request
 */
export function createHeading(content: string): BlockCreateRequest {
  return {
    type: 'heading_1',
    heading_1: {
      rich_text: [{ type: 'text', text: { content } }],
    },
  };
}
