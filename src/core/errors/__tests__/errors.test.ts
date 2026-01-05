import { describe, it, expect } from 'vitest';
import {
  NotionError,
  ValidationError,
  McpError,
  TransportError,
  TimeoutError,
  RateLimitError,
  ConfigurationError,
  NotFoundError,
  ProposalError,
  isNotionError,
  isValidationError,
  isMcpError,
  isRateLimitError,
} from '../index.js';

describe('Errors', () => {
  describe('NotionError', () => {
    it('should create a NotionError with message and code', () => {
      const error = new NotionError('Test error', 'TEST_ERROR');
      expect(error.message).toBe('Test error');
      expect(error.code).toBe('TEST_ERROR');
      expect(error.name).toBe('NotionError');
    });

    it('should include details', () => {
      const error = new NotionError('Test error', 'TEST_ERROR', { foo: 'bar' });
      expect(error.details).toEqual({ foo: 'bar' });
    });
  });

  describe('ValidationError', () => {
    it('should create a ValidationError', () => {
      const error = new ValidationError('Invalid data');
      expect(error.message).toBe('Invalid data');
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.name).toBe('ValidationError');
    });
  });

  describe('McpError', () => {
    it('should create an McpError', () => {
      const error = new McpError('MCP failed');
      expect(error.message).toBe('MCP failed');
      expect(error.code).toBe('MCP_ERROR');
      expect(error.name).toBe('McpError');
    });
  });

  describe('TransportError', () => {
    it('should create a TransportError', () => {
      const error = new TransportError('Transport failed');
      expect(error.message).toBe('Transport failed');
      expect(error.code).toBe('TRANSPORT_ERROR');
      expect(error.name).toBe('TransportError');
    });
  });

  describe('TimeoutError', () => {
    it('should create a TimeoutError', () => {
      const error = new TimeoutError('Request timed out');
      expect(error.message).toBe('Request timed out');
      expect(error.code).toBe('TIMEOUT_ERROR');
      expect(error.name).toBe('TimeoutError');
    });
  });

  describe('RateLimitError', () => {
    it('should create a RateLimitError with retryAfter', () => {
      const error = new RateLimitError('Rate limit exceeded', 60);
      expect(error.message).toBe('Rate limit exceeded');
      expect(error.code).toBe('RATE_LIMIT_ERROR');
      expect(error.name).toBe('RateLimitError');
      expect(error.retryAfter).toBe(60);
    });
  });

  describe('ConfigurationError', () => {
    it('should create a ConfigurationError', () => {
      const error = new ConfigurationError('Invalid config');
      expect(error.message).toBe('Invalid config');
      expect(error.code).toBe('CONFIGURATION_ERROR');
      expect(error.name).toBe('ConfigurationError');
    });
  });

  describe('NotFoundError', () => {
    it('should create a NotFoundError with resource info', () => {
      const error = new NotFoundError('Resource not found', 'Project', 'project-123');
      expect(error.message).toBe('Resource not found');
      expect(error.code).toBe('NOT_FOUND_ERROR');
      expect(error.name).toBe('NotFoundError');
      expect(error.resourceType).toBe('Project');
      expect(error.resourceId).toBe('project-123');
    });
  });

  describe('ProposalError', () => {
    it('should create a ProposalError', () => {
      const error = new ProposalError('Invalid proposal');
      expect(error.message).toBe('Invalid proposal');
      expect(error.code).toBe('PROPOSAL_ERROR');
      expect(error.name).toBe('ProposalError');
    });
  });

  describe('Type guards', () => {
    it('should identify NotionError', () => {
      const error = new NotionError('Test', 'TEST');
      expect(isNotionError(error)).toBe(true);
      expect(isNotionError(new Error('Test'))).toBe(false);
    });

    it('should identify ValidationError', () => {
      const error = new ValidationError('Test');
      expect(isValidationError(error)).toBe(true);
      expect(isValidationError(new NotionError('Test', 'TEST'))).toBe(false);
    });

    it('should identify McpError', () => {
      const error = new McpError('Test');
      expect(isMcpError(error)).toBe(true);
      expect(isMcpError(new NotionError('Test', 'TEST'))).toBe(false);
    });

    it('should identify RateLimitError', () => {
      const error = new RateLimitError('Test', 60);
      expect(isRateLimitError(error)).toBe(true);
      expect(isRateLimitError(new McpError('Test'))).toBe(false);
    });
  });
});
