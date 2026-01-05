import { describe, it, expect } from 'vitest';
import { BatchLimiter } from '../batch-limiter';
import { BatchLimitExceededError } from '../../core/errors';

describe('BatchLimiter', () => {
  describe('validateBatchSize', () => {
    it('should not throw for batches within limit', () => {
      const limiter = new BatchLimiter();
      expect(() => limiter.validateBatchSize(50)).not.toThrow();
      expect(() => limiter.validateBatchSize(25)).not.toThrow();
    });

    it('should throw for batches exceeding limit', () => {
      const limiter = new BatchLimiter();
      expect(() => limiter.validateBatchSize(51)).toThrow(BatchLimitExceededError);
      expect(() => limiter.validateBatchSize(100)).toThrow(BatchLimitExceededError);
    });

    it('should respect custom batch size', () => {
      const limiter = new BatchLimiter({ maxBatchSize: 10 });
      expect(() => limiter.validateBatchSize(10)).not.toThrow();
      expect(() => limiter.validateBatchSize(11)).toThrow(BatchLimitExceededError);
    });
  });

  describe('isWithinLimit', () => {
    it('should return true for batches within limit', () => {
      const limiter = new BatchLimiter();
      expect(limiter.isWithinLimit(50)).toBe(true);
      expect(limiter.isWithinLimit(25)).toBe(true);
    });

    it('should return false for batches exceeding limit', () => {
      const limiter = new BatchLimiter();
      expect(limiter.isWithinLimit(51)).toBe(false);
      expect(limiter.isWithinLimit(100)).toBe(false);
    });
  });

  describe('splitBatch', () => {
    it('should return single chunk for small batches', () => {
      const limiter = new BatchLimiter({ allowSplit: true });
      const items = Array.from({ length: 25 }, (_, i) => i);
      const chunks = limiter.splitBatch(items);

      expect(chunks).toHaveLength(1);
      expect(chunks[0]).toHaveLength(25);
    });

    it('should split large batches when allowSplit is true', () => {
      const limiter = new BatchLimiter({ allowSplit: true });
      const items = Array.from({ length: 75 }, (_, i) => i);
      const chunks = limiter.splitBatch(items);

      expect(chunks).toHaveLength(2);
      expect(chunks[0]).toHaveLength(50);
      expect(chunks[1]).toHaveLength(25);
    });

    it('should throw when allowSplit is false and batch exceeds limit', () => {
      const limiter = new BatchLimiter({ allowSplit: false });
      const items = Array.from({ length: 75 }, (_, i) => i);

      expect(() => limiter.splitBatch(items)).toThrow(BatchLimitExceededError);
    });

    it('should split into exact chunks', () => {
      const limiter = new BatchLimiter({ maxBatchSize: 10, allowSplit: true });
      const items = Array.from({ length: 30 }, (_, i) => i);
      const chunks = limiter.splitBatch(items);

      expect(chunks).toHaveLength(3);
      expect(chunks[0]).toHaveLength(10);
      expect(chunks[1]).toHaveLength(10);
      expect(chunks[2]).toHaveLength(10);
    });
  });

  describe('generateDryRunSummary', () => {
    it('should generate summary for small batch', () => {
      const limiter = new BatchLimiter();
      const summary = limiter.generateDryRunSummary(25);

      expect(summary.itemCount).toBe(25);
      expect(summary.chunks).toBe(1);
      expect(summary.estimatedDuration).toBeGreaterThan(0);
      expect(summary.id).toBeDefined();
    });

    it('should calculate multiple chunks for large batch', () => {
      const limiter = new BatchLimiter();
      const summary = limiter.generateDryRunSummary(120);

      expect(summary.itemCount).toBe(120);
      expect(summary.chunks).toBe(3); // 50 + 50 + 20
    });

    it('should estimate duration correctly', () => {
      const limiter = new BatchLimiter();
      const summary = limiter.generateDryRunSummary(30);

      // 30 items * 333ms = ~10s
      expect(summary.estimatedDuration).toBeGreaterThanOrEqual(9000);
      expect(summary.estimatedDuration).toBeLessThanOrEqual(11000);
    });
  });

  describe('executeBatch', () => {
    it('should execute all items successfully', async () => {
      const limiter = new BatchLimiter();
      const items = [1, 2, 3, 4, 5];
      const results: number[] = [];

      const result = await limiter.executeBatch(items, async (item) => {
        results.push(item);
        return item * 2;
      });

      expect(result.successful).toBe(5);
      expect(result.failed).toBe(0);
      expect(result.errors).toHaveLength(0);
      expect(results).toEqual([1, 2, 3, 4, 5]);
    });

    it('should handle failures', async () => {
      const limiter = new BatchLimiter();
      const items = [1, 2, 3, 4, 5];

      const result = await limiter.executeBatch(items, async (item) => {
        if (item === 3) {
          throw new Error('Failed on 3');
        }
        return item * 2;
      });

      expect(result.successful).toBe(4);
      expect(result.failed).toBe(1);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]?.index).toBe(2);
      expect(result.errors[0]?.error.message).toBe('Failed on 3');
    });

    it('should call progress callback', async () => {
      const progressCalls: Array<{ completed: number; total: number }> = [];
      const limiter = new BatchLimiter({
        onProgress: (completed, total) => progressCalls.push({ completed, total }),
      });
      const items = [1, 2, 3];

      await limiter.executeBatch(items, async (item) => item * 2);

      expect(progressCalls).toHaveLength(3);
      expect(progressCalls[0]).toEqual({ completed: 1, total: 3 });
      expect(progressCalls[1]).toEqual({ completed: 2, total: 3 });
      expect(progressCalls[2]).toEqual({ completed: 3, total: 3 });
    });

    it('should handle large batches with splitting', async () => {
      const limiter = new BatchLimiter({ maxBatchSize: 10, allowSplit: true });
      const items = Array.from({ length: 25 }, (_, i) => i);
      const results: number[] = [];

      const result = await limiter.executeBatch(items, async (item) => {
        results.push(item);
        return item;
      });

      expect(result.successful).toBe(25);
      expect(results).toHaveLength(25);
    });
  });

  describe('formatSummary', () => {
    it('should format single chunk summary', () => {
      const limiter = new BatchLimiter();
      const summary = limiter.generateDryRunSummary(25);
      const formatted = limiter.formatSummary(summary);

      expect(formatted).toContain('**Total Items**: 25');
      expect(formatted).toContain('**Chunks**: 1');
    });

    it('should format multiple chunk summary', () => {
      const limiter = new BatchLimiter();
      const summary = limiter.generateDryRunSummary(120);
      const formatted = limiter.formatSummary(summary);

      expect(formatted).toContain('**Total Items**: 120');
      expect(formatted).toContain('**Chunks**: 3');
      expect(formatted).toContain('processed in 3 chunks');
    });
  });

  describe('formatResult', () => {
    it('should format successful result', () => {
      const limiter = new BatchLimiter();
      const result = {
        successful: 10,
        failed: 0,
        errors: [],
        duration: 5000,
      };

      const formatted = limiter.formatResult(result);

      expect(formatted).toContain('**Successful**: 10');
      expect(formatted).toContain('**Failed**: 0');
    });

    it('should format result with errors', () => {
      const limiter = new BatchLimiter();
      const result = {
        successful: 8,
        failed: 2,
        errors: [
          { index: 3, error: new Error('Error 1') },
          { index: 7, error: new Error('Error 2') },
        ],
        duration: 5000,
      };

      const formatted = limiter.formatResult(result);

      expect(formatted).toContain('**Successful**: 8');
      expect(formatted).toContain('**Failed**: 2');
      expect(formatted).toContain('Errors');
      expect(formatted).toContain('Item 3');
      expect(formatted).toContain('Item 7');
    });

    it('should truncate large error lists', () => {
      const limiter = new BatchLimiter();
      const errors = Array.from({ length: 20 }, (_, i) => ({
        index: i,
        error: new Error(`Error ${i}`),
      }));

      const result = {
        successful: 0,
        failed: 20,
        errors,
        duration: 5000,
      };

      const formatted = limiter.formatResult(result);

      expect(formatted).toContain('and 10 more errors');
    });
  });
});
