/**
 * Project Database Schemas for Digital Herencia Notion Workspace
 *
 * These Zod schemas model the Projects database structure, status workflow,
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
 * Project status options (uses Notion's status property with groups)
 */
export const ProjectStatus = z.enum(['Backlog', 'Ready', 'In progress', 'Review', 'Done']);
export type ProjectStatus = z.infer<typeof ProjectStatus>;

/**
 * Status groups for workflow management
 */
export const ProjectStatusGroup = z.enum(['To-do', 'In progress', 'Complete']);
export type ProjectStatusGroup = z.infer<typeof ProjectStatusGroup>;

/**
 * Project milestones (major product increments)
 */
export const ProjectMilestone = z.enum(['M1', 'M2', 'M3']);
export type ProjectMilestone = z.infer<typeof ProjectMilestone>;

/**
 * Project phases (sub-phases within milestones)
 */
export const ProjectPhase = z.enum([
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
export type ProjectPhase = z.infer<typeof ProjectPhase>;

/**
 * Project domains (maps to teams)
 */
export const ProjectDomain = z.enum(['OPS', 'PROD', 'DES', 'ENG', 'MKT', 'RES']);
export type ProjectDomain = z.infer<typeof ProjectDomain>;

// =============================================================================
// OPTION ID MAPPINGS
// =============================================================================

/**
 * Status to option ID mapping (for MCP operations)
 */
export const ProjectStatusOptionIds = {
  Backlog:
    _REG.optionIds?.projects?.status?.Backlog ?? '{{registry.optionIds.projects.status.Backlog}}',
  Ready: _REG.optionIds?.projects?.status?.Ready ?? '{{registry.optionIds.projects.status.Ready}}',
  'In progress':
    _REG.optionIds?.projects?.status?.['In progress'] ??
    '{{registry.optionIds.projects.status.In progress}}',
  Review:
    _REG.optionIds?.projects?.status?.Review ?? '{{registry.optionIds.projects.status.Review}}',
  Done: _REG.optionIds?.projects?.status?.Done ?? '{{registry.optionIds.projects.status.Done}}',
} as const;

/**
 * Status group IDs
 */
export const ProjectStatusGroupIds = {
  'To-do': _REG.groupIds?.projects?.['To-do'] ?? '{{registry.groupIds.projects.To-do}}',
  'In progress':
    _REG.groupIds?.projects?.['In progress'] ?? '{{registry.groupIds.projects.In progress}}',
  Complete: _REG.groupIds?.projects?.Complete ?? '{{registry.groupIds.projects.Complete}}',
} as const;

/**
 * Milestone to option ID mapping
 */
export const MilestoneOptionIds = {
  M1: _REG.optionIds?.projects?.milestone?.M1 ?? '{{registry.optionIds.projects.milestone.M1}}',
  M2: _REG.optionIds?.projects?.milestone?.M2 ?? '{{registry.optionIds.projects.milestone.M2}}',
  M3: _REG.optionIds?.projects?.milestone?.M3 ?? '{{registry.optionIds.projects.milestone.M3}}',
} as const;

/**
 * Phase to option ID mapping
 */
export const PhaseOptionIds = {
  'P1.1': _REG.optionIds?.projects?.phase?.['P1.1'] ?? '{{registry.optionIds.projects.phase.P1.1}}',
  'P1.2': _REG.optionIds?.projects?.phase?.['P1.2'] ?? '{{registry.optionIds.projects.phase.P1.2}}',
  'P1.3': _REG.optionIds?.projects?.phase?.['P1.3'] ?? '{{registry.optionIds.projects.phase.P1.3}}',
  'P2.1': _REG.optionIds?.projects?.phase?.['P2.1'] ?? '{{registry.optionIds.projects.phase.P2.1}}',
  'P2.2': _REG.optionIds?.projects?.phase?.['P2.2'] ?? '{{registry.optionIds.projects.phase.P2.2}}',
  'P2.3': _REG.optionIds?.projects?.phase?.['P2.3'] ?? '{{registry.optionIds.projects.phase.P2.3}}',
  'P3.1': _REG.optionIds?.projects?.phase?.['P3.1'] ?? '{{registry.optionIds.projects.phase.P3.1}}',
  'P3.2': _REG.optionIds?.projects?.phase?.['P3.2'] ?? '{{registry.optionIds.projects.phase.P3.2}}',
  'P3.3': _REG.optionIds?.projects?.phase?.['P3.3'] ?? '{{registry.optionIds.projects.phase.P3.3}}',
} as const;

/**
 * Domain to option ID mapping
 */
export const DomainOptionIds = {
  OPS: _REG.optionIds?.projects?.domain?.OPS ?? '{{registry.optionIds.projects.domain.OPS}}',
  PROD: _REG.optionIds?.projects?.domain?.PROD ?? '{{registry.optionIds.projects.domain.PROD}}',
  DES: _REG.optionIds?.projects?.domain?.DES ?? '{{registry.optionIds.projects.domain.DES}}',
  ENG: _REG.optionIds?.projects?.domain?.ENG ?? '{{registry.optionIds.projects.domain.ENG}}',
  MKT: _REG.optionIds?.projects?.domain?.MKT ?? '{{registry.optionIds.projects.domain.MKT}}',
  RES: _REG.optionIds?.projects?.domain?.RES ?? '{{registry.optionIds.projects.domain.RES}}',
} as const;

/**
 * Domain colors for UI display
 */
export const DomainColors = {
  OPS: 'green',
  PROD: 'blue',
  DES: 'pink',
  ENG: 'gray',
  MKT: 'purple',
  RES: 'yellow',
} as const;

// =============================================================================
// DATABASE IDS
// =============================================================================

/**
 * Notion database identifiers for MCP operations
 */
export const DatabaseIds = {
  projects: _REG.databases?.projects?.id ?? '{{registry.databases.projects.id}}',
  tasks: _REG.databases?.tasks?.id ?? '{{registry.databases.tasks.id}}',
  teams: _REG.databases?.teams?.id ?? '{{registry.databases.teams.id}}',
  meetings: _REG.databases?.meetings?.id ?? '{{registry.databases.meetings.id}}',
} as const;

/**
 * Property IDs for the Projects database
 */
export const ProjectPropertyIds = {
  Name: 'title',
  Status: 'U%60u%3D',
  Milestone: '%3Blbz',
  Phase: 'TX%5Dp',
  Domain: 'jNvx',
  'Work dates': 'f%3B%3D%3C',
  Archive: 'NlVx',
  Team: 'S%5B%3C%5B',
  Tasks: 'FBbf',
  Meetings: 'uS%3ES',
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

/**
 * Domain to Team mapping
 */
export const DomainTeamMapping = {
  OPS: TeamIds.Operations,
  PROD: TeamIds.Product,
  DES: TeamIds.Design,
  ENG: TeamIds.Engineering,
  MKT: TeamIds.Marketing,
  RES: TeamIds.Research,
} as const;

// =============================================================================
// PROJECT PAGE SCHEMA
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
 * Date range schema for Work dates property
 */
export const DateRange = z.object({
  start: z.string(), // YYYY-MM-DD
  end: z.string().nullable().optional(),
  time_zone: z.string().nullable().optional(),
});
export type DateRange = z.infer<typeof DateRange>;

/**
 * Project page properties from Notion API
 */
export const ProjectPageProperties = z.object({
  Name: z.object({
    id: z.literal('title'),
    type: z.literal('title'),
    title: z.array(RichText),
  }),
  Status: z.object({
    id: z.string(),
    type: z.literal('status'),
    status: z
      .object({
        id: z.string(),
        name: ProjectStatus,
        color: z.string(),
      })
      .nullable(),
  }),
  Milestone: z.object({
    id: z.string(),
    type: z.literal('select'),
    select: z
      .object({
        id: z.string(),
        name: ProjectMilestone,
        color: z.string(),
      })
      .nullable(),
  }),
  Phase: z.object({
    id: z.string(),
    type: z.literal('select'),
    select: z
      .object({
        id: z.string(),
        name: ProjectPhase,
        color: z.string(),
      })
      .nullable(),
  }),
  Domain: z.object({
    id: z.string(),
    type: z.literal('select'),
    select: z
      .object({
        id: z.string(),
        name: ProjectDomain,
        color: z.string(),
      })
      .nullable(),
  }),
  'Work dates': z.object({
    id: z.string(),
    type: z.literal('date'),
    date: DateRange.nullable(),
  }),
  Archive: z.object({
    id: z.string(),
    type: z.literal('checkbox'),
    checkbox: z.boolean(),
  }),
  Team: z.object({
    id: z.string(),
    type: z.literal('relation'),
    relation: z.array(RelationItem),
    has_more: z.boolean(),
  }),
  Tasks: z.object({
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
export type ProjectPageProperties = z.infer<typeof ProjectPageProperties>;

/**
 * Full project page schema from Notion API
 */
export const ProjectPage = z.object({
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
  properties: ProjectPageProperties,
  url: z.string().url(),
  public_url: z.string().url().nullable(),
});
export type ProjectPage = z.infer<typeof ProjectPage>;

// =============================================================================
// PROJECT CODE PARSING
// =============================================================================

/**
 * Parsed project code components
 */
export const ProjectCodeComponents = z.object({
  domain: ProjectDomain,
  milestone: ProjectMilestone,
  phase: ProjectPhase,
  code: z.string(),
  description: z.string(),
});
export type ProjectCodeComponents = z.infer<typeof ProjectCodeComponents>;

/**
 * Parse a project name into its components
 * Format: {DOMAIN}-M{n}-P{n}.{n}-{CODE} – {Description}
 */
export function parseProjectCode(name: string): ProjectCodeComponents | null {
  const pattern = /^([A-Z]{2,4})-M(\d)-P(\d)\.(\d)-([A-Z0-9&]+)\s*[–-]\s*(.+)$/;
  const match = name.trim().match(pattern);

  if (!match) {
    return null;
  }

  const [, domain, milestone, phaseMain, phaseSub, code, description] = match;

  if (!domain || !milestone || !phaseMain || !phaseSub || !code || !description) {
    return null;
  }

  const domainResult = ProjectDomain.safeParse(domain);
  const milestoneResult = ProjectMilestone.safeParse(`M${milestone}`);
  const phaseResult = ProjectPhase.safeParse(`P${phaseMain}.${phaseSub}`);

  if (!domainResult.success || !milestoneResult.success || !phaseResult.success) {
    return null;
  }

  return {
    domain: domainResult.data,
    milestone: milestoneResult.data,
    phase: phaseResult.data,
    code,
    description: description.trim(),
  };
}

/**
 * Generate a project name from components
 */
export function generateProjectName(components: ProjectCodeComponents): string {
  return `${components.domain}-${components.milestone}-${components.phase}-${components.code} – ${components.description}`;
}

// =============================================================================
// MCP OPERATION HELPERS
// =============================================================================

/**
 * Create project request body for MCP post-page
 */
export const CreateProjectRequest = z.object({
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
    Status: z
      .object({
        status: z.object({
          name: ProjectStatus,
        }),
      })
      .optional(),
    Milestone: z
      .object({
        select: z.object({
          name: ProjectMilestone,
        }),
      })
      .optional(),
    Phase: z
      .object({
        select: z.object({
          name: ProjectPhase,
        }),
      })
      .optional(),
    Domain: z
      .object({
        select: z.object({
          name: ProjectDomain,
        }),
      })
      .optional(),
    'Work dates': z
      .object({
        date: DateRange,
      })
      .optional(),
    Team: z
      .object({
        relation: z.array(z.object({ id: z.string().uuid() })),
      })
      .optional(),
  }),
});
export type CreateProjectRequest = z.infer<typeof CreateProjectRequest>;

/**
 * Update project request body for MCP patch-page
 */
export const UpdateProjectRequest = z.object({
  properties: z.object({
    Status: z
      .object({
        status: z.object({
          name: ProjectStatus,
        }),
      })
      .optional(),
    Milestone: z
      .object({
        select: z.object({
          name: ProjectMilestone,
        }),
      })
      .optional(),
    Phase: z
      .object({
        select: z.object({
          name: ProjectPhase,
        }),
      })
      .optional(),
    'Work dates': z
      .object({
        date: DateRange,
      })
      .optional(),
    Archive: z
      .object({
        checkbox: z.boolean(),
      })
      .optional(),
  }),
});
export type UpdateProjectRequest = z.infer<typeof UpdateProjectRequest>;

/**
 * Query filter for projects by status
 */
export const ProjectStatusFilter = z.object({
  filter: z.object({
    property: z.literal('Status'),
    status: z.object({
      equals: ProjectStatus,
    }),
  }),
});
export type ProjectStatusFilter = z.infer<typeof ProjectStatusFilter>;

/**
 * Query filter for projects by team
 */
export const ProjectTeamFilter = z.object({
  filter: z.object({
    property: z.literal('Team'),
    relation: z.object({
      contains: z.string().uuid(),
    }),
  }),
});
export type ProjectTeamFilter = z.infer<typeof ProjectTeamFilter>;

/**
 * Query filter for projects by domain
 */
export const ProjectDomainFilter = z.object({
  filter: z.object({
    property: z.literal('Domain'),
    select: z.object({
      equals: ProjectDomain,
    }),
  }),
});
export type ProjectDomainFilter = z.infer<typeof ProjectDomainFilter>;

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Get team ID for a given domain
 */
export function getTeamIdForDomain(domain: ProjectDomain): string {
  return DomainTeamMapping[domain];
}

/**
 * Get the next phase in sequence
 */
export function getNextPhase(currentPhase: ProjectPhase): ProjectPhase | null {
  const phases: ProjectPhase[] = [
    'P1.1',
    'P1.2',
    'P1.3',
    'P2.1',
    'P2.2',
    'P2.3',
    'P3.1',
    'P3.2',
    'P3.3',
  ];
  const currentIndex = phases.indexOf(currentPhase);
  if (currentIndex === -1 || currentIndex === phases.length - 1) {
    return null;
  }
  return phases[currentIndex + 1] ?? null;
}

/**
 * Get the next milestone in sequence
 */
export function getNextMilestone(currentMilestone: ProjectMilestone): ProjectMilestone | null {
  const milestones: ProjectMilestone[] = ['M1', 'M2', 'M3'];
  const currentIndex = milestones.indexOf(currentMilestone);
  if (currentIndex === -1 || currentIndex === milestones.length - 1) {
    return null;
  }
  return milestones[currentIndex + 1] ?? null;
}

/**
 * Get status group for a given status
 */
export function getStatusGroup(status: ProjectStatus): ProjectStatusGroup {
  switch (status) {
    case 'Backlog':
    case 'Ready':
      return 'To-do';
    case 'In progress':
    case 'Review':
      return 'In progress';
    case 'Done':
      return 'Complete';
  }
}

/**
 * Calculate sprint dates (2-week window)
 */
export function calculateSprintDates(startDate: Date): DateRange {
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 13); // 2 weeks - 1 day

  const startStr = startDate.toISOString().split('T')[0];
  const endStr = endDate.toISOString().split('T')[0];

  return {
    start: startStr ?? '',
    end: endStr ?? '',
  };
}

/**
 * Extract plain text from title array
 */
export function extractProjectTitle(titleArray: RichText[]): string {
  return titleArray.map((t) => t.plain_text).join('');
}
