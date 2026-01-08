/**
 * Digital Herencia Notion Database Schemas
 *
 * This module exports all Zod schemas for type-safe MCP operations
 * against the Notion databases in the Digital Herencia workspace.
 */

// Namespaced exports to avoid naming conflicts
export * as Meetings from './meetings';
export * as Portfolio from './portfolio';
export * as Projects from './projects';
export * as Tasks from './tasks';
export * as Teams from './teams';

// Re-export shared types explicitly
export { RichText } from './meetings';

// Consolidated database IDs (single source of truth)
export const DatabaseIds = {
  meetings: '2caa4e63-bf23-815a-8981-000bbdbb7f0b',
  portfolio: '2e2a4e63-bf23-8057-bdc5-000b7407965e',
  projects: '2d5a4e63-bf23-8115-a70f-000bc1ef9d05',
  tasks: '2d5a4e63-bf23-8137-8277-000b41c867c3',
  teams: '2d5a4e63-bf23-816b-9f75-000b219f7713',
} as const;

// Consolidated team IDs (single source of truth)
export const TeamIds = {
  Product: '2d5a4e63-bf23-818d-a26b-c86434571d4a',
  Marketing: '2d5a4e63-bf23-80fd-bf70-f6d679ba0d14',
  Research: '2d5a4e63-bf23-8081-9ff6-e8ecf118aee6',
  Operations: '2d5a4e63-bf23-808e-96c6-e13df82c008b',
  Design: '2d5a4e63-bf23-8097-bffe-dd7bde5a3f69',
  Engineering: '2d5a4e63-bf23-8034-a68a-f4e24b342def',
} as const;
