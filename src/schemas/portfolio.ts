/**
 * Portfolio Database Schemas for Digital Herencia Notion Workspace
 *
 * The Portfolio database stores work artifacts generated from completed tasks.
 * Each portfolio item is named after the task and links to the originating
 * task, meeting, team, and project for full traceability.
 *
 * @description Work artifacts generated from completed tasks, named after
 * software being developed with the task name as the page title.
 */

import { z } from 'zod';

// =============================================================================
// DATABASE IDS
// =============================================================================

/**
 * Notion database identifiers for MCP operations
 */
export const DatabaseIds = {
  portfolio: '2e2a4e63-bf23-8057-bdc5-000b7407965e',
  tasks: '2d5a4e63-bf23-8137-8277-000b41c867c3',
  meetings: '2caa4e63-bf23-815a-8981-000bbdbb7f0b',
  teams: '2d5a4e63-bf23-816b-9f75-000b219f7713',
  projects: '2d5a4e63-bf23-8115-a70f-000bc1ef9d05',
} as const;

/**
 * Property IDs for the Portfolio database (URL-encoded)
 */
export const PortfolioPropertyIds = {
  Name: 'title',
  Tasks: 'UjCt',
  Meetings: 'ZpMt',
  Teams: 'fsXi',
  Projects: '%7BbbP',
} as const;

/**
 * Property IDs for the Portfolio database (decoded)
 */
export const PortfolioPropertyIdsDecoded = {
  Name: 'title',
  Tasks: 'UjCt',
  Meetings: 'ZpMt',
  Teams: 'fsXi',
  Projects: '{bbP',
} as const;

// =============================================================================
// RICH TEXT SCHEMA
// =============================================================================

/**
 * Rich text element from Notion API
 */
export const RichText = z.object({
  type: z.literal('text'),
  text: z.object({
    content: z.string(),
    link: z.object({ url: z.string() }).nullable(),
  }),
  annotations: z.object({
    bold: z.boolean(),
    italic: z.boolean(),
    strikethrough: z.boolean(),
    underline: z.boolean(),
    code: z.boolean(),
    color: z.string(),
  }),
  plain_text: z.string(),
  href: z.string().nullable(),
});
export type RichText = z.infer<typeof RichText>;

// =============================================================================
// RELATION SCHEMA
// =============================================================================

/**
 * Relation item from Notion API
 */
export const RelationItem = z.object({
  id: z.string().uuid(),
});
export type RelationItem = z.infer<typeof RelationItem>;

/**
 * Relation property from Notion API
 */
export const RelationProperty = z.object({
  id: z.string(),
  type: z.literal('relation'),
  relation: z.array(RelationItem),
  has_more: z.boolean().optional(),
});
export type RelationProperty = z.infer<typeof RelationProperty>;

// =============================================================================
// PORTFOLIO PROPERTY SCHEMAS
// =============================================================================

/**
 * Portfolio Name (title) property
 */
export const NameProperty = z.object({
  id: z.literal('title'),
  type: z.literal('title'),
  title: z.array(RichText),
});
export type NameProperty = z.infer<typeof NameProperty>;

/**
 * Tasks relation property
 */
export const TasksProperty = RelationProperty.extend({
  id: z.literal('UjCt'),
});
export type TasksProperty = z.infer<typeof TasksProperty>;

/**
 * Meetings relation property
 */
export const MeetingsProperty = RelationProperty.extend({
  id: z.literal('ZpMt'),
});
export type MeetingsProperty = z.infer<typeof MeetingsProperty>;

/**
 * Teams relation property
 */
export const TeamsProperty = RelationProperty.extend({
  id: z.literal('fsXi'),
});
export type TeamsProperty = z.infer<typeof TeamsProperty>;

/**
 * Projects relation property
 */
export const ProjectsProperty = RelationProperty.extend({
  id: z.literal('%7BbbP').or(z.literal('{bbP')),
});
export type ProjectsProperty = z.infer<typeof ProjectsProperty>;

// =============================================================================
// PORTFOLIO PAGE SCHEMA
// =============================================================================

/**
 * Complete Portfolio page properties object
 */
export const PortfolioProperties = z.object({
  Name: NameProperty,
  Tasks: TasksProperty,
  Meetings: MeetingsProperty,
  Teams: TeamsProperty,
  Projects: ProjectsProperty,
});
export type PortfolioProperties = z.infer<typeof PortfolioProperties>;

/**
 * Portfolio page as returned from Notion API
 */
