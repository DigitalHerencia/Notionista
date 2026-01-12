import type * as vscode from 'vscode';
import type { IndexedFile } from './contextProvider';

export type ChatMessage = {
  id: string;
  from: 'user' | 'system' | 'assistant';
  text: string;
  ts: number;
};

export class ChatController {
  private messages: ChatMessage[] = [];
  private panel?: vscode.WebviewPanel;

  constructor(private logger: (m: string) => void = console.warn) {}

  attachPanel(panel: vscode.WebviewPanel) {
    this.panel = panel;
  }

  push(msg: Omit<ChatMessage, 'id' | 'ts'>) {
    const m: ChatMessage = {
      id: String(Date.now()) + Math.random().toString(36).slice(2, 8),
      ts: Date.now(),
      ...msg,
    };
    this.messages.push(m);
    this.logger(`New message: ${m.text}`);
    this.postState();
    return m;
  }

  getHistory() {
    return this.messages.slice();
  }

  async postState() {
    if (!this.panel) return;
    try {
      this.panel.webview.postMessage({ type: 'state', payload: { messages: this.getHistory() } });
    } catch (e) {
      this.logger(`Failed to post state: ${String(e)}`);
    }
  }

  async provideContext(files: IndexedFile[]) {
    if (!this.panel) return;
    // send a reduced context list
    const context = files.slice(0, 20).map((f) => ({ path: f.path, snippet: f.snippet }));
    this.panel.webview.postMessage({ type: 'context', payload: context });
  }
}

export default ChatController;
