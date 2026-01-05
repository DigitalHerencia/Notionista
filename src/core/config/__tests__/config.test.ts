import { describe, it, expect } from 'vitest';
import { loadConfig, getDatabaseConfig, getDatabaseId } from '../index.js';
import { ConfigurationError } from '../../errors/index.js';

describe('Config', () => {
  const validConfig = {
    databases: {
      teams: {
        id: 'test-id',
        name: 'Teams',
        url: 'https://notion.so/test',
        properties: {
          name: {
            type: 'title',
            required: true,
          },
        },
      },
    },
    safetyLimits: {
      maxBatchSize: 50,
      rateLimitPerSecond: 3,
      requireApprovalForBulk: true,
    },
    mcp: {
      serverCommand: 'npx',
      serverArgs: ['-y', '@notionhq/notion-mcp-server'],
      defaultTimeout: 30000,
      maxRetries: 3,
    },
  };

  describe('loadConfig', () => {
    it('should load valid configuration', () => {
      const config = loadConfig(validConfig);
      expect(config).toBeDefined();
      expect(config.databases.teams).toBeDefined();
      expect(config.safetyLimits.maxBatchSize).toBe(50);
    });

    it('should reject invalid configuration', () => {
      const invalidConfig = {
        databases: {},
        safetyLimits: {
          maxBatchSize: -1,
          rateLimitPerSecond: 3,
          requireApprovalForBulk: true,
        },
      };
      expect(() => loadConfig(invalidConfig)).toThrow(ConfigurationError);
    });

    it('should reject configuration with missing required fields', () => {
      const incompleteConfig = {
        databases: {},
      };
      expect(() => loadConfig(incompleteConfig)).toThrow(ConfigurationError);
    });
  });

  describe('getDatabaseConfig', () => {
    it('should get database configuration by key', () => {
      const config = loadConfig(validConfig);
      const dbConfig = getDatabaseConfig(config, 'teams');
      expect(dbConfig.id).toBe('test-id');
      expect(dbConfig.name).toBe('Teams');
    });

    it('should throw error for non-existent database', () => {
      const config = loadConfig(validConfig);
      expect(() => getDatabaseConfig(config, 'nonexistent')).toThrow(ConfigurationError);
    });
  });

  describe('getDatabaseId', () => {
    it('should get database ID by key', () => {
      const config = loadConfig(validConfig);
      const id = getDatabaseId(config, 'teams');
      expect(id).toBe('test-id');
    });

    it('should throw error for non-existent database', () => {
      const config = loadConfig(validConfig);
      expect(() => getDatabaseId(config, 'nonexistent')).toThrow(ConfigurationError);
    });
  });
});
