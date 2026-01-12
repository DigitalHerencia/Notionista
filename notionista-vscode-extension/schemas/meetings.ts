/**
 * Meeting Database Schemas for Digital Herencia Notion Workspace
 *
 * These Zod schemas model the Meetings database structure, template types,
 * and block content for type-safe MCP operations.
 */

import { z } from 'zod';

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
  Operations: 'a530d641-29e6-43df-87a4-5cb7601fd852',
  Standup: '28b68013-20d5-4824-b810-45cde8784581',
  'Weekly Sync': '8ee247a9-cb60-430a-9ea6-d5c053253334',
  'Post-mortem': '3a8fd64c-899d-4c39-ba97-ac4f565d6e94',
  'Sprint Planning': '5fb57c36-999f-49e2-b153-96531d086862',
  Design: '1747fcca-8207-42c8-802f-fd43965c016a',
  Engineering: 'Kfkf',
} as const;

/**
 * Cadence to select option ID mapping
 */
export const CadenceOptionIds = {
  Daily: 'AOwK',
  Weekly: '_eHf',
  Biweekly: 'qq]q',
  'Ad Hoc': '[CYw',
} as const;

// =============================================================================
// DATABASE IDS
// =============================================================================

/**
 * Notion database identifiers for MCP operations
 */
export const DatabaseIds = {
  meetings: '2caa4e63-bf23-815a-8981-000bbdbb7f0b',
  teams: '2d5a4e63-bf23-816b-9f75-000b219f7713',
  projects: '2d5a4e63-bf23-8115-a70f-000bc1ef9d05',
  tasks: '2d5a4e63-bf23-8137-8277-000b41c867c3',
} as const;

/**
 * Template IDs for each meeting type
 */
export const MeetingTemplateIds = {
  'Daily Standup': '2cca4e63-bf23-80ae-b4fd-cadcb3b758ea',
  'Operations Meeting': '2cda4e63-bf23-80b3-8f48-ff21914fe6a4',
  'Design Meeting': '2cca4e63-bf23-80f5-a6bd-cac3b18ae084',
  'Engineering Meeting': '2cda4e63-bf23-80ef-95cd-fa71d8657c94',
  'Weekly Sync': '2cca4e63-bf23-8031-94b0-e172297e0443',
  'Sprint Planning': '2cca4e63-bf23-80a6-991b-f31186c099cb',
  'Post-mortem': '2cca4e63-bf23-80a6-991b-f31186c099cb',
} as const;

/**
 * Team IDs for relation filters
 */
export const TeamIds = {
  Product: '2d5a4e63-bf23-818d-a26b-c86434571d4a',
  Marketing: '2d5a4e63-bf23-80fd-bf70-f6d679ba0d14',
  Research: '2d5a4e63-bf23-8081-9ff6-e8ecf118aee6',
  Operations: '2d5a4e63-bf23-808e-96c6-e13df82c008b',
  Design: '2d5a4e63-bf23-8097-bffe-dd7bde5a3f69',
  Engineering: '2d5a4e63-bf23-8034-a68a-f4e24b342def',
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
