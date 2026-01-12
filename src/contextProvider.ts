import * as vscode from 'vscode';

export type IndexedFile = {
  uri: vscode.Uri;
  path: string;
  snippet: string;
};

export class ContextProvider {
  private indexed: IndexedFile[] = [];

  constructor(private logger: (msg: string) => void = console.warn) {}

  async indexWorkspace(maxFiles = 200): Promise<IndexedFile[]> {
    this.logger('Indexing workspace...');
    if (!vscode.workspace.workspaceFolders || vscode.workspace.workspaceFolders.length === 0) {
      this.logger('No workspace open');
      return [];
    }

    const pattern = '**/*.{md,markdown,txt,json,js,ts}';
    const exclude = '**/node_modules/**';
    const uris = await vscode.workspace.findFiles(pattern, exclude, maxFiles);

    const files: IndexedFile[] = [];
    for (const uri of uris) {
      try {
        const bytes = await vscode.workspace.fs.readFile(uri);
        const text = Buffer.from(bytes).toString('utf8');
        const snippet = text.slice(0, 400).replace(/[\r\n]+/g, ' ');
        files.push({ uri, path: uri.fsPath, snippet });
      } catch (e) {
        this.logger(`Failed to read ${uri.toString()}: ${String(e)}`);
      }
    }

    this.indexed = files;
    this.logger(`Indexed ${files.length} files`);
    return files;
  }

  getIndexed() {
    return this.indexed;
  }
}

export default ContextProvider;
