/**
 * Database ID constants from Digital Herencia Notion workspace
 * @see .github/copilot-instructions.md for database structure
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

export type DatabaseId = (typeof DATABASE_IDS)[keyof typeof DATABASE_IDS];

/**
 * Property type enums matching Notion workspace schema
 */
export type ProjectStatus = 'Active' | 'Completed' | 'On Hold' | 'Cancelled';
export type Milestone = 'M1' | 'M2' | 'M3';
export type Phase = 'P1.1' | 'P1.2' | 'P1.3' | 'P2.1' | 'P2.2' | 'P2.3' | 'P3.1' | 'P3.2' | 'P3.3';
export type Domain = 'OPS' | 'PROD' | 'DES' | 'ENG' | 'MKT' | 'RES';
export type Priority = 'High' | 'Medium' | 'Low';
export type MeetingType = 'Standup' | 'Sprint Planning' | 'Post-mortem' | 'Team Sync' | 'Ad Hoc';
export type Cadence = 'Daily' | 'Weekly' | 'Biweekly' | 'Monthly' | 'Ad Hoc';
