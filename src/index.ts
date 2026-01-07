// MCP Client and Types
export { McpClient, MockMcpClient, type IMcpClient, type McpOperationIntent } from './mcp/client.js';

// Core constants
export { DATABASE_IDS as DATABASE_IDS_CONST } from './core/constants/databases.js';
export { DATABASE_IDS, MCP_DEFAULTS } from './core/constants/index.js';

// Core types
export type {
  CsvParserOptions,
  Snapshot,
  SnapshotDiff,
  SnapshotRecord,
} from './core/types/snapshot.js';

export { SnapshotRecordSchema, SnapshotSchema } from './core/types/snapshot.js';

// Snapshot management
export { SnapshotManager } from './sync/snapshot.js';

// CSV parsing
export { CsvSnapshotParser } from './sync/parser/csv.js';

// Safety Layer
export {
  BatchLimiter,
  DiffEngine,
  ProposalManager,
  Validator,
  type ApplyResult,
  type BatchConfig,
  type BatchOperation,
  type BatchResult,
  type ChangeProposal,
  type DiffResult,
  type ImpactLevel,
  type PropertyDiff,
  type SideEffect,
  type ValidationContext,
  type ValidationResult,
  type ValidationRule,
} from './safety/index.js';

// Control Layer (Agent-Aligned Governance)
export * from './control/index.js';

// Error types
export {
  BatchLimitExceededError,
  EntityNotFoundError,
  McpError,
  NotionistaError,
  ProposalNotFoundError,
  RepositoryError,
  ValidationError as SafetyValidationError,
} from './core/errors/index.js';
