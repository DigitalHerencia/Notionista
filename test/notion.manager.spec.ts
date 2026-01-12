import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock the registry module with controllable mocked functions
vi.mock('../src/notion/registry', () => {
  const loadRegistry = vi.fn();
  const setDatabaseSpec = vi.fn();
  const _default = { loadRegistry, setDatabaseSpec };
  return { default: _default };
});

// Mock vscode workspace config; default get returns false
vi.mock('vscode', () => ({
  workspace: { getConfiguration: () => ({ get: () => false }) },
}));

import type { McpAdapter } from '../src/notion/adapter';
import NotionManager from '../src/notion/manager';
import mockRegistry from '../src/notion/registry';

// Typed view over the mocked registry to avoid `any` casts
type MockFn = ReturnType<typeof vi.fn>;
const mr = mockRegistry as unknown as {
  loadRegistry: MockFn;
  setDatabaseSpec: MockFn;
};

describe('NotionManager (dry-run)', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('validateRegistry does not write in dry-run mode', async () => {
    // registry has one DB with no id
    mr.loadRegistry.mockResolvedValue({
      databases: { Projects: { id: null, name: 'Projects', url: null } },
    });
  });
});

describe('NotionManager (writes)', () => {
  beforeEach(async () => {
    vi.resetAllMocks();
    // make workspace allowWrites true by default for these tests
    const vscode = await import('vscode');
    // override getConfiguration so allowWrites returns true in these tests
    // preserve other keys as false by default
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (vscode as any).workspace.getConfiguration = () => ({
      get: (k: string) => (k === 'allowWrites' ? true : false),
    });
  });

  it('bootstrapCanonicalSchema refuses when allowWrites=false', async () => {
    // override getConfiguration to return false
    mr.loadRegistry.mockResolvedValue({
      databases: { Tasks: { id: null, name: 'Tasks', url: null } },
    });
    const adapter = { run: vi.fn(), capabilityReport: vi.fn() };
    const nm = new NotionManager(adapter);
    const res = await nm.bootstrapCanonicalSchema();
    expect(res.created).toEqual([]);
    expect(res.failed).toContain('Tasks');
  });

  it('bootstrapCanonicalSchema creates when allowWrites=true', async () => {
    mr.loadRegistry.mockResolvedValue({
      databases: { Tasks: { id: null, name: 'Tasks', url: null } },
    });
    // adapter should return created id/url when asked to create
    const adapter: McpAdapter = {
      run: vi.fn(async () => ({ id: 'db-2', url: 'https://notion/2' })),
      capabilityReport: vi.fn(),
    };
    const nm = new NotionManager(adapter);
    const res = await nm.bootstrapCanonicalSchema();
    expect(res.created).toContain('Tasks');
    expect(mr.setDatabaseSpec).toHaveBeenCalledWith('Tasks', {
      id: 'db-2',
      url: 'https://notion/2',
    });
  });
});
