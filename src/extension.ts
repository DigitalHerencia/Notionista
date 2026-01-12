import * as vscode from 'vscode';
import ContextProvider from './contextProvider';
import ChatController from './chatController';
import { createDefaultAdapter } from './notion/adapter';
import NotionManager from './notion/manager';

function getNonce() {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 32; i++) text += possible.charAt(Math.floor(Math.random() * possible.length));
  return text;
}

export function activate(context: vscode.ExtensionContext) {
  const logger = (m: string) => console.warn(`[notionista] ${m}`);
  logger('Activating Notionista extension');

  const ctx = new ContextProvider(logger);
  const chat = new ChatController(logger);

  const disposable = vscode.commands.registerCommand('notionista.startChat', async () => {
    const panel = vscode.window.createWebviewPanel(
      'notionista.chat',
      'Notionista Chat',
      vscode.ViewColumn.One,
      {
        enableScripts: true,
        localResourceRoots: [vscode.Uri.joinPath(context.extensionUri, 'media')],
        retainContextWhenHidden: true,
      }
    );

    chat.attachPanel(panel);

    const nonce = getNonce();
    panel.webview.html = getWebviewContent(panel.webview, context.extensionUri, nonce);

    // index workspace and send context
    const files = await ctx.indexWorkspace();
    chat.provideContext(files);

    // initial state
    chat.push({ from: 'system', text: 'Welcome to Notionista chat (local-only).' });

    panel.webview.onDidReceiveMessage(async (message) => {
      if (!message || typeof message !== 'object') return;
      const { type, payload } = message as { type?: string; payload?: unknown };
      logger(`Received message from webview: ${type}`);
      if (type === 'userMessage') {
        chat.push({ from: 'user', text: String(payload) });
        // echo back as assistant for now (placeholder for LLM integration)
        chat.push({ from: 'assistant', text: `Echo: ${String(payload)}` });
      } else if (type === 'requestContext') {
        const files = ctx.getIndexed();
        chat.provideContext(files);
      }
    });

    panel.onDidDispose(() => {
      logger('Chat panel disposed');
    });
  });

  context.subscriptions.push(disposable);

  const output = vscode.window.createOutputChannel('Notionista');
  context.subscriptions.push(output);

  // create adapter and pass to manager for all commands so that the manager
  // never directly assumes a specific VS Code command name.
  const adapter = createDefaultAdapter();

  // Notion validation command - validates registry and reports missing items
  const validateCmd = vscode.commands.registerCommand('notionista.validateNotion', async () => {
    const nm = new NotionManager(adapter);
    const result = await nm.validateRegistry();
    if (result.missing.length === 0) {
      vscode.window.showInformationMessage(
        'Notion registry validated — all canonical databases have IDs.'
      );
    } else {
      vscode.window.showWarningMessage(`Missing Notion items: ${result.missing.join(', ')}`);
    }
  });
  context.subscriptions.push(validateCmd);

  const bootstrapCmd = vscode.commands.registerCommand('notionista.bootstrapNotion', async () => {
    const nm = new NotionManager(adapter);
    await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: 'Bootstrapping Notion canonical schema',
        cancellable: false,
      },
      async () => {
        await nm.bootstrapCanonicalSchema();
      }
    );
    vscode.window.showInformationMessage(
      'Notion bootstrap completed (placeholders written to registry).'
    );
  });
  context.subscriptions.push(bootstrapCmd);

  // Onboarding / init command: dry-run discovery -> preview -> confirm -> apply
  const initCmd = vscode.commands.registerCommand('notionista.init', async () => {
    const nm = new NotionManager(adapter);
    output.appendLine('Notionista: starting init (dry-run)');
    // capability check
    const cap = await adapter.capabilityReport();
    output.appendLine(
      `MCP adapter: command=${cap.command} available=${cap.available} details=${cap.details}`
    );
    if (!cap.available) {
      vscode.window.showErrorMessage(
        `MCP command '${cap.command}' is not available. Please configure 'notionista.mcpCommand' in settings.`
      );
      return;
    }

    // dry-run validate
    const report = await nm.validateRegistry();
    output.appendLine(
      `Validation report — missing: ${report.missing.length}, updated: ${report.updated.length}`
    );
    if (report.missing.length === 0) {
      vscode.window.showInformationMessage('Validation complete: no missing items detected.');
      return;
    }

    // show preview in output
    output.appendLine('Missing items:');
    for (const m of report.missing) output.appendLine(` - ${m}`);

    const allowWrites = vscode.workspace.getConfiguration('notionista').get('allowWrites') === true;
    const autoApply =
      vscode.workspace.getConfiguration('notionista').get('autoApplyWrites') === true;

    if (!allowWrites) {
      vscode.window.showWarningMessage(
        'Writes are disabled (notionista.allowWrites=false). No changes will be applied. To enable writes set "notionista.allowWrites" to true in settings and re-run init.'
      );
      output.appendLine('Init aborted: writes disabled by configuration.');
      return;
    }

    let proceed = false;
    if (allowWrites && autoApply) {
      // minimal approval path: proceed without modal
      proceed = true;
      output.appendLine(
        'Auto-apply enabled: proceeding to create missing items without interactive confirmation.'
      );
    } else if (allowWrites && !autoApply) {
      const confirm = await vscode.window.showWarningMessage(
        `Init will create ${report.missing.length} missing Notion items. Proceed?`,
        { modal: true },
        'Create',
        'Cancel'
      );
      if (confirm === 'Create') proceed = true;
      else output.appendLine('User canceled init');
    }

    if (!proceed) return;

    // apply bootstrap in small batches
    await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: 'Applying Notion init',
        cancellable: false,
      },
      async (progress) => {
        progress.report({ message: 'Creating missing items...' });
        const res = await nm.bootstrapCanonicalSchema();
        output.appendLine(
          `Init results — created: ${res.created.length}, failed: ${res.failed.length}`
        );
        if (res.failed.length > 0) output.appendLine(`Failed: ${res.failed.join(', ')}`);
      }
    );
    vscode.window.showInformationMessage('Notion init completed. Registry updated.');
  });
  context.subscriptions.push(initCmd);
}

