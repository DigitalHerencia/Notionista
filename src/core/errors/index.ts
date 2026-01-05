/**
 * Custom error hierarchy for Notionista SDK
 *
 * @module core/errors
 */

/**
 * Base error class for all Notionista errors
 */
export class NotionError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = 'NotionError';
    Object.setPrototypeOf(this, NotionError.prototype);
  }
}

/**
 * Validation error - thrown when data validation fails
 */
export class ValidationError extends NotionError {
  constructor(message: string, details?: unknown) {
    super(message, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

/**
 * MCP error - thrown when MCP communication fails
 */
export class McpError extends NotionError {
  constructor(message: string, details?: unknown) {
    super(message, 'MCP_ERROR', details);
    this.name = 'McpError';
    Object.setPrototypeOf(this, McpError.prototype);
  }
}

/**
 * Transport error - thrown when transport layer fails
 */
export class TransportError extends NotionError {
  constructor(message: string, details?: unknown) {
    super(message, 'TRANSPORT_ERROR', details);
    this.name = 'TransportError';
    Object.setPrototypeOf(this, TransportError.prototype);
  }
}

/**
 * Timeout error - thrown when a request times out
 */
export class TimeoutError extends NotionError {
  constructor(message: string, details?: unknown) {
    super(message, 'TIMEOUT_ERROR', details);
    this.name = 'TimeoutError';
    Object.setPrototypeOf(this, TimeoutError.prototype);
  }
}

/**
 * Rate limit error - thrown when rate limit is exceeded
 */
export class RateLimitError extends NotionError {
  constructor(
    message: string,
    public readonly retryAfter?: number,
    details?: unknown
  ) {
    super(message, 'RATE_LIMIT_ERROR', details);
    this.name = 'RateLimitError';
    Object.setPrototypeOf(this, RateLimitError.prototype);
  }
}

/**
 * Configuration error - thrown when configuration is invalid
 */
export class ConfigurationError extends NotionError {
  constructor(message: string, details?: unknown) {
    super(message, 'CONFIGURATION_ERROR', details);
    this.name = 'ConfigurationError';
    Object.setPrototypeOf(this, ConfigurationError.prototype);
  }
}

/**
 * Not found error - thrown when a resource is not found
 */
export class NotFoundError extends NotionError {
  constructor(
    message: string,
    public readonly resourceType: string,
    public readonly resourceId: string
  ) {
    super(message, 'NOT_FOUND_ERROR', { resourceType, resourceId });
    this.name = 'NotFoundError';
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

/**
 * Proposal error - thrown when a change proposal is invalid
 */
export class ProposalError extends NotionError {
  constructor(message: string, details?: unknown) {
    super(message, 'PROPOSAL_ERROR', details);
    this.name = 'ProposalError';
    Object.setPrototypeOf(this, ProposalError.prototype);
  }
}

/**
 * Type guard to check if an error is a NotionError
 */
export function isNotionError(error: unknown): error is NotionError {
  return error instanceof NotionError;
}

/**
 * Type guard to check if an error is a ValidationError
 */
export function isValidationError(error: unknown): error is ValidationError {
  return error instanceof ValidationError;
}

/**
 * Type guard to check if an error is an McpError
 */
export function isMcpError(error: unknown): error is McpError {
  return error instanceof McpError;
}

/**
 * Type guard to check if an error is a RateLimitError
 */
export function isRateLimitError(error: unknown): error is RateLimitError {
  return error instanceof RateLimitError;
}
