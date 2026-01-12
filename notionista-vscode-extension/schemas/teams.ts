/**
 * Teams Database Schemas for Digital Herencia Notion Workspace
 *
 * These Zod schemas model the Teams database structure and team assignments
 * for type-safe MCP operations.
 */

import { z } from 'zod';

// =============================================================================
// ENUMS & LITERALS
// =============================================================================

/**
 * Team names in the Digital Herencia workspace
 */
export const TeamName = z.enum([
  'Engineering Team',
  'Marketing Team',
  'Operations Team',
  'Design Team',
  'Research Team',
  'Product Team',
]);
export type TeamName = z.infer<typeof TeamName>;

/**
 * Domain codes that map to teams
 */
export const Domain = z.enum(['OPS', 'PROD', 'DES', 'ENG', 'MKT', 'RES']);
export type Domain = z.infer<typeof Domain>;

// =============================================================================
// ID MAPPINGS
// =============================================================================

/**
 * Team name to page ID mapping (for MCP operations)
 */
export const TeamIds = {
  'Engineering Team': '2d5a4e63-bf23-8034-a68a-f4e24b342def',
  'Marketing Team': '2d5a4e63-bf23-8081-9ff6-e8ecf118aee6',
  'Operations Team': '2d5a4e63-bf23-808e-96c6-e13df82c008b',
  'Design Team': '2d5a4e63-bf23-8097-bffe-dd7bde5a3f69',
  'Research Team': '2d5a4e63-bf23-80fd-bf70-f6d679ba0d14',
  'Product Team': '2d5a4e63-bf23-818d-a26b-c86434571d4a',
} as const;

/**
 * Domain code to team name mapping
 */
export const DomainToTeam = {
  OPS: 'Operations Team',
  PROD: 'Product Team',
  DES: 'Design Team',
  ENG: 'Engineering Team',
  MKT: 'Marketing Team',
  RES: 'Research Team',
} as const;

/**
 * Team name to domain code mapping
 */
export const TeamToDomain = {
  'Operations Team': 'OPS',
  'Product Team': 'PROD',
  'Design Team': 'DES',
  'Engineering Team': 'ENG',
  'Marketing Team': 'MKT',
  'Research Team': 'RES',
} as const;

/**
 * Team colors for UI display
 */
export const TeamColors = {
  'Engineering Team': 'gray',
  'Marketing Team': 'purple',
  'Operations Team': 'green',
  'Design Team': 'pink',
  'Research Team': 'yellow',
  'Product Team': 'blue',
} as const;

/**
 * Team icon names in Notion
 */
export const TeamIcons = {
  'Engineering Team': 'command-line',
  'Marketing Team': 'megaphone',
  'Operations Team': 'meeting',
  'Design Team': 'color-palette',
  'Research Team': 'chemistry',
  'Product Team': 'barcode',
} as const;

// =============================================================================
// DATABASE IDS
// =============================================================================

/**
 * Notion database identifiers for MCP operations
 */
export const DatabaseIds = {
  teams: '2d5a4e63-bf23-816b-9f75-000b219f7713',
  projects: '2d5a4e63-bf23-8115-a70f-000bc1ef9d05',
  tasks: '2d5a4e63-bf23-8137-8277-000b41c867c3',
  meetings: '2caa4e63-bf23-815a-8981-000bbdbb7f0b',
} as const;

/**
 * Team-specific database IDs (projects/roadmaps and tasks)
 * These are embedded databases within each team page.
 * Note: "Projects" and "Roadmap" are interchangeable terms.
 */
export const TeamDatabaseIds = {
  operations: {
    projects: '2d2a4e63-bf23-8078-828e-000b16ccc334', // Ops Projects
    tasks: '2d5a4e63-bf23-8113-a0ef-000be10caf3e', // Ops Tasks
  },
  product: {
    projects: '2d5a4e63-bf23-81f0-ae53-000b655a0fc9', // Product Roadmap
    tasks: '2d5a4e63-bf23-81f6-89cd-000bd428924b', // Product Tasks
  },
  design: {
    projects: '2d6a4e63-bf23-80c3-9f1b-000b887db23f', // Design Roadmap
    tasks: '2d5a4e63-bf23-8168-9326-000b7670541f', // Design Tasks
  },
  engineering: {
    projects: '2d6a4e63-bf23-803d-a2e3-000bd2b52727', // Engineering Roadmap
    tasks: '2d5a4e63-bf23-817c-bd9c-000b507438a6', // Engineering Tasks
  },
  marketing: {
    projects: '2d2a4e63-bf23-81b1-a7ef-000bab5ba8f8', // Marketing Projects
    tasks: '2d5a4e63-bf23-816c-8877-000b6ff1beb5', // Marketing Tasks
  },
  research: {
    courses: '2d5a4e63-bf23-8183-9a03-000b0811d005', // Course Topics
    modules: '2d5a4e63-bf23-81f6-85de-000ba7ab4903', // Learning Modules
    leetcode: '2d5a4e63-bf23-819f-822f-000b27e214e6', // LeetCode Blind 75 Tracker
  },
} as const;

