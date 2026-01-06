/**
 * Database tool wrappers
 *
 * Typed wrappers for Notion database operations via MCP.
 */

import type { McpClient } from '../client.js';
import type { QueryParams, QueryResult } from '../../core/types/notion.js';

export class DatabaseTools {
  constructor(private readonly client: McpClient) {}

  /**
   * Query a database with filters, sorts, and pagination
   */
  async queryDatabase(params: QueryParams): Promise<QueryResult> {
    return this.client.callTool<QueryResult>('query-data-source', {
      database_id: params.database_id,
      filter: params.filter,
      sorts: params.sorts,
      page_size: params.page_size,
      start_cursor: params.start_cursor,
    });
  }

  /**
   * Retrieve database metadata
   */
  async getDatabase(databaseId: string): Promise<unknown> {
    return this.client.callTool('retrieve-a-data-source', {
      database_id: databaseId,
    });
  }

  /**
   * List available data source templates
   */
  async listTemplates(): Promise<unknown> {
    return this.client.callTool('list-data-source-templates', {});
  }
}
