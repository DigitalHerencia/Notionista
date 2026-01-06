/**
 * Rate limiter middleware
 *
 * Enforces a maximum number of requests per second to prevent API throttling.
 */

import type { McpMiddleware, McpRequest, McpResponse } from '../../core/types/mcp.js';

export interface RateLimiterOptions {
  requestsPerSecond: number;
}

export function createRateLimiter(options: RateLimiterOptions): McpMiddleware {
  const { requestsPerSecond } = options;
  const minInterval = 1000 / requestsPerSecond;
  let lastRequestTime = 0;
  const queue: Array<() => void> = [];
  let processing = false;

  const processQueue = (): void => {
    if (processing || queue.length === 0) {
      return;
    }

    processing = true;

    const run = (): void => {
      while (queue.length > 0) {
        const now = Date.now();
        const timeSinceLastRequest = now - lastRequestTime;

        if (timeSinceLastRequest >= minInterval) {
          // Execute next request immediately
          lastRequestTime = now;
          const next = queue.shift();
          next?.();
          // Loop to check if we can process another immediately
        } else {
          // Wait before executing next request
          const delay = minInterval - timeSinceLastRequest;
          setTimeout(() => {
            lastRequestTime = Date.now();
            const next = queue.shift();
            next?.();
            // After executing one delayed request, continue processing
            run();
          }, delay);
          return;
        }
      }

      // No more queued requests; allow processing to be restarted
      processing = false;
    };

    run();
  };

  return async (_req: McpRequest, next: () => Promise<McpResponse>): Promise<McpResponse> => {
    return new Promise((resolve, reject) => {
      queue.push(() => {
        next().then(resolve).catch(reject);
      });
      processQueue();
    });
  };
}
