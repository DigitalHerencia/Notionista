/**
 * Middleware exports
 *
 * @deprecated These middleware implementations contain execution-oriented logic that should not be used.
 *
 * The Notionista SDK is now a declarative control layer. Middleware like retry, rate-limiting,
 * caching, and logging are runtime concerns that should be handled by the MCP host environment
 * (VS Code) or external transport implementations.
 *
 * These middleware types and interfaces are retained for type definitions only.
 * The implementations should not be used in production code.
 */

export * from './rate-limiter.js';
export * from './retry.js';
export * from './logger.js';
export * from './cache.js';
