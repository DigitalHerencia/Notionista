import { z } from 'zod';

/**
 * Notion ID schema (UUID format)
 */
const notionId = z.string();

/**
 * ISO 8601 date string schema
 */
const isoDate = z.string();

/**
 * Project schema
 *
 * Represents a project in the Digital Herencia workspace
 */
export const ProjectSchema = z.object({
  id: notionId,
  name: z.string(),
  status: z.enum(['Active', 'Completed', 'On Hold', 'Cancelled']),
  milestone: z.enum(['M1', 'M2', 'M3']).nullable(),
  phase: z
    .enum(['P1.1', 'P1.2', 'P1.3', 'P2.1', 'P2.2', 'P2.3', 'P3.1', 'P3.2', 'P3.3'])
    .nullable(),
  domain: z.enum(['OPS', 'PROD', 'DES', 'ENG', 'MKT', 'RES']).nullable(),
  startDate: isoDate.nullable(),
  endDate: isoDate.nullable(),
  teamId: notionId.optional(),
  taskIds: z.array(notionId).default([]),
});

export type Project = z.infer<typeof ProjectSchema>;
