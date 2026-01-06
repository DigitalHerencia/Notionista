/**
 * Block tool wrappers
 *
 * Typed wrappers for Notion block operations via MCP.
 */

import type { McpClient } from '../client.js';

export interface Block {
  object: 'block';
  id: string;
  type: string;
  [key: string]: unknown;
}

export interface AppendBlocksParams extends Record<string, unknown> {
  block_id: string;
  children: unknown[];
}

export interface UpdateBlockParams extends Record<string, unknown> {
  block_id: string;
}

export class BlockTools {
  constructor(private readonly client: McpClient) {}

  /**
   * Get children blocks of a parent block or page
   */
  async getBlockChildren(
    blockId: string,
    startCursor?: string
  ): Promise<{
    results: Block[];
    next_cursor: string | null;
    has_more: boolean;
  }> {
    return this.client.callTool('get-block-children', {
      block_id: blockId,
      start_cursor: startCursor,
    });
  }

  /**
   * Retrieve a block by ID
   */
  async getBlock(blockId: string): Promise<Block> {
    return this.client.callTool<Block>('retrieve-a-block', {
      block_id: blockId,
    });
  }

  /**
   * Append blocks to a parent block or page
   */
  async appendBlocks(params: AppendBlocksParams): Promise<{
    results: Block[];
  }> {
    return this.client.callTool('patch-block-children', params);
  }

  /**
   * Update a block
   */
  async updateBlock(params: UpdateBlockParams): Promise<Block> {
    return this.client.callTool<Block>('update-a-block', params);
  }

  /**
   * Delete a block
   */
  async deleteBlock(blockId: string): Promise<Block> {
    return this.client.callTool<Block>('delete-a-block', {
      block_id: blockId,
    });
  }
}
