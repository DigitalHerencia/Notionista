import { z } from 'zod';

/**
 * Proposal Schema
 *
 * Mirrors the "Propose → Approve → Apply" workflow from AGENTS.md
 * Behavioral contract: All changes must go through this lifecycle
 */

/**
 * Database target schema
 * Maps to core databases in copilot-instructions.md
 */
export const DatabaseTargetSchema = z.enum([
  'teams',
  'projects',
  'tasks',
  'meetings',
  'prompts',
  'tech-stack',
  'templates',
  'sops',
  'calendar',
]);

export type DatabaseTarget = z.infer<typeof DatabaseTargetSchema>;

/**
 * Change operation types
 * As defined in copilot-instructions.md safety workflow
 */
export const OperationTypeSchema = z.enum([
  'create',
  'update',
  'delete',
  'bulk-create',
  'bulk-update',
  'bulk-delete',
]);

export type OperationType = z.infer<typeof OperationTypeSchema>;

/**
 * Proposal status lifecycle
 * Enforces the Propose → Approve → Apply workflow
 */
export const ProposalStatusSchema = z.enum([
  'pending', // Initial state: proposed but not yet approved
  'approved', // Approved by user: ready to apply
  'applied', // Successfully executed
  'rejected', // Rejected by user
  'failed', // Execution failed
]);

export type ProposalStatus = z.infer<typeof ProposalStatusSchema>;

/**
 * Property change diff
 * Shows what will change in the proposed operation
 */
export const PropertyDiffSchema = z.object({
  property: z.string(),
  oldValue: z.unknown().nullable(),
  newValue: z.unknown(),
  impact: z.enum(['low', 'medium', 'high']),
});

export type PropertyDiff = z.infer<typeof PropertyDiffSchema>;

/**
 * Side effects of a proposed change
 * Warns about cascading impacts (relations, rollups)
 */
export const SideEffectSchema = z.object({
  type: z.enum(['relation_update', 'rollup_recalc', 'cascade', 'metric_impact']),
  description: z.string(),
  affectedItems: z.array(z.string()),
  severity: z.enum(['info', 'warning', 'critical']).default('info'),
});

export type SideEffect = z.infer<typeof SideEffectSchema>;

/**
 * Validation result
 * From validator.ts, aligned with control layer
 */
export const ValidationResultSchema = z.object({
  valid: z.boolean(),
  errors: z.array(z.string()),
  warnings: z.array(z.string()),
});

export type ValidationResult = z.infer<typeof ValidationResultSchema>;

/**
 * Proposal intent
 * Describes what the user wants to accomplish
 */
export const ProposalIntentSchema = z.object({
  action: z.string(), // e.g., "Create task", "Update project status"
  reason: z.string().optional(), // Why this change is needed
  requestedBy: z.string().optional(), // User or agent requesting change
  context: z.record(z.string(), z.unknown()).optional(), // Additional context
});

export type ProposalIntent = z.infer<typeof ProposalIntentSchema>;

/**
 * Audit record
 * Tracks who, what, when for governance
 */
export const AuditRecordSchema = z.object({
  proposalId: z.string(),
  timestamp: z.date(),
  action: z.enum(['proposed', 'approved', 'rejected', 'applied', 'failed']),
  actor: z.string().optional(), // User who took action
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export type AuditRecord = z.infer<typeof AuditRecordSchema>;

/**
 * Complete proposal schema
 * Implements the full Propose → Approve → Apply behavioral contract
 */
export const ProposalSchema = z.object({
  id: z.string(),
  type: OperationTypeSchema,
  target: z.object({
    database: DatabaseTargetSchema,
    pageId: z.string().optional(), // For updates/deletes
    pageIds: z.array(z.string()).optional(), // For bulk operations
  }),
  intent: ProposalIntentSchema,
  currentState: z.unknown().nullable(), // For updates
  proposedState: z.unknown(),
  diff: z.array(PropertyDiffSchema).default([]),
  sideEffects: z.array(SideEffectSchema).default([]),
  validation: ValidationResultSchema,
  status: ProposalStatusSchema.default('pending'),
  audit: z.array(AuditRecordSchema).default([]),
  createdAt: z.date(),
  approvedAt: z.date().optional(),
  appliedAt: z.date().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export type Proposal = z.infer<typeof ProposalSchema>;

/**
 * Proposal workflow interface
 * Mirrors the behavioral expectations from AGENTS.md
 * No execution logic - purely declarative
 */
export interface ProposalWorkflow {
  /**
   * Step 1: Propose a change
   * Creates a proposal with validation and side effect analysis
   */
  propose: (intent: ProposalIntent, data: unknown) => Proposal;

  /**
   * Step 2: Validate the proposal
   * Checks constraints and identifies side effects
   */
  validate: (proposal: Proposal) => ValidationResult;

  /**
   * Step 3: Get approval (manual step)
   * User responds with "Approved" or requests revisions
   * This is a manual interaction - no code execution
   */
  // approve: Manual user action

  /**
   * Step 4: Apply the proposal (external execution)
   * Actual MCP tool calls happen externally
   * Control layer only tracks status
   */
  // apply: External execution via MCP client
}

/**
 * Proposal summary for review
 * Formats proposal for human review before approval
 */
export const ProposalSummarySchema = z.object({
  id: z.string(),
  title: z.string(),
  type: OperationTypeSchema,
  target: z.string(),
  summary: z.string(),
  changes: z.array(z.string()),
  risks: z.array(z.string()),
  requiresApproval: z.boolean().default(true),
});

export type ProposalSummary = z.infer<typeof ProposalSummarySchema>;