export const PortfolioPage = z.object({
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
  properties: PortfolioProperties,
  url: z.string().url(),
  public_url: z.string().url().nullable(),
});
export type PortfolioPage = z.infer<typeof PortfolioPage>;

// =============================================================================
// QUERY RESPONSE SCHEMA
// =============================================================================

/**
 * Query response for portfolio database
 */
export const PortfolioQueryResponse = z.object({
  object: z.literal('list'),
  results: z.array(PortfolioPage),
  next_cursor: z.string().nullable(),
  has_more: z.boolean(),
  type: z.literal('page_or_data_source'),
  page_or_data_source: z.object({}),
  request_id: z.string().uuid(),
});
export type PortfolioQueryResponse = z.infer<typeof PortfolioQueryResponse>;

// =============================================================================
// CREATE/UPDATE PAYLOAD SCHEMAS
// =============================================================================

/**
 * Payload for creating a new Portfolio page
 */
export const CreatePortfolioPayload = z.object({
  parent: z.object({
    database_id: z.literal(DatabaseIds.portfolio),
  }),
  properties: z.object({
    Name: z.object({
      title: z.array(
        z.object({
          text: z.object({
            content: z.string().min(1),
          }),
        })
      ),
    }),
    Tasks: z.object({
      relation: z.array(z.object({ id: z.string().uuid() })),
    }),
    Meetings: z
      .object({
        relation: z.array(z.object({ id: z.string().uuid() })),
      })
      .optional(),
    Teams: z
      .object({
        relation: z.array(z.object({ id: z.string().uuid() })),
      })
      .optional(),
    Projects: z
      .object({
        relation: z.array(z.object({ id: z.string().uuid() })),
      })
      .optional(),
  }),
});
export type CreatePortfolioPayload = z.infer<typeof CreatePortfolioPayload>;

/**
 * Payload for updating an existing Portfolio page
 */
export const UpdatePortfolioPayload = z.object({
  page_id: z.string().uuid(),
  properties: z.object({
    Name: z
      .object({
        title: z.array(
          z.object({
            text: z.object({
              content: z.string().min(1),
            }),
          })
        ),
      })
      .optional(),
    Tasks: z
      .object({
        relation: z.array(z.object({ id: z.string().uuid() })),
      })
      .optional(),
    Meetings: z
      .object({
        relation: z.array(z.object({ id: z.string().uuid() })),
      })
      .optional(),
    Teams: z
      .object({
        relation: z.array(z.object({ id: z.string().uuid() })),
      })
      .optional(),
    Projects: z
      .object({
        relation: z.array(z.object({ id: z.string().uuid() })),
      })
      .optional(),
  }),
});
export type UpdatePortfolioPayload = z.infer<typeof UpdatePortfolioPayload>;

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Extract plain text name from Portfolio page
 */
export function getPortfolioName(page: PortfolioPage): string {
  return page.properties.Name.title.map((t) => t.plain_text).join('');
}

/**
 * Get task IDs from Portfolio page
 */
export function getTaskIds(page: PortfolioPage): string[] {
  return page.properties.Tasks.relation.map((r) => r.id);
}

/**
 * Get meeting IDs from Portfolio page
 */
export function getMeetingIds(page: PortfolioPage): string[] {
  return page.properties.Meetings.relation.map((r) => r.id);
}

/**
 * Get team IDs from Portfolio page
 */
export function getTeamIds(page: PortfolioPage): string[] {
  return page.properties.Teams.relation.map((r) => r.id);
}

/**
 * Get project IDs from Portfolio page
 */
export function getProjectIds(page: PortfolioPage): string[] {
  return page.properties.Projects.relation.map((r) => r.id);
}

/**
 * Build a create payload for a new Portfolio page
 */
export function buildCreatePayload(
  name: string,
  taskId: string,
  options?: {
    meetingId?: string;
    teamId?: string;
    projectId?: string;
  }
): CreatePortfolioPayload {
  const payload: CreatePortfolioPayload = {
    parent: {
      database_id: DatabaseIds.portfolio,
    },
    properties: {
      Name: {
        title: [{ text: { content: name } }],
      },
      Tasks: {
        relation: [{ id: taskId }],
      },
    },
  };

  if (options?.meetingId) {
    payload.properties.Meetings = {
      relation: [{ id: options.meetingId }],
    };
  }

  if (options?.teamId) {
    payload.properties.Teams = {
      relation: [{ id: options.teamId }],
    };
  }

  if (options?.projectId) {
    payload.properties.Projects = {
      relation: [{ id: options.projectId }],
    };
  }

  return payload;
}
