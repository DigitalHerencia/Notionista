/**
 * Database IDs for the Digital Herencia Notion workspace
 * 
 * These IDs correspond to the core databases in the workspace.
 * Source: .github/copilot-instructions.md
 */

export const DATABASE_IDS = {
  TEAMS: "2d5a4e63-bf23-8151-9b98-c81833668844",
  PROJECTS: "2d5a4e63-bf23-81b1-b507-f5ac308958e6",
  TASKS: "2d5a4e63-bf23-816f-a217-ef754ce4a70e",
  MEETINGS: "2d5a4e63-bf23-8168-af99-d85e20bfb76f",
  PROMPTS: "2d5a4e63-bf23-81fa-9ca8-f6368bcda19a",
  TECH_STACK: "276a4e63-bf23-80e2-bbae-000b2fa9662a",
  TEMPLATES: "2d5a4e63-bf23-8162-8db4-fcce1bbe3471",
  SOPS: "2d8a4e63-bf23-801e-b6ac-e52358ee91dc",
  CALENDAR: "2d5a4e63-bf23-8130-acc7-f5ee01d15f22",
} as const;

export type DatabaseId = (typeof DATABASE_IDS)[keyof typeof DATABASE_IDS];

/**
 * Property type enums matching Notion workspace schema
 */

export const ProjectStatus = {
  ACTIVE: "Active",
  COMPLETED: "Completed",
  ON_HOLD: "On Hold",
  CANCELLED: "Cancelled",
} as const;

export type ProjectStatus = (typeof ProjectStatus)[keyof typeof ProjectStatus];

export const Milestone = {
  M1: "M1",
  M2: "M2",
  M3: "M3",
} as const;

export type Milestone = (typeof Milestone)[keyof typeof Milestone];

export const Phase = {
  P1_1: "P1.1",
  P1_2: "P1.2",
  P1_3: "P1.3",
  P2_1: "P2.1",
  P2_2: "P2.2",
  P2_3: "P2.3",
  P3_1: "P3.1",
  P3_2: "P3.2",
  P3_3: "P3.3",
} as const;

export type Phase = (typeof Phase)[keyof typeof Phase];

export const Domain = {
  OPS: "OPS",
  PROD: "PROD",
  DES: "DES",
  ENG: "ENG",
  MKT: "MKT",
  RES: "RES",
} as const;

export type Domain = (typeof Domain)[keyof typeof Domain];

export const Priority = {
  HIGH: "High",
  MEDIUM: "Medium",
  LOW: "Low",
} as const;

export type Priority = (typeof Priority)[keyof typeof Priority];

export const MeetingType = {
  STANDUP: "Standup",
  SPRINT_PLANNING: "Sprint Planning",
  POST_MORTEM: "Post-mortem",
  TEAM_SYNC: "Team Sync",
  AD_HOC: "Ad Hoc",
} as const;

export type MeetingType = (typeof MeetingType)[keyof typeof MeetingType];

export const Cadence = {
  DAILY: "Daily",
  WEEKLY: "Weekly",
  BIWEEKLY: "Biweekly",
  MONTHLY: "Monthly",
  AD_HOC: "Ad Hoc",
} as const;

export type Cadence = (typeof Cadence)[keyof typeof Cadence];
