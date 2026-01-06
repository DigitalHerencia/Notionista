import { BatchLimitExceededError } from '../core/errors';

/**
 * Configuration for batch operations
 */
export interface BatchConfig {
  /**
   * Maximum number of items in a single batch
   * @default 50
   */
  maxBatchSize: number;

  /**
   * Whether to allow splitting batches automatically
   * @default false
   */
  allowSplit: boolean;

  /**
   * Progress callback for batch operations
   */
  onProgress?: (completed: number, total: number) => void;
}

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
 * Batch execution result
 */
export interface BatchResult {
  successful: number;
  failed: number;
  errors: Array<{ index: number; error: Error }>;
  duration: number; // milliseconds
}

/**
 * Enforces batch size limits for bulk operations
 * Protects against accidental mass updates
 */
export class BatchLimiter {
  private readonly config: BatchConfig;

  /**
   * Default batch size limit (matches copilot-instructions.md)
   */
  static readonly DEFAULT_BATCH_SIZE = 50;

  constructor(config: Partial<BatchConfig> = {}) {
    this.config = {
      maxBatchSize: config.maxBatchSize ?? BatchLimiter.DEFAULT_BATCH_SIZE,
      allowSplit: config.allowSplit ?? false,
      onProgress: config.onProgress,
    };
  }

  /**
   * Validate batch size against limit
   * @param itemCount Number of items in batch
   * @throws BatchLimitExceededError if limit exceeded
   */
  validateBatchSize(itemCount: number): void {
    if (itemCount > this.config.maxBatchSize) {
      throw new BatchLimitExceededError(itemCount, this.config.maxBatchSize);
    }
  }

  /**
   * Check if batch size is within limit
   * @param itemCount Number of items in batch
   * @returns True if within limit
   */
  isWithinLimit(itemCount: number): boolean {
    return itemCount <= this.config.maxBatchSize;
  }

  /**
   * Split batch into chunks if allowed
   * @param items Array of items to batch
   * @returns Array of chunks
   */
  splitBatch<T>(items: T[]): T[][] {
    if (!this.config.allowSplit) {
      this.validateBatchSize(items.length);
      return [items];
    }

    const chunks: T[][] = [];
    for (let i = 0; i < items.length; i += this.config.maxBatchSize) {
      chunks.push(items.slice(i, i + this.config.maxBatchSize));
    }

    return chunks;
  }

  /**
   * Generate dry-run summary for batch operation
   * @param itemCount Number of items
   * @returns Summary object
   */
  generateDryRunSummary(itemCount: number): BatchOperation {
    const chunks = Math.ceil(itemCount / this.config.maxBatchSize);
    const estimatedDuration = this.estimateDuration(itemCount);

    return {
      id: this.generateBatchId(),
      itemCount,
      estimatedDuration,
      chunks,
    };
  }

  /**
   * Execute batch operation with progress tracking
   * @param items Items to process
   * @param executor Function to execute on each item
   * @returns Batch execution result
   */
  async executeBatch<T, R>(items: T[], executor: (item: T) => Promise<R>): Promise<BatchResult> {
    const startTime = Date.now();
    let successful = 0;
    let failed = 0;
    const errors: Array<{ index: number; error: Error }> = [];

    // Validate or split batch
    const chunks = this.splitBatch(items);

    for (let chunkIndex = 0; chunkIndex < chunks.length; chunkIndex++) {
      const chunk = chunks[chunkIndex]!;

      for (let i = 0; i < chunk.length; i++) {
        const globalIndex = chunkIndex * this.config.maxBatchSize + i;
        const item = chunk[i]!;

        try {
          await executor(item);
          successful++;
        } catch (error) {
          failed++;
          errors.push({
            index: globalIndex,
            error: error instanceof Error ? error : new Error(String(error)),
          });
        }

        // Report progress
        if (this.config.onProgress) {
          this.config.onProgress(successful + failed, items.length);
        }
      }
    }

    return {
      successful,
      failed,
      errors,
      duration: Date.now() - startTime,
    };
  }

  /**
   * Format batch summary for display
   * @param summary Batch operation summary
   * @returns Markdown formatted summary
   */
  formatSummary(summary: BatchOperation): string {
    const lines = [
      `### Batch Operation Summary`,
      ``,
      `- **Total Items**: ${summary.itemCount}`,
      `- **Chunks**: ${summary.chunks}`,
      `- **Items per Chunk**: ${this.config.maxBatchSize}`,
      `- **Estimated Duration**: ${this.formatDuration(summary.estimatedDuration)}`,
    ];

    if (summary.chunks > 1) {
      lines.push(``);
      lines.push(`⚠️ This batch will be processed in ${summary.chunks} chunks`);
    }

    if (summary.itemCount > this.config.maxBatchSize && !this.config.allowSplit) {
      lines.push(``);
      lines.push(
        `❌ Batch size exceeds limit of ${this.config.maxBatchSize}. Enable allowSplit to proceed.`
      );
    }

    return lines.join('\n');
  }

  /**
   * Format batch result for display
   * @param result Batch execution result
   * @returns Markdown formatted result
   */
  formatResult(result: BatchResult): string {
    const lines = [
      `### Batch Execution Result`,
      ``,
      `- **Successful**: ${result.successful}`,
      `- **Failed**: ${result.failed}`,
      `- **Duration**: ${this.formatDuration(result.duration)}`,
    ];

    if (result.errors.length > 0) {
      lines.push(``);
      lines.push(`#### Errors`);
      lines.push(``);

      for (const { index, error } of result.errors.slice(0, 10)) {
        lines.push(`- Item ${index}: ${error.message}`);
      }

      if (result.errors.length > 10) {
        lines.push(`- ... and ${result.errors.length - 10} more errors`);
      }
    }

    return lines.join('\n');
  }

  /**
   * Estimate duration based on item count
   * Assumes ~100ms per item with rate limiting
   */
  private estimateDuration(itemCount: number): number {
    // 3 req/sec rate limit = ~333ms per request
    return itemCount * 333;
  }

  /**
   * Format duration for display
   */
  private formatDuration(ms: number): string {
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

  /**
   * Generate unique batch ID
   */
  private generateBatchId(): string {
    return `batch_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }
}
