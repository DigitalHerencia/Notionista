/**
 * Base error class for all Notionista errors
 */
export class NotionistaError extends Error {
  public readonly code: string;
  public override readonly cause?: unknown;

  constructor(message: string, code: string, cause?: unknown) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.cause = cause;
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

/**
 * MCP transport and connection errors
 */
export class McpTransportError extends NotionistaError {
  constructor(message: string, cause?: unknown) {
    super(message, "MCP_TRANSPORT_ERROR", cause);
  }
}

export class McpConnectionError extends NotionistaError {
  constructor(message: string, cause?: unknown) {
    super(message, "MCP_CONNECTION_ERROR", cause);
  }
}

export class McpTimeoutError extends NotionistaError {
  constructor(message: string, timeout: number) {
    super(`${message} (timeout: ${timeout}ms)`, "MCP_TIMEOUT_ERROR");
  }
}

/**
 * JSON-RPC protocol errors
 */
export class JsonRpcError extends NotionistaError {
  constructor(
    message: string,
    public readonly rpcCode: number,
    public readonly rpcData?: unknown
  ) {
    super(message, "JSON_RPC_ERROR");
  }
}

/**
 * MCP tool invocation errors
 */
export class McpToolError extends NotionistaError {
  constructor(
    message: string,
    public readonly toolName: string,
    cause?: unknown
  ) {
    super(message, "MCP_TOOL_ERROR", cause);
  }
}

/**
 * Rate limiting errors
 */
export class RateLimitError extends NotionistaError {
  constructor(
    message: string,
    public readonly retryAfter?: number
  ) {
    super(message, "RATE_LIMIT_ERROR");
  }
}

/**
 * Validation errors
 */
export class ValidationError extends NotionistaError {
  constructor(
    message: string,
    public readonly validationErrors: Array<{ field: string; message: string }>
  ) {
    super(message, "VALIDATION_ERROR");
  }
}

/**
 * Proposal errors
 */
export class ProposalNotFoundError extends NotionistaError {
  constructor(proposalId: string) {
    super(`Proposal not found: ${proposalId}`, "PROPOSAL_NOT_FOUND");
  }
}

export class ProposalStateError extends NotionistaError {
  constructor(message: string) {
    super(message, "PROPOSAL_STATE_ERROR");
  }
}

/**
 * Repository errors
 */
export class RepositoryError extends NotionistaError {
  constructor(
    message: string,
    public readonly repository: string,
    cause?: unknown
  ) {
    super(message, "REPOSITORY_ERROR", cause);
  }
}

export class EntityNotFoundError extends NotionistaError {
  constructor(entityType: string, id: string) {
    super(`${entityType} not found: ${id}`, "ENTITY_NOT_FOUND");
  }
}
