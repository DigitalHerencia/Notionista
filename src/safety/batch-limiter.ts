/**
 * Batch Operation Utilities
 *
 * Provides utilities for reasoning about batch operations without execution.
 * This module offers pure functions for batch size validation and splitting.
 *
 * Actual batch execution is delegated to the VS Code MCP host.
 *
 * @deprecated This module is being phased out. Use constraint types instead:
 * @see {validateBatchSize} in src/core/types/constraints.ts
 * @see {splitIntoBatches} in src/core/types/constraints.ts
 */

/**
 * Batch operation metadata
 */
export interface BatchOperation {
  id: string;
  itemCount: number;
  estimatedDuration: number; // milliseconds
  chunks: number; // number of chunks if split
}

/**
 * @deprecated Use validateBatchSize from src/core/types/constraints.ts instead
 *
 * This function is retained for backward compatibility only.
 * It validates batch size against recommended limits but does not enforce them.
 *
 * @param itemCount - Number of items in batch
 * @param maxBatchSize - Maximum recommended batch size (default: 50)
 * @returns True if within recommended limit
 */
export function isWithinBatchLimit(itemCount: number, maxBatchSize = 50): boolean {
  return itemCount <= maxBatchSize;
}

/**
 * @deprecated Use splitIntoBatches from src/core/types/constraints.ts instead
 *
 * Split items into chunks based on recommended batch size.
 * This is a pure function that returns chunks without executing operations.
 *
 * @param items - Array of items to split
 * @param maxBatchSize - Maximum items per chunk (default: 50)
 * @returns Array of item chunks
 */
export function splitBatch<T>(items: T[], maxBatchSize = 50): T[][] {
  const chunks: T[][] = [];

  for (let i = 0; i < items.length; i += maxBatchSize) {
    chunks.push(items.slice(i, i + maxBatchSize));
  }

  return chunks;
}

/**
 * @deprecated Batch operation summaries should be generated externally
 *
 * Generate dry-run summary for batch operation.
 * This is metadata only - no execution occurs.
 *
 * @param itemCount - Number of items
 * @param maxBatchSize - Maximum batch size (default: 50)
 * @returns Summary object
 */
export function generateBatchSummary(itemCount: number, maxBatchSize = 50): BatchOperation {
  const chunks = Math.ceil(itemCount / maxBatchSize);
  const estimatedDuration = estimateBatchDuration(itemCount);

  return {
    id: `batch_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    itemCount,
    estimatedDuration,
    chunks,
  };
}

/**
 * Format batch summary for display
 *
 * @param summary - Batch operation summary
 * @param maxBatchSize - Maximum batch size (default: 50)
 * @returns Markdown formatted summary
 */
export function formatBatchSummary(summary: BatchOperation, maxBatchSize = 50): string {
  const lines = [
    `### Batch Operation Summary`,
    ``,
    `- **Total Items**: ${summary.itemCount}`,
    `- **Chunks**: ${summary.chunks}`,
    `- **Items per Chunk**: ${maxBatchSize}`,
    `- **Estimated Duration**: ${formatDuration(summary.estimatedDuration)}`,
  ];

  if (summary.chunks > 1) {
    lines.push(``);
    lines.push(`⚠️ This batch will be processed in ${summary.chunks} chunks`);
  }

  if (summary.itemCount > maxBatchSize) {
    lines.push(``);
    lines.push(
      `⚠️ Batch size exceeds recommended limit of ${maxBatchSize}. Consider splitting or requesting user approval.`
    );
  }

  return lines.join('\n');
}

/**
 * Estimate duration based on item count
 * Assumes ~333ms per item with rate limiting (3 req/sec)
 */
function estimateBatchDuration(itemCount: number): number {
  // 3 req/sec rate limit = ~333ms per request
  return itemCount * 333;
}

/**
 * Format duration for display
 */
function formatDuration(ms: number): string {
  if (ms < 1000) {
    return `${ms}ms`;
  }

  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) {
    return `${seconds}s`;
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
}
