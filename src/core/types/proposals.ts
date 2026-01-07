import type { DatabaseId } from '../constants/databases';
import type { McpOperationIntent } from '../../mcp/client';

/**
 * Represents a change proposal in the safety workflow
 * Propose → Approve → Apply pattern
 *
 * This is a DECLARATIVE proposal - it describes what should happen,
 * not executes it. The mcpIntent field contains the MCP operation
 * that would need to be executed to apply this change.
 */
export interface ChangeProposal<T> {
  /** Unique identifier for this proposal */
  id: string;

  /** Type of operation being proposed */
  type: 'create' | 'update' | 'delete' | 'bulk';

  /** Target database and page for the operation */
  target: {
    database: DatabaseId;
    pageId?: string;
  };

  /** Current state (null for creates) */
  currentState: T | null;

  /** Proposed new state */
  proposedState: T;

  /** Property-level differences */
  diff: PropertyDiff[];

  /** Related side effects of this change */
  sideEffects: SideEffect[];

  /** Validation results */
  validation: ValidationResult;

  /** When this proposal was created */
  createdAt: Date;

  /** The MCP operation intent to execute this proposal */
  mcpIntent?: McpOperationIntent;
}

/**
 * Represents a difference between current and proposed states
 */
export interface PropertyDiff {
  /** Property name that changed */
  property: string;

  /** Current value */
  oldValue: unknown;

  /** Proposed value */
  newValue: unknown;

  /** Impact level of this change */
  impact: 'low' | 'medium' | 'high';
}

/**
 * Represents a side effect of a proposed change
 */
export interface SideEffect {
  /** Type of side effect */
  type: 'relation_update' | 'rollup_recalc' | 'cascade';

  /** Human-readable description */
  description: string;

  /** IDs of items that will be affected */
  affectedItems: string[];
}

/**
 * Validation result for a proposal
 */
export interface ValidationResult {
  /** Whether validation passed */
  valid: boolean;

  /** List of validation errors */
  errors: ValidationError[];

  /** List of validation warnings */
  warnings: ValidationWarning[];
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ValidationWarning {
  field: string;
  message: string;
  code: string;
}

/**
 * Result of applying a proposal
 */
export interface ApplyResult<T = unknown> {
  /** Whether the operation succeeded */
  success: boolean;

  /** The resulting entity (if successful) */
  result?: T;

  /** Error information (if failed) */
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}
