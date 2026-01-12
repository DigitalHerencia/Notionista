import fs from 'fs/promises';
import path from 'path';

export type PropertySpec = {
  type: string;
  required?: boolean;
  computed?: boolean;
  options?: string[];
  target?: string;
};

export type DatabaseSpec = {
  id: string | null;
  name: string;
  url: string | null;
  description?: string;
  properties?: Record<string, PropertySpec>;
};

export type Registry = {
  databases: Record<string, DatabaseSpec>;
  teamDatabases?: Record<string, unknown>;
  publicDatabases?: Record<string, unknown>;
  safetyLimits?: Record<string, unknown>;
  mcp?: Record<string, unknown>;
};

const CONFIG_PATH = path.resolve(__dirname, '..', '..', 'config', 'databases.json');

export async function loadRegistry(): Promise<Registry> {
  try {
    const raw = await fs.readFile(CONFIG_PATH, 'utf8');
    return JSON.parse(raw) as Registry;
  } catch (err) {
    // If file missing or invalid, throw with guidance
    throw new Error(`Unable to load registry at ${CONFIG_PATH}: ${String(err)}`);
  }
}

export async function saveRegistry(reg: Registry): Promise<void> {
  const raw = JSON.stringify(reg, null, 2);
  await fs.writeFile(CONFIG_PATH, raw, 'utf8');
}

export async function getDatabaseSpec(name: string): Promise<DatabaseSpec | null> {
  const reg = await loadRegistry();
  return reg.databases?.[name] ?? null;
}

export async function setDatabaseSpec(name: string, spec: Partial<DatabaseSpec>): Promise<void> {
  const reg = await loadRegistry();
  reg.databases = reg.databases || {};
  const current = reg.databases[name] || { id: null, name, url: null };
  reg.databases[name] = { ...current, ...spec } as DatabaseSpec;
  await saveRegistry(reg);
}

export async function listMissingDatabases(): Promise<string[]> {
  const reg = await loadRegistry();
  return Object.entries(reg.databases || {})
    .filter(([, spec]) => !spec.id)
    .map(([name]) => name);
}

export default {
  loadRegistry,
  saveRegistry,
  getDatabaseSpec,
  setDatabaseSpec,
  listMissingDatabases,
};
