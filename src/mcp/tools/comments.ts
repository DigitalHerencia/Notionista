/**
 * Comment tool wrappers
 * 
 * Typed wrappers for Notion comment operations via MCP.
 */

import type { McpClient } from "../client.js";

export interface Comment {
  object: "comment";
  id: string;
  parent: {
    type: "page_id" | "block_id";
    page_id?: string;
    block_id?: string;
  };
  discussion_id: string;
  created_time: string;
  last_edited_time: string;
  created_by: {
    object: "user";
    id: string;
  };
  rich_text: Array<{
    type: "text";
    text: {
      content: string;
    };
    plain_text: string;
  }>;
}

export interface CreateCommentParams extends Record<string, unknown> {
  parent: {
    page_id?: string;
    block_id?: string;
  };
  rich_text: Array<{
    text: {
      content: string;
    };
  }>;
  discussion_id?: string;
}

export class CommentTools {
  constructor(private readonly client: McpClient) {}

  /**
   * Create a comment on a page or block
   */
  async createComment(params: CreateCommentParams): Promise<Comment> {
    return this.client.callTool<Comment>("create-a-comment", params);
  }

  /**
   * Retrieve a comment by ID
   */
  async getComment(commentId: string): Promise<Comment> {
    return this.client.callTool<Comment>("retrieve-a-comment", {
      comment_id: commentId,
    });
  }

  /**
   * Get comments on a page or block
   * Note: The actual MCP tool name may vary - verify against @notionhq/notion-mcp-server
   */
  async getComments(blockId: string, startCursor?: string): Promise<{
    results: Comment[];
    next_cursor: string | null;
    has_more: boolean;
  }> {
    return this.client.callTool("retrieve-comments", {
      block_id: blockId,
      start_cursor: startCursor,
    });
  }
}
