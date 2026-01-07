/**
 * Base error class for all Notionista errors
 */
export class NotionistaError extends Error {
  constructor(
    message: string,
    public readonly code: string
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Error thrown when a repository operation fails
 */
export class RepositoryError extends NotionistaError {
  constructor(message: string, code = 'REPOSITORY_ERROR') {
    super(message, code);
  }
}

/**
 * Error thrown when an entity is not found
 */
export class EntityNotFoundError extends RepositoryError {
  constructor(entityType: string, id: string) {
    super(`${entityType} with id '${id}' not found`, 'ENTITY_NOT_FOUND');
  }
}

/**
 * Error thrown when validation fails
 */
export class ValidationError extends NotionistaError {
  constructor(
    message: string,
    public readonly errors: Array<{ field: string; message: string }>
  ) {
    super(message, 'VALIDATION_ERROR');
  }
}

/**
 * Error thrown when a proposal is not found
 */
export class ProposalNotFoundError extends NotionistaError {
  constructor(proposalId: string) {
    super(`Proposal '${proposalId}' not found`, 'PROPOSAL_NOT_FOUND');
  }
}

/**
 * Error thrown when batch size exceeds limit
 */
export class BatchLimitExceededError extends NotionistaError {
  constructor(actual: number, limit: number) {
    super(`Batch size ${actual} exceeds limit of ${limit}`, 'BATCH_LIMIT_EXCEEDED');
  }
}

/**
 * Error thrown when MCP operation fails
 */
export class McpError extends NotionistaError {
  constructor(
    message: string,
    public readonly operation: string
  ) {
    super(message, 'MCP_ERROR');
  }
}

/**
 * Error thrown when configuration is invalid
 */
export class ConfigurationError extends NotionistaError {
  constructor(message: string) {
    super(message, 'CONFIGURATION_ERROR');
  }
}

/**
 * Error thrown when MCP transport operation fails
 *
 * NOTE: This error type is retained for compatibility with external transport
 * implementations. The SDK itself does not spawn or manage MCP transports.
 */
export class McpTransportError extends NotionistaError {
  constructor(
    message: string,
    public readonly details?: unknown
  ) {
    super(message, 'MCP_TRANSPORT_ERROR');
  }
}

/**
 * Error thrown when MCP connection fails
 *
 * NOTE: This error type is retained for compatibility with external transport
 * implementations. The SDK itself does not spawn or manage MCP connections.
 */
export class McpConnectionError extends NotionistaError {
  constructor(
    message: string,
    public readonly details?: unknown
  ) {
    super(message, 'MCP_CONNECTION_ERROR');
  }
}

// Backward compatibility error classes with specific codes
/**
 * NotionError - Alias for NotionistaError with additional details support
 */
export class NotionError extends NotionistaError {
  constructor(
    message: string,
    code: string,
    public readonly details?: unknown
  ) {
    super(message, code);
  }
}

/**
 * TransportError - Error for transport layer failures
 */
export class TransportError extends NotionistaError {
  constructor(message: string) {
    super(message, 'TRANSPORT_ERROR');
  }
}

/**
 * TimeoutError - Error for timeout failures
 */
export class TimeoutError extends NotionistaError {
  constructor(message: string) {
    super(message, 'TIMEOUT_ERROR');
  }
}

/**
 * RateLimitError - Error for rate limit failures
 */
export class RateLimitError extends NotionistaError {
  constructor(
    message: string,
    public readonly retryAfter?: number
  ) {
    super(message, 'RATE_LIMIT_ERROR');
  }
}

/**
 * NotFoundError - Error for resource not found
 */
export class NotFoundError extends NotionistaError {
  constructor(
    message: string,
    public readonly resourceType?: string,
    public readonly resourceId?: string
  ) {
    super(message, 'NOT_FOUND_ERROR');
  }
}

/**
 * ProposalError - Error for proposal failures
 */
export class ProposalError extends NotionistaError {
  constructor(message: string) {
    super(message, 'PROPOSAL_ERROR');
  }
}

// Type guards
export const isNotionError = (error: unknown): error is NotionError =>
  error instanceof NotionError || error instanceof NotionistaError;
export const isValidationError = (error: unknown): error is ValidationError =>
  error instanceof ValidationError;
export const isMcpError = (error: unknown): error is McpError => error instanceof McpError;
export const isRateLimitError = (error: unknown): error is RateLimitError =>
  error instanceof RateLimitError;
