import * as vscode from 'vscode';
import registry, { type DatabaseSpec } from './registry';
import type { McpAdapter } from './adapter';
import { createDefaultAdapter } from './adapter';

/**
 * NotionManager uses MCP tools (mcp_notionapi_API-*) surfaced via the user's
 * VS Code MCP configuration to validate and bootstrap the canonical Notion
 * workspace. The extension does not ship or run the MCP server; the user
 * must configure an MCP server (e.g., `notionApi`) in their VS Code `mcp.json`.
 *
 * Implementation notes:
 * - This module dispatches MCP calls by invoking a VS Code command that should
 *   be provided by the Copilot/VS Code MCP integration. We use the command
 *   name `mcp.run` here as a generic bridge; the user's environment must
 *   provide an implementation that can execute MCP tool calls and return
 *   structured results. If `mcp.run` is not available this module will throw.
 * - Tool names used are from the Notion MCP server surface (e.g.
 *   `mcp_notionapi_API-retrieve-a-data-source`, `mcp_notionapi_API-post-search`,
 *   `mcp_notionapi_API-post-page`). MCP operation signatures vary by server
 *   implementation; the manager handles common cases and provides clear
 *   error messages when the tool fails.
 */

export class NotionManager {
  private adapter: McpAdapter;
  constructor(adapter?: McpAdapter) {
    this.adapter = adapter ?? createDefaultAdapter();
  }

  // Helper to dispatch an MCP tool via VS Code command. The environment must
  // expose a command (here `mcp.run`) that accepts (toolName, payload)
  // and returns a Promise of the tool response.
  private async runMcpTool(toolName: string, payload?: unknown): Promise<unknown> {
    try {
      const result = await this.adapter.run(toolName, payload);
      return result;
    } catch (e) {
      throw new Error(`MCP tool invocation failed (${toolName}): ${String(e)}`);
    }
  }

  // Try to retrieve a data source (database) by id.
  private async retrieveDataSourceById(id: string): Promise<unknown | null> {
    if (!id) return null;
    try {
      const res = await this.runMcpTool('mcp_notionapi_API-retrieve-a-data-source', {
        data_source_id: id,
      });
      return res;
    } catch {
      // treat errors as not-found; caller can decide
      return null;
    }
  }

  // Try to find a database by name using the MCP search tool.
  private async findDataSourceByName(name: string): Promise<{ id: string; url?: string } | null> {
    try {
      const res = await this.runMcpTool('mcp_notionapi_API-post-search', {
        query: name,
        page_size: 20,
      });
      // The Notion MCP server response formats vary. We defensively inspect
      // typical fields: results array with object.type === 'database' or
      // result.object === 'database'.
      const resRec = (res as Record<string, unknown>) ?? {};
      const results = Array.isArray(resRec['results']) ? (resRec['results'] as unknown[]) : null;
      if (!res || !Array.isArray(results)) return null;
      for (const r of results) {
        const rRec = (r as Record<string, unknown>) ?? {};
        const title =
          (rRec['title'] ||
            (rRec['properties'] as Record<string, unknown>)?.['Name'] ||
            rRec['name']) ??
          '';
        const id = rRec['id'] || rRec['data_source_id'] || rRec['database_id'] || null;
        if (!id) continue;
        // Best-effort name match
        const titleStr = String(title);
        const nameLower = name.toLowerCase();
        if (
          titleStr.toLowerCase().includes(nameLower) ||
          String(rRec['name'] || '')
            .toLowerCase()
            .includes(nameLower)
        ) {
          const url = rRec['url'] ?? rRec['link'] ?? rRec['web_url'];
          return { id: String(id), url: url ? String(url) : undefined };
        }
      }
      return null;
    } catch {
      return null;
    }
  }

