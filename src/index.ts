// Core types
export type {
  SnapshotRecord,
  Snapshot,
  SnapshotDiff,
  CsvParserOptions,
} from "./core/types/snapshot.js";

export { SnapshotRecordSchema, SnapshotSchema } from "./core/types/snapshot.js";

// Snapshot management
export { SnapshotManager } from "./sync/snapshot.js";

// CSV parsing
export { CsvSnapshotParser } from "./sync/parser/csv.js";

// Safety Layer
export {
  ProposalManager,
  DiffEngine,
  BatchLimiter,
  Validator,
  type ChangeProposal,
  type PropertyDiff,
  type SideEffect,
  type ValidationResult,
  type ApplyResult,
  type BatchConfig,
  type BatchOperation,
  type BatchResult,
  type ValidationRule,
  type ValidationContext,
  type ImpactLevel,
  type DiffResult,
} from "./safety/index.js";

// Error types
export {
  NotionistaError,
  RepositoryError,
  EntityNotFoundError,
  ValidationError as SafetyValidationError,
  ProposalNotFoundError,
  BatchLimitExceededError,
  McpError,
} from "./core/errors/index.js";
