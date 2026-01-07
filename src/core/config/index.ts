/**
 * Configuration loader and validator
 *
 * @module core/config
 */

import { z } from 'zod';
import { ConfigurationError } from '../errors/index.js';

/**
 * Property configuration schema
 */
const PropertyConfigSchema = z.object({
  type: z.string(),
  required: z.boolean().optional(),
  target: z.string().optional(),
  options: z.array(z.string()).optional(),
  computed: z.boolean().optional(),
});

/**
 * Database configuration schema
 */
const DatabaseConfigSchema = z.object({
  id: z.string(),
  name: z.string(),
  url: z.string().optional(),
  properties: z.record(z.string(), PropertyConfigSchema).optional(),
});

/**
 * Safety limits schema
 */
const SafetyLimitsSchema = z.object({
  maxBatchSize: z.number().int().positive(),
  rateLimitPerSecond: z.number().positive(),
  requireApprovalForBulk: z.boolean(),
});

/**
 * MCP configuration schema
 */
const McpConfigSchema = z.object({
  serverCommand: z.string(),
  serverArgs: z.array(z.string()),
  defaultTimeout: z.number().int().positive(),
  maxRetries: z.number().int().nonnegative(),
});

/**
 * Full configuration schema
 */
const ConfigSchema = z.object({
  databases: z.record(z.string(), DatabaseConfigSchema),
  safetyLimits: SafetyLimitsSchema,
  mcp: McpConfigSchema,
});

/**
 * Configuration type
 */
export type Config = z.infer<typeof ConfigSchema>;
export type DatabaseConfig = z.infer<typeof DatabaseConfigSchema>;
export type SafetyLimits = z.infer<typeof SafetyLimitsSchema>;
export type McpConfig = z.infer<typeof McpConfigSchema>;

/**
 * Load and validate configuration from JSON
 */
export function loadConfig(configData: unknown): Config {
  try {
    return ConfigSchema.parse(configData);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorDetails = error.issues.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
      throw new ConfigurationError(`Invalid configuration: ${errorDetails}`);
    }
    throw error;
  }
}

/**
 * Get database configuration by key
 */
export function getDatabaseConfig(config: Config, key: string): DatabaseConfig {
  const dbConfig = config.databases[key];
  if (!dbConfig) {
    throw new ConfigurationError(`Database configuration not found: ${key}`);
  }
  return dbConfig;
}

/**
 * Get database ID by key
 */
export function getDatabaseId(config: Config, key: string): string {
  return getDatabaseConfig(config, key).id;
}
