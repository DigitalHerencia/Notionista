/**
 * User tool wrappers
 * 
 * Typed wrappers for Notion user operations via MCP.
 */

import type { McpClient } from "../client.js";

export interface User {
  object: "user";
  id: string;
  type?: "person" | "bot";
  name?: string;
  avatar_url?: string;
  person?: {
    email?: string;
  };
  bot?: {
    owner?: unknown;
    workspace_name?: string;
  };
}

export class UserTools {
  constructor(private readonly client: McpClient) {}

  /**
   * Get the current bot user
   */
  async getSelf(): Promise<User> {
    return this.client.callTool<User>("get-self", {});
  }

  /**
   * Get a user by ID
   */
  async getUser(userId: string): Promise<User> {
    return this.client.callTool<User>("get-user", {
      user_id: userId,
    });
  }

  /**
   * List all users
   */
  async listUsers(startCursor?: string): Promise<{
    results: User[];
    next_cursor: string | null;
    has_more: boolean;
  }> {
    return this.client.callTool("get-users", {
      start_cursor: startCursor,
    });
  }
}