export function deactivate() {
  // nothing to do yet
}

function getWebviewContent(webview: vscode.Webview, extensionUri: vscode.Uri, nonce: string) {
  const cspSource = webview.cspSource;
  // Basic secure HTML for the chat webview
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${cspSource} https:; script-src 'nonce-${nonce}'; style-src 'unsafe-inline' ${cspSource};">
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Notionista Chat</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 8px; }
    #messages { height: calc(100vh - 120px); overflow: auto; border: 1px solid #ddd; padding: 8px; }
    .msg { margin-bottom: 8px; }
    .from-user { color: #0066cc; }
    .from-assistant { color: #008000; }
  </style>
</head>
<body>
  <div id="messages" role="log" aria-live="polite"></div>
  <div>
    <input id="input" type="text" style="width:80%" placeholder="Type a message" />
    <button id="send">Send</button>
    <button id="refresh">Refresh Context</button>
  </div>
  <script nonce="${nonce}">
    const vscode = acquireVsCodeApi();
    const messagesEl = document.getElementById('messages');
    const input = document.getElementById('input');
    document.getElementById('send').addEventListener('click', () => {
      const v = input.value.trim();
      if (!v) return;
      vscode.postMessage({ type: 'userMessage', payload: v });
      input.value = '';
    });
    document.getElementById('refresh').addEventListener('click', () => {
      vscode.postMessage({ type: 'requestContext' });
    });

    window.addEventListener('message', (event) => {
      const msg = event.data;
      if (!msg || !msg.type) return;
      if (msg.type === 'state') {
        const msgs = msg.payload.messages || [];
        messagesEl.innerHTML = '';
        for (const m of msgs) {
          const d = document.createElement('div');
          d.className = 'msg ' + (m.from === 'user' ? 'from-user' : (m.from === 'assistant' ? 'from-assistant' : ''));
          d.textContent = \`[\${new Date(m.ts).toLocaleTimeString()}] \${m.from}: \${m.text}\`;
          messagesEl.appendChild(d);
        }
        messagesEl.scrollTop = messagesEl.scrollHeight;
      } else if (msg.type === 'context') {
        const ctx = msg.payload || [];
        const hdr = document.createElement('div'); hdr.style.borderTop = '1px solid #eee'; hdr.style.marginTop = '8px'; hdr.textContent = \`Context (\${ctx.length} files)\`;
        messagesEl.appendChild(hdr);
        for (const f of ctx) {
          const d = document.createElement('div');
          d.className = 'msg';
          d.textContent = \`\${f.path} — \${f.snippet.slice(0, 200)}\`;
          messagesEl.appendChild(d);
        }
        messagesEl.scrollTop = messagesEl.scrollHeight;
      }
    });
  </script>
</body>
</html>`;
}
