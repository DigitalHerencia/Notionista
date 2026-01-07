/**
 * MCP Operation Constraints
 *
 * Constraint metadata for Copilot reasoning about MCP operations.
 * These constraints describe limitations and best practices handled by
 * the VS Code MCP client and host environment, not by this SDK.
 *
 * The SDK is a declarative control layer - runtime concerns like rate
 * limiting, retries, and batch execution are handled by the MCP host.
 */

/**
 * Rate limiting constraints for MCP operations
 *
 * VS Code MCP client handles rate limiting automatically.
 * These constraints inform Copilot's reasoning but don't enforce limits.
 */
export interface RateLimitConstraints {
  /**
   * Maximum requests per second
   * @default 3
   * @handledBy 'vscode-mcp-client'
   */
  requestsPerSecond: number;

  /**
   * Who enforces this constraint
   */
  handledBy: 'vscode-mcp-client';
}

/**
 * Retry constraints for MCP operations
 *
 * VS Code MCP client handles retries with exponential backoff.
 * These constraints inform Copilot's reasoning but don't execute retries.
 */
export interface RetryConstraints {
  /**
   * Maximum number of retry attempts
   * @default 3
   * @handledBy 'vscode-mcp-client'
   */
  maxRetries: number;

  /**
   * Backoff strategy (exponential recommended)
   * @default 'exponential'
   * @handledBy 'vscode-mcp-client'
   */
  backoffStrategy: 'exponential' | 'linear';

  /**
   * Initial delay in milliseconds
   * @default 1000
   * @handledBy 'vscode-mcp-client'
   */
  initialDelayMs: number;

  /**
   * Maximum delay in milliseconds
   * @default 10000
   * @handledBy 'vscode-mcp-client'
   */
  maxDelayMs: number;

  /**
   * Who enforces this constraint
   */
  handledBy: 'vscode-mcp-client';
}

/**
 * Batch operation guidance for Copilot
 *
 * Provides recommendations for batch operations without enforcing limits.
 * Actual batch execution is handled externally by the MCP host.
 */
export interface BatchGuidance {
  /**
   * Recommended maximum items per batch
   * @default 50
   * @handledBy 'copilot-agent'
   */
  maxItemsPerBatch: number;

  /**
   * Whether to require a dry-run summary before large operations
   * @default true
   * @handledBy 'copilot-agent'
   */
  requiresDryRunSummary: boolean;

  /**
   * Who should follow this guidance
   */
  handledBy: 'copilot-agent';

  /**
   * Explanation of why this limit exists
   */
  rationale: string;
}

/**
 * Complete MCP operation constraints
 *
 * Combines all constraint types for comprehensive Copilot reasoning.
 * None of these constraints are enforced at runtime by this SDK.
 */
export interface McpCallConstraints {
  /**
   * Rate limiting constraints
   * VS Code MCP client handles rate limiting
   */
  rateLimit: RateLimitConstraints;

  /**
   * Retry constraints
   * VS Code MCP client handles retries with exponential backoff
   */
  retry: RetryConstraints;

  /**
   * Batch operation guidance
   * Copilot should reason about batch sizes and propose dry-runs
   */
  batchGuidance: BatchGuidance;
}

/**
 * Default MCP operation constraints
 *
 * Standard constraints for all MCP operations.
 * These values align with VS Code MCP client defaults.
 */
export const DEFAULT_MCP_CONSTRAINTS: McpCallConstraints = {
  rateLimit: {
    requestsPerSecond: 3,
    handledBy: 'vscode-mcp-client',
  },
  retry: {
    maxRetries: 3,
    backoffStrategy: 'exponential',
    initialDelayMs: 1000,
    maxDelayMs: 10000,
    handledBy: 'vscode-mcp-client',
  },
  batchGuidance: {
    maxItemsPerBatch: 50,
    requiresDryRunSummary: true,
    handledBy: 'copilot-agent',
    rationale:
      'Large batch operations can have significant impact. Copilot should generate a summary for user review before executing batches over this size.',
  },
} as const;

/**
 * Batch size validation result
 *
 * Simple validation for batch operations.
 * Does not execute or enforce - used for Copilot reasoning only.
 */
export interface BatchSizeValidation {
  /**
   * Whether the batch size is within recommended limits
   */
  withinLimit: boolean;

  /**
   * Number of items in the batch
   */
  itemCount: number;

  /**
   * Recommended maximum batch size
   */
  recommendedMax: number;

  /**
   * Number of chunks needed if batch should be split
   */
  suggestedChunks: number;

  /**
   * Whether a dry-run summary should be generated
   */
  requiresDryRun: boolean;

  /**
   * Human-readable explanation
   */
  message: string;
}

/**
 * Validate batch size against guidance
 *
 * Pure function - performs no side effects or enforcement.
 * Used for generating validation results for Copilot reasoning.
 *
 * @param itemCount - Number of items in batch
 * @param guidance - Batch guidance to validate against (optional, uses defaults)
 * @returns Validation result with recommendations
 */
export function validateBatchSize(
  itemCount: number,
  guidance: BatchGuidance = DEFAULT_MCP_CONSTRAINTS.batchGuidance
): BatchSizeValidation {
  const withinLimit = itemCount <= guidance.maxItemsPerBatch;
  const suggestedChunks = Math.ceil(itemCount / guidance.maxItemsPerBatch);
  const requiresDryRun = guidance.requiresDryRunSummary && itemCount > guidance.maxItemsPerBatch;

  let message: string;
  if (withinLimit) {
    message = `Batch of ${itemCount} items is within recommended limit of ${guidance.maxItemsPerBatch}`;
  } else {
    message = `Batch of ${itemCount} items exceeds recommended limit of ${guidance.maxItemsPerBatch}. Consider splitting into ${suggestedChunks} chunks.`;
  }

  return {
    withinLimit,
    itemCount,
    recommendedMax: guidance.maxItemsPerBatch,
    suggestedChunks,
    requiresDryRun,
    message,
  };
}

/**
 * Split items into recommended batch chunks
 *
 * Pure function - performs no side effects or execution.
 * Used for generating batch chunks for Copilot reasoning.
 *
 * @param items - Array of items to split
 * @param guidance - Batch guidance (optional, uses defaults)
 * @returns Array of item chunks
 */
export function splitIntoBatches<T>(
  items: T[],
  guidance: BatchGuidance = DEFAULT_MCP_CONSTRAINTS.batchGuidance
): T[][] {
  const chunks: T[][] = [];
  const chunkSize = guidance.maxItemsPerBatch;

  for (let i = 0; i < items.length; i += chunkSize) {
    chunks.push(items.slice(i, i + chunkSize));
  }

  return chunks;
}
