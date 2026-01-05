/**
 * Cache middleware
 * 
 * Caches responses for read-only operations to reduce API calls.
 */

import type { McpMiddleware, McpRequest, McpResponse } from "../../core/types/mcp.js";

export interface CacheOptions {
  enabled?: boolean;
  ttl?: number; // Time to live in milliseconds
  maxSize?: number; // Maximum cache entries
}

interface CacheEntry {
  response: McpResponse;
  timestamp: number;
}

export function createCacheMiddleware(options: CacheOptions = {}): McpMiddleware {
  const { enabled = true, ttl = 60000, maxSize = 100 } = options;

  const cache = new Map<string, CacheEntry>();

  // Periodically clean expired entries
  const cleanInterval = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of cache.entries()) {
      if (now - entry.timestamp > ttl) {
        cache.delete(key);
      }
    }
  }, ttl);

  // Clean up interval on process exit
  if (typeof process !== "undefined") {
    process.once("beforeExit", () => clearInterval(cleanInterval));
  }

  return async (req: McpRequest, next: () => Promise<McpResponse>): Promise<McpResponse> => {
    if (!enabled || !isCacheable(req.tool)) {
      return next();
    }

    const cacheKey = generateCacheKey(req);
    const cached = cache.get(cacheKey);

    // Return cached response if valid
    if (cached && Date.now() - cached.timestamp < ttl) {
      return cached.response;
    }

    // Execute request and cache the response
    const response = await next();

    // Enforce max cache size
    if (cache.size >= maxSize) {
      // Remove oldest entry
      const oldestKey = cache.keys().next().value as string;
      cache.delete(oldestKey);
    }

    cache.set(cacheKey, {
      response,
      timestamp: Date.now(),
    });

    return response;
  };
}

/**
 * Determine if a tool call is cacheable (read-only operations)
 */
function isCacheable(tool: string): boolean {
  const readOnlyTools = [
    "retrieve-a-data-source",
    "query-data-source",
    "retrieve-a-page",
    "get-block-children",
    "retrieve-a-block",
    "post-search",
    "get-self",
    "get-user",
    "get-users",
  ];

  return readOnlyTools.includes(tool);
}

/**
 * Generate a cache key from request
 */
function generateCacheKey(req: McpRequest): string {
  return `${req.tool}:${JSON.stringify(req.params)}`;
}
