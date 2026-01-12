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
import fs from 'fs';
import path from 'path';

function loadRegistrySync() {
  try {
    const p = path.resolve(__dirname, '..', 'config', 'databases.json');
    const raw = fs.readFileSync(p, 'utf8');
    const parsed = JSON.parse(raw);
    return parsed?.databases ?? {};
  } catch {
    return {};
  }
}

const _REG = loadRegistrySync();

// Consolidated database IDs (single source of truth)
export const DatabaseIds = {
  meetings: _REG.meetings?.id ?? '{{registry.databases.meetings.id}}',
  portfolio: _REG.portfolio?.id ?? '{{registry.databases.portfolio.id}}',
  projects: _REG.projects?.id ?? '{{registry.databases.projects.id}}',
  tasks: _REG.tasks?.id ?? '{{registry.databases.tasks.id}}',
  teams: _REG.teams?.id ?? '{{registry.databases.teams.id}}',
} as const;

// Consolidated team IDs (single source of truth)
export const TeamIds = {
  Product:
    _REG.teamDatabases?.product?.id ??
    _REG.teams?.product?.id ??
    '{{registry.teamDatabases.product.id}}',
  Marketing:
    _REG.teamDatabases?.marketing?.id ??
    _REG.teams?.marketing?.id ??
    '{{registry.teamDatabases.marketing.id}}',
  Research:
    _REG.teamDatabases?.research?.id ??
    _REG.teams?.research?.id ??
    '{{registry.teamDatabases.research.id}}',
  Operations:
    _REG.teamDatabases?.operations?.id ??
    _REG.teams?.operations?.id ??
    '{{registry.teamDatabases.operations.id}}',
  Design:
    _REG.teamDatabases?.design?.id ??
    _REG.teams?.design?.id ??
    '{{registry.teamDatabases.design.id}}',
  Engineering:
    _REG.teamDatabases?.engineering?.id ??
    _REG.teams?.engineering?.id ??
    '{{registry.teamDatabases.engineering.id}}',
} as const;
