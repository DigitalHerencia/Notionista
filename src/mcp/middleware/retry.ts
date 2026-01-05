/**
 * Retry middleware
 * 
 * Automatically retries failed requests with exponential backoff.
 */

import type { McpMiddleware, McpRequest, McpResponse } from "../../core/types/mcp.js";
import { MCP_DEFAULTS } from "../../core/constants/index.js";

export interface RetryOptions {
  maxRetries?: number;
  backoff?: "exponential" | "linear";
  initialDelay?: number;
  maxDelay?: number;
  shouldRetry?: (error: Error) => boolean;
}

export function createRetryMiddleware(options: RetryOptions = {}): McpMiddleware {
  const {
    maxRetries = MCP_DEFAULTS.MAX_RETRIES,
    backoff = "exponential",
    initialDelay = MCP_DEFAULTS.RETRY_BACKOFF_BASE,
    maxDelay = MCP_DEFAULTS.RETRY_BACKOFF_MAX,
    shouldRetry = defaultShouldRetry,
  } = options;

  return async (_req: McpRequest, next: () => Promise<McpResponse>): Promise<McpResponse> => {
    let lastError: Error | undefined;
    let attempt = 0;

    while (attempt <= maxRetries) {
      try {
        return await next();
      } catch (error) {
        lastError = error as Error;
        attempt++;

        // Don't retry if we've exhausted attempts or error is not retryable
        if (attempt > maxRetries || !shouldRetry(lastError)) {
          throw lastError;
        }

        // Calculate delay
        const delay = calculateDelay(attempt, backoff, initialDelay, maxDelay);

        // Wait before retry
        await sleep(delay);
      }
    }

    throw lastError;
  };
}

function calculateDelay(
  attempt: number,
  backoff: "exponential" | "linear",
  initialDelay: number,
  maxDelay: number
): number {
  const delay =
    backoff === "exponential"
      ? initialDelay * Math.pow(2, attempt - 1)
      : initialDelay * attempt;

  return Math.min(delay, maxDelay);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function defaultShouldRetry(error: Error): boolean {
  // Retry on network errors and timeouts
  const retryableErrors = [
    "ECONNRESET",
    "ENOTFOUND",
    "ETIMEDOUT",
    "ECONNREFUSED",
    "MCP_TIMEOUT_ERROR",
    "MCP_TRANSPORT_ERROR",
  ];

  return retryableErrors.some((code) => error.message.includes(code) || error.name.includes(code));
}
