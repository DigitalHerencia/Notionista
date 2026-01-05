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
 * Meeting schema
 *
 * Represents a meeting in the Digital Herencia workspace
 */
export const MeetingSchema = z.object({
  id: notionId,
  name: z.string(),
  type: z.enum(['Standup', 'Sprint Planning', 'Post-mortem', 'Team Sync', 'Ad Hoc']),
  cadence: z.enum(['Daily', 'Weekly', 'Biweekly', 'Monthly', 'Ad Hoc']).nullable(),
  date: isoDate.nullable(),
  attendeeTeamIds: z.array(notionId).default([]),
  actionItemTaskIds: z.array(notionId).default([]),
  projectIds: z.array(notionId).default([]),
  teamIds: z.array(notionId).default([]),
});

export type Meeting = z.infer<typeof MeetingSchema>;
