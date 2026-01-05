/**
 * Page tool wrappers
 * 
 * Typed wrappers for Notion page operations via MCP.
 */

import type { McpClient } from "../client.js";
import type { NotionPage } from "../../core/types/notion.js";

export interface CreatePageParams extends Record<string, unknown> {
  parent: {
    database_id: string;
  };
  properties: Record<string, unknown>;
  children?: unknown[];
}

export interface UpdatePageParams extends Record<string, unknown> {
  page_id: string;
  properties?: Record<string, unknown>;
  archived?: boolean;
}

export class PageTools {
  constructor(private readonly client: McpClient) {}

  /**
   * Create a new page in a database
   */
  async createPage(params: CreatePageParams): Promise<NotionPage> {
    return this.client.callTool<NotionPage>("post-page", params);
  }

  /**
   * Update an existing page
   */
  async updatePage(params: UpdatePageParams): Promise<NotionPage> {
    return this.client.callTool<NotionPage>("patch-page", {
      page_id: params.page_id,
      properties: params.properties,
      archived: params.archived,
    });
  }

  /**
   * Retrieve a page by ID
   */
  async getPage(pageId: string): Promise<NotionPage> {
    return this.client.callTool<NotionPage>("retrieve-a-page", {
      page_id: pageId,
    });
  }

  /**
   * Move a page to a different parent
   */
  async movePage(pageId: string, parentId: string): Promise<NotionPage> {
    return this.client.callTool<NotionPage>("move-page", {
      page_id: pageId,
      parent: {
        page_id: parentId,
      },
    });
  }
}
