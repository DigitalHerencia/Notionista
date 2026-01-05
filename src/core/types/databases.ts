/**
 * Database ID constants for Digital Herencia Notion workspace
 *
 * @module core/types/databases
 */

/**
 * All database IDs in the Digital Herencia Notion workspace
 */
export const DATABASE_IDS = {
  TEAMS: '2d5a4e63-bf23-8151-9b98-c81833668844',
  PROJECTS: '2d5a4e63-bf23-81b1-b507-f5ac308958e6',
  TASKS: '2d5a4e63-bf23-816f-a217-ef754ce4a70e',
  MEETINGS: '2d5a4e63-bf23-8168-af99-d85e20bfb76f',
  PROMPTS: '2d5a4e63-bf23-81fa-9ca8-f6368bcda19a',
  TECH_STACK: '276a4e63-bf23-80e2-bbae-000b2fa9662a',
  TEMPLATES: '2d5a4e63-bf23-8162-8db4-fcce1bbe3471',
  SOPS: '2d8a4e63-bf23-801e-b6ac-e52358ee91dc',
  CALENDAR: '2d5a4e63-bf23-8130-acc7-f5ee01d15f22',
} as const;

/**
 * Type representing any valid database ID
 */
export type DatabaseId = (typeof DATABASE_IDS)[keyof typeof DATABASE_IDS];

/**
 * Project status options
 */
export const PROJECT_STATUS = ['Active', 'Completed', 'On Hold', 'Cancelled'] as const;
export type ProjectStatus = (typeof PROJECT_STATUS)[number];

/**
 * Milestone options
 */
export const MILESTONE = ['M1', 'M2', 'M3'] as const;
export type Milestone = (typeof MILESTONE)[number];

/**
 * Phase options
 */
export const PHASE = [
  'P1.1',
  'P1.2',
  'P1.3',
  'P2.1',
  'P2.2',
  'P2.3',
  'P3.1',
  'P3.2',
  'P3.3',
] as const;
export type Phase = (typeof PHASE)[number];

/**
 * Domain options
 */
export const DOMAIN = ['OPS', 'PROD', 'DES', 'ENG', 'MKT', 'RES'] as const;
export type Domain = (typeof DOMAIN)[number];

/**
 * Priority options
 */
export const PRIORITY = ['High', 'Medium', 'Low'] as const;
export type Priority = (typeof PRIORITY)[number];

/**
 * Meeting type options
 */
export const MEETING_TYPE = [
  'Standup',
  'Sprint Planning',
  'Post-mortem',
  'Team Sync',
  'Ad Hoc',
] as const;
export type MeetingType = (typeof MEETING_TYPE)[number];

/**
 * Meeting cadence options
 */
export const CADENCE = ['Daily', 'Weekly', 'Biweekly', 'Monthly', 'Ad Hoc'] as const;
export type Cadence = (typeof CADENCE)[number];
