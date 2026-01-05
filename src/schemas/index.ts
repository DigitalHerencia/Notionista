import { z } from 'zod';

const notionId = z.string();
const isoDate = z.string(); // ISO 8601

export const TeamSchema = z.object({
  id: notionId,
  name: z.string(),
  meetings: z.array(notionId).default([]),
  projects: z.array(notionId).default([]),
  projectsComplete: z.number().optional(), // rollup/formula
  tasks: z.array(notionId).default([]),
  tasksCompleted: z.number().optional(), // rollup/formula
});
export type Team = z.infer<typeof TeamSchema>;

export const ProjectSchema = z.object({
  id: notionId,
  name: z.string(),
  status: z.enum(['Active', 'Completed', 'On Hold', 'Cancelled']),
  milestone: z.enum(['M1', 'M2', 'M3']).nullable(),
  phase: z
    .enum([
      'P1.1',
      'P1.2',
      'P1.3',
      'P2.1',
      'P2.2',
      'P2.3',
      'P3.1',
      'P3.2',
      'P3.3',
    ])
    .nullable(),
  domain: z.enum(['OPS', 'PROD', 'DES', 'ENG', 'MKT', 'RES']).nullable(),
  startDate: isoDate.nullable(),
  endDate: isoDate.nullable(),
  teamId: notionId.optional(),
  taskIds: z.array(notionId).default([]),
});
export type Project = z.infer<typeof ProjectSchema>;

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

export const MeetingSchema = z.object({
  id: notionId,
  name: z.string(),
  type: z.enum([
    'Standup',
    'Sprint Planning',
    'Post-mortem',
    'Team Sync',
    'Ad Hoc',
  ]),
  cadence: z
    .enum(['Daily', 'Weekly', 'Biweekly', 'Monthly', 'Ad Hoc'])
    .nullable(),
  date: isoDate.nullable(),
  attendeeTeamIds: z.array(notionId).default([]),
  actionItemTaskIds: z.array(notionId).default([]),
  projectIds: z.array(notionId).default([]),
  teamIds: z.array(notionId).default([]),
});
export type Meeting = z.infer<typeof MeetingSchema>;