  // Create a database using the MCP tool. The exact operation name and payload
  // depends on the MCP server. We attempt common endpoints and fall back to
  // throwing if creation is not supported.
  private async createDataSource(
    name: string,
    spec: unknown
  ): Promise<{ id: string; url?: string }> {
    // Prefer a data-source creation operation if available.
    const createOps = [
      'mcp_notionapi_API-post-data-source',
      'mcp_notionapi_API-post-database',
      'mcp_notionapi_API-post-page',
    ];
    for (const op of createOps) {
      try {
        const specRec = spec as Record<string, unknown>;
        const payload = { name, properties: (specRec.properties as Record<string, unknown>) ?? {} };
        const res = await this.runMcpTool(op, payload);
        // Attempt to extract id/url from response
        const resRec = (res as Record<string, unknown>) ?? {};
        const idVal =
          resRec['id'] ??
          resRec['data_source_id'] ??
          resRec['database_id'] ??
          resRec['page_id'] ??
          null;
        const urlVal = resRec['url'] ?? resRec['link'] ?? resRec['web_url'] ?? null;
        const idStr = idVal ? String(idVal) : null;
        const urlStr = urlVal ? String(urlVal) : undefined;
        if (idStr) return { id: idStr, url: urlStr };
      } catch {
        // try next op
      }
    }
    throw new Error(`Creation of data source "${name}" is not supported by configured MCP server.`);
  }

  /**
   * Validate the registry and return a report of missing or mismatched items.
   * For each configured canonical database this method will:
   *  - If an `id` exists in the registry, attempt to retrieve it via MCP.
   *    If retrieval fails, it will attempt to find by name and update registry.
   *  - If no `id` exists, attempt to find by name. If found, update registry.
   *  - Otherwise the database is reported as missing.
   */
  /**
   * Validate the registry. By default this is a dry-run and will not persist
   * any discovered ids/urls. To allow updating the registry set `applyUpdates`
   * to true AND the workspace setting `notionista.allowWrites` must be true.
   */
  async validateRegistry(opts?: {
    applyUpdates?: boolean;
  }): Promise<{ missing: string[]; updated: string[] }> {
    const applyUpdates =
      !!opts?.applyUpdates &&
      vscode.workspace.getConfiguration('notionista').get('allowWrites') === true;
    const reg = await registry.loadRegistry();
    const missing: string[] = [];
    const updated: string[] = [];

    const dbs = reg.databases || {};
    for (const name of Object.keys(dbs)) {
      const spec = dbs[name] as DatabaseSpec;
      try {
        let ok = false;
        if (spec.id) {
          const got = await this.retrieveDataSourceById(spec.id);
          if (got) {
            ok = true;
            // Optionally update URL if present
            const gotRec = got as Record<string, unknown>;
            const gotUrl =
              (gotRec?.['url'] as string) ?? (gotRec?.['web_url'] as string) ?? undefined;
            if (!spec.url && gotUrl) {
              if (applyUpdates) {
                await registry.setDatabaseSpec(name, { url: gotUrl });
              }
              updated.push(name);
            }
          } else {
            // try to find by name
            const found = await this.findDataSourceByName(spec.name || name);
            if (found) {
              if (applyUpdates) {
                await registry.setDatabaseSpec(name, { id: found.id, url: found.url });
              }
              updated.push(name);
              ok = true;
            }
          }
        } else {
          const found = await this.findDataSourceByName(spec.name || name);
          if (found) {
            if (applyUpdates) {
              await registry.setDatabaseSpec(name, { id: found.id, url: found.url });
            }
            updated.push(name);
            ok = true;
          }
        }
        if (!ok) missing.push(name);
      } catch {
        missing.push(name);
      }
    }

    return { missing, updated };
  }

  /**
   * Bootstrap canonical schema: attempt to create any missing databases using
   * MCP operations and write resulting ids/urls back to the registry.
   */
  async bootstrapCanonicalSchema(): Promise<{ created: string[]; failed: string[] }> {
    const reg = await registry.loadRegistry();
    const created: string[] = [];
    const failed: string[] = [];

    const missing = Object.entries(reg.databases || {})
      .filter(([, s]) => !s.id)
      .map(([n]) => n);
    for (const name of missing) {
      const spec = reg.databases[name];
      try {
        // Prevent accidental writes unless the workspace explicitly allows them
        const allowWrites =
          vscode.workspace.getConfiguration('notionista').get('allowWrites') === true;
        if (!allowWrites) {
          throw new Error('Writes are disabled by configuration (notionista.allowWrites=false)');
        }
        const res = await this.createDataSource(spec.name || name, spec);
        await registry.setDatabaseSpec(name, { id: res.id, url: res.url || null });
        created.push(name);
      } catch {
        failed.push(name);
      }
    }

    return { created, failed };
  }
}

export default NotionManager;
