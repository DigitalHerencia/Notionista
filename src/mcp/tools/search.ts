/**
 * Search tool wrappers
 * 
 * Typed wrappers for Notion search operations via MCP.
 */

import type { McpClient } from "../client.js";
import type { NotionPage } from "../../core/types/notion.js";

export interface SearchParams extends Record<string, unknown> {
  query?: string;
  filter?: {
    value: "page" | "database";
    property: "object";
  };
  sort?: {
    direction: "ascending" | "descending";
    timestamp: "last_edited_time";
  };
  start_cursor?: string;
  page_size?: number;
}

export interface SearchResult {
  object: "list";
  results: NotionPage[];
  next_cursor: string | null;
  has_more: boolean;
}

export class SearchTools {
  constructor(private readonly client: McpClient) {}

  /**
   * Search pages and databases by title
   */
  async search(params: SearchParams = {}): Promise<SearchResult> {
    return this.client.callTool<SearchResult>("post-search", params);
  }

  /**
   * Search only pages
   */
  async searchPages(query?: string): Promise<SearchResult> {
    return this.search({
      query,
      filter: {
        value: "page",
        property: "object",
      },
    });
  }

  /**
   * Search only databases
   */
  async searchDatabases(query?: string): Promise<SearchResult> {
    return this.search({
      query,
      filter: {
        value: "database",
        property: "object",
      },
    });
  }
}