/**
 * Property IDs for the Teams database (URL-encoded)
 */
export const TeamPropertyIds = {
  'Team name': 'title',
  Meetings: '%3DkEt',
  Tasks: 'B%7Bf%5C',
  Projects: 'T%3BR~',
  'Tasks Completed': 'Mpl%60',
  'Projects Complete': 'vXds',
} as const;

/**
 * Property IDs (decoded) for reference
 */
export const TeamPropertyIdsDecoded = {
  'Team name': 'title',
  Meetings: '=kEt',
  Tasks: 'B{f\\',
  Projects: 'T;R~',
  'Tasks Completed': 'Mpl`',
  'Projects Complete': 'vXds',
} as const;

// =============================================================================
// TEAM PAGE SCHEMA
// =============================================================================

/**
 * Rich text content schema (shared with other schemas)
 */
export const RichText = z.object({
  type: z.literal('text'),
  text: z.object({
    content: z.string(),
    link: z.object({ url: z.string() }).nullable().optional(),
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
  href: z.string().nullable().optional(),
});
export type RichText = z.infer<typeof RichText>;

/**
 * Relation property value schema
 */
export const RelationValue = z.object({
  id: z.string().uuid(),
});
export type RelationValue = z.infer<typeof RelationValue>;

/**
 * Formula property value schema (for computed fields)
 */
export const FormulaValue = z.object({
  type: z.enum(['string', 'number', 'boolean', 'date']),
  string: z.string().nullable().optional(),
  number: z.number().nullable().optional(),
  boolean: z.boolean().nullable().optional(),
  date: z
    .object({
      start: z.string(),
      end: z.string().nullable().optional(),
    })
    .nullable()
    .optional(),
});
export type FormulaValue = z.infer<typeof FormulaValue>;

/**
 * Teams page properties schema
 */
export const TeamPageProperties = z.object({
  'Team name': z.object({
    id: z.literal('title'),
    type: z.literal('title'),
    title: z.array(RichText),
  }),
  Meetings: z.object({
    id: z.string(),
    type: z.literal('relation'),
    relation: z.array(RelationValue),
    has_more: z.boolean().optional(),
  }),
  Tasks: z.object({
    id: z.string(),
    type: z.literal('relation'),
    relation: z.array(RelationValue),
    has_more: z.boolean().optional(),
  }),
  Projects: z.object({
    id: z.string(),
    type: z.literal('relation'),
    relation: z.array(RelationValue),
    has_more: z.boolean().optional(),
  }),
  'Tasks Completed': z.object({
    id: z.string(),
    type: z.literal('formula'),
    formula: FormulaValue,
  }),
  'Projects Complete': z.object({
    id: z.string(),
    type: z.literal('formula'),
    formula: FormulaValue,
  }),
});
export type TeamPageProperties = z.infer<typeof TeamPageProperties>;

/**
 * Full Team page schema (from Notion API response)
 */
export const TeamPage = z.object({
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
  cover: z
    .object({
      type: z.enum(['external', 'file']),
      external: z.object({ url: z.string() }).optional(),
      file: z.object({ url: z.string(), expiry_time: z.string() }).optional(),
    })
    .nullable(),
  icon: z
    .union([
      z.object({
        type: z.literal('emoji'),
        emoji: z.string(),
      }),
      z.object({
        type: z.literal('external'),
        external: z.object({ url: z.string() }),
      }),
      z.object({
        type: z.literal('file'),
        file: z.object({ url: z.string(), expiry_time: z.string() }),
      }),
      z.object({
        type: z.literal('custom_emoji'),
        custom_emoji: z.object({
          id: z.string(),
          name: z.string(),
          url: z.string().optional(),
        }),
      }),
    ])
    .nullable(),
  parent: z.object({
    type: z.literal('database_id'),
    database_id: z.string().uuid(),
  }),
  archived: z.boolean(),
  in_trash: z.boolean(),
  properties: TeamPageProperties,
  url: z.string().url(),
  public_url: z.string().url().nullable(),
});
export type TeamPage = z.infer<typeof TeamPage>;

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Get team ID from team name
 */
export function getTeamId(teamName: TeamName): string {
  return TeamIds[teamName];
}

/**
 * Get team name from team ID
 */
export function getTeamName(teamId: string): TeamName | null {
  const entry = Object.entries(TeamIds).find(([, id]) => id === teamId);
  return entry ? (entry[0] as TeamName) : null;
}

/**
 * Get team from domain code
 */
export function getTeamFromDomain(domain: Domain): TeamName {
  return DomainToTeam[domain];
}

/**
 * Get domain from team name
 */
export function getDomainFromTeam(teamName: TeamName): Domain {
  return TeamToDomain[teamName];
}

/**
 * Get team color
 */
export function getTeamColor(teamName: TeamName): string {
  return TeamColors[teamName];
}

/**
 * Get team icon name
 */
export function getTeamIcon(teamName: TeamName): string {
  return TeamIcons[teamName];
}

/**
 * Parse the title from a team page
 */
export function parseTeamName(page: TeamPage): string {
  return page.properties['Team name'].title.map((t) => t.plain_text).join('') || 'Unnamed Team';
}

/**
 * Parse tasks completed formula result
 * Returns { completed: number, total: number } or null if formula is empty
 */
export function parseTasksCompleted(page: TeamPage): { completed: number; total: number } | null {
  const formula = page.properties['Tasks Completed'].formula;
  if (formula.type !== 'string' || !formula.string) {
    return null;
  }

  // Format: "Tasks Completed: X/Y"
  const match = formula.string.match(/Tasks Completed:\s*(\d+)\/(\d+)/);
  if (!match) {
    return null;
  }

  const [, completedStr, totalStr] = match;
  const completed = completedStr ? parseInt(completedStr, 10) : 0;
  const total = totalStr ? parseInt(totalStr, 10) : 0;
  return { completed, total };
}

/**
 * Parse projects complete formula result
 * Returns { completed: number, total: number } or null if formula is empty
 */
export function parseProjectsComplete(page: TeamPage): { completed: number; total: number } | null {
  const formula = page.properties['Projects Complete'].formula;
  if (formula.type !== 'string' || !formula.string) {
    return null;
  }

  // Format: "Projects Completed: X/Y"
  const match = formula.string.match(/Projects Completed:\s*(\d+)\/(\d+)/);
  if (!match) {
    return null;
  }

  const [, completedStr, totalStr] = match;
  const completed = completedStr ? parseInt(completedStr, 10) : 0;
  const total = totalStr ? parseInt(totalStr, 10) : 0;
  return { completed, total };
}

/**
 * Get related project IDs from a team page
 */
export function getRelatedProjectIds(page: TeamPage): string[] {
  return page.properties.Projects.relation.map((r) => r.id);
}

/**
 * Get related task IDs from a team page
 */
export function getRelatedTaskIds(page: TeamPage): string[] {
  return page.properties.Tasks.relation.map((r) => r.id);
}

/**
 * Get related meeting IDs from a team page
 */
export function getRelatedMeetingIds(page: TeamPage): string[] {
  return page.properties.Meetings.relation.map((r) => r.id);
}

// =============================================================================
// QUERY BUILDERS
// =============================================================================

type TeamRelationFilter = {
  property: 'Team';
  relation: {
    contains: string;
  };
};

type DoneFalseFilter = {
  property: 'Done';
  checkbox: {
    equals: false;
  };
};

type TeamProjectsFilter = TeamRelationFilter;

type TeamTasksFilter =
  | TeamRelationFilter
  | {
      and: [TeamRelationFilter, DoneFalseFilter];
    };

type TeamMeetingsFilter = TeamRelationFilter;

/**
 * Build a filter for querying projects by team
 */
export function buildTeamProjectsFilter(teamId: string): TeamProjectsFilter {
  return {
    property: 'Team',
    relation: {
      contains: teamId,
    },
  };
}

/**
 * Build a filter for querying tasks by team
 */
export function buildTeamTasksFilter(teamId: string, includeCompleted = false): TeamTasksFilter {
  if (includeCompleted) {
    return {
      property: 'Team',
      relation: {
        contains: teamId,
      },
    };
  }

  return {
    and: [
      {
        property: 'Team',
        relation: {
          contains: teamId,
        },
      },
      {
        property: 'Done',
        checkbox: {
          equals: false,
        },
      },
    ],
  };
}

/**
 * Build a filter for querying meetings by team
 */
export function buildTeamMeetingsFilter(teamId: string): TeamMeetingsFilter {
  return {
    property: 'Team',
    relation: {
      contains: teamId,
    },
  };
}

// =============================================================================
// CREATE/UPDATE HELPERS
// =============================================================================

/**
 * Schema for creating a new team page (minimal required properties)
 * Note: Teams are typically not created via MCP; they are managed manually.
 * This schema is provided for completeness.
 */
export const CreateTeamInput = z.object({
  teamName: TeamName,
});
export type CreateTeamInput = z.infer<typeof CreateTeamInput>;

type CreateTeamProperties = {
  'Team name': {
    title: Array<{
      text: {
        content: TeamName;
      };
    }>;
  };
};

/**
 * Build properties object for creating a team page
 */
export function buildCreateTeamProperties(input: CreateTeamInput): CreateTeamProperties {
  return {
    'Team name': {
      title: [
        {
          text: {
            content: input.teamName,
          },
        },
      ],
    },
  };
}

// =============================================================================
// VALIDATION HELPERS
// =============================================================================

/**
 * Validate a team ID is valid
 */
export function isValidTeamId(teamId: string): boolean {
  return Object.values(TeamIds).includes(teamId as (typeof TeamIds)[keyof typeof TeamIds]);
}

/**
 * Validate a team name is valid
 */
export function isValidTeamName(name: string): name is TeamName {
  return TeamName.safeParse(name).success;
}

/**
 * Validate a domain code is valid
 */
export function isValidDomain(domain: string): domain is Domain {
  return Domain.safeParse(domain).success;
}
