/**
 * Base error class for all Notionista errors
 */
export class NotionistaError extends Error {
  constructor(message: string, public readonly code: string) {
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
  constructor(message: string, public readonly operation: string) {
    super(message, 'MCP_ERROR');
  }
}
