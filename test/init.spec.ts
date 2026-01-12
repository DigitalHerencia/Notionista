import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ExtensionContext } from 'vscode';

// We'll mock vscode APIs to capture registered commands and simulate user interaction
const registeredCommands: Record<string, (...args: unknown[]) => unknown> = {};

vi.mock('vscode', () => ({
  commands: {
    registerCommand: (name: string, handler: (...args: unknown[]) => unknown) => {
      registeredCommands[name] = handler;
      return { dispose: () => {} };
    },
    executeCommand: vi.fn(async (name: string, ...args: unknown[]) => {
      if (registeredCommands[name]) return registeredCommands[name](...args);
    }),
    getCommands: async () => ['mcp.run'],
  },
  window: {
    createOutputChannel: () => ({ appendLine: vi.fn() }),
    showWarningMessage: vi.fn(),
    showErrorMessage: vi.fn(),
    showInformationMessage: vi.fn(),
    withProgress: async (
      opts: unknown,
      cb: (progress: { report: (p: unknown) => void }) => Promise<unknown>
    ) => cb({ report: () => {} }),
  },
  ProgressLocation: { Notification: 1 },
  workspace: {
    getConfiguration: () => ({
      get: () => false,
      has: () => false,
      inspect: () => undefined,
      update: () => Promise.resolve(),
    }),
  },
  ViewColumn: { One: 1 },
}));

// Mock NotionManager to observe validateRegistry and bootstrapCanonicalSchema calls
const mockValidate = vi.fn(async () => ({ missing: ['Projects'], updated: [] }));
const mockBootstrap = vi.fn(async () => ({ created: ['Projects'], failed: [] }));

vi.mock('../src/notion/manager', () => {
  // Provide a real function as the default export so module consumers
  // can `new` it or call it as a factory. Return an object wired to our
  // spies for validate/bootstrap.
  return {
    __esModule: true,
    default: function MockNotionManager(this: unknown) {
      return {
        validateRegistry: mockValidate,
        bootstrapCanonicalSchema: mockBootstrap,
      };
    },
  } as unknown;
});

import * as extension from '../src/extension';

describe('notionista.init onboarding', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    for (const _k of Object.keys(registeredCommands)) delete registeredCommands[_k];
  });

  it('dry-run only when allowWrites=false', async () => {
    // workspace.getConfiguration default returns false as mocked
    extension.activate({
      subscriptions: [],
      extensionUri: { fsPath: '' },
    } as unknown as ExtensionContext);
    // invoke init
    await registeredCommands['notionista.init']();
    expect(mockValidate).toHaveBeenCalled();
    expect(mockBootstrap).not.toHaveBeenCalled();
  });

  it('asks for confirmation when allowWrites=true and autoApply=false', async () => {
    const vscode = await import('vscode');
    vscode.workspace.getConfiguration = () => ({
      get: (_k: string) => (_k === 'allowWrites' ? true : false),
      has: (_k: string) => (_k === 'allowWrites' ? true : false),
      inspect: <T>(_k: string) => ({
        key: _k,
        defaultValue: _k === 'allowWrites' ? (true as unknown as T) : (false as unknown as T),
      }),
      update: (_: string, _v: unknown) => {
        void _v;
        return Promise.resolve();
      },
    });
    // Simulate user clicking 'Create'
    vscode.window.showWarningMessage = vi.fn(async () => 'Create');

    extension.activate({
      subscriptions: [],
      extensionUri: { fsPath: '' },
    } as unknown as ExtensionContext);
    await registeredCommands['notionista.init']();
    expect(mockValidate).toHaveBeenCalled();
    expect(mockBootstrap).toHaveBeenCalled();
  });

  it('auto-applies when allowWrites=true and autoApplyWrites=true', async () => {
    const vscode = await import('vscode');
    // Return a sensible mcpCommand while enabling allowWrites/autoApplyWrites
    vscode.workspace.getConfiguration = () => ({
      get: (_k: string) => (_k === 'mcpCommand' ? 'mcp.run' : true),

      has: () => false,
      inspect: <T>(_k: string) => ({
        key: _k,
        defaultValue:
          _k === 'allowWrites' || _k === 'autoApplyWrites'
            ? (true as unknown as T)
            : (false as unknown as T),
      }),
      update: (_: string, _v: unknown) => {
        void _v;
        return Promise.resolve();
      },
    });
    extension.activate({
      subscriptions: [],
      extensionUri: { fsPath: '' },
    } as unknown as ExtensionContext);
    await registeredCommands['notionista.init']();
    expect(mockValidate).toHaveBeenCalled();
    expect(mockBootstrap).toHaveBeenCalled();
  });
});
