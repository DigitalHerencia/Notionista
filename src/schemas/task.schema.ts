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
 * Task schema
 *
 * Represents a task in the Digital Herencia workspace
 */
export const TaskSchema = z.object({
  id: notionId,
  name: z.string(),
  done: z.boolean(),
  taskCode: z.string().optional(),
  due: isoDate.nullable(),
  priority: z.enum(['High', 'Medium', 'Low']).nullable(),
  projectId: notionId.optional(),
  teamId: notionId.optional(),
});

export type Task = z.infer<typeof TaskSchema>;
