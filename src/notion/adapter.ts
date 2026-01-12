import * as vscode from 'vscode';

export type McpAdapter = {
  run: (toolName: string, payload?: unknown) => Promise<unknown>;
  capabilityReport: () => Promise<{ available: boolean; command?: string; details?: string }>;
};

// Default adapter using a configurable command name (fallback: 'mcp.run')
export function createDefaultAdapter(): McpAdapter {
  const defaultCmd = 'mcp.run';

  const run = async (toolName: string, payload?: unknown) => {
    const cfg = vscode.workspace.getConfiguration('notionista');
    const cmd: string = cfg.get('mcpCommand') || defaultCmd;
    // Forward to the configured command. Most MCP bridges accept (toolName, payload)
    // executeCommand returns Thenable<unknown>
    return vscode.commands.executeCommand(cmd, toolName, payload);
  };

  const capabilityReport = async () => {
    const cfg = vscode.workspace.getConfiguration('notionista');
    const cmd: string = cfg.get('mcpCommand') || defaultCmd;
    try {
      const all = await vscode.commands.getCommands(true);
      const available = all.includes(cmd);
      return {
        available,
        command: cmd,
        details: available ? 'Command available in this VS Code host' : 'Command not registered',
      };
    } catch (e) {
      return { available: false, command: cmd, details: String(e) };
    }
  };

  return { run, capabilityReport };
}
