import { z } from 'zod';

/**
 * Notion ID schema (UUID format)
 */
const notionId = z.string();

/**
 * Team schema
 *
 * Represents a team in the Digital Herencia workspace
 */
export const TeamSchema = z.object({
  id: notionId,
  name: z.string(),
  meetings: z.array(notionId).default([]),
  projects: z.array(notionId).default([]),
  projectsComplete: z.number().optional(),
  tasks: z.array(notionId).default([]),
  tasksCompleted: z.number().optional(),
});

export type Team = z.infer<typeof TeamSchema>;
