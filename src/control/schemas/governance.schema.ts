import { z } from 'zod';

/**
 * Governance Schema
 *
 * Defines governance rules and policies from copilot-instructions.md
 * Enforces safe, controlled edits to Notion workspace
 */

/**
 * Operation permission levels
 */
export const PermissionLevelSchema = z.enum([
  'allowed', // Default allowed operations (read-only)
  'requires-approval', // Write operations requiring explicit "Approved"
  'disallowed', // Operations that are never allowed
]);

export type PermissionLevel = z.infer<typeof PermissionLevelSchema>;

/**
 * Operation category
 */
export const OperationCategorySchema = z.enum([
  'read', // Search, list, query, retrieve
  'write', // Create, update
  'delete', // Delete operations
  'bulk', // Bulk operations (>1 item)
  'destructive', // Destructive bulk operations
  'move', // Moving pages/databases
]);

export type OperationCategory = z.infer<typeof OperationCategorySchema>;

/**
 * Governance rule
 * Defines what operations are allowed, require approval, or are disallowed
 */
export const GovernanceRuleSchema = z.object({
  id: z.string(),
  category: OperationCategorySchema,
  operation: z.string(), // Specific operation (e.g., "create-page", "delete-database")
  permission: PermissionLevelSchema,
  conditions: z
    .object({
      maxItems: z.number().optional(), // Max items for bulk operations
      requiresDryRun: z.boolean().optional(),
      requiresVerification: z.boolean().optional(),
    })
    .optional(),
  reason: z.string().optional(),
});

export type GovernanceRule = z.infer<typeof GovernanceRuleSchema>;

/**
 * Default governance policy from copilot-instructions.md
 */
export const DefaultGovernancePolicySchema = z.object({
  allowedOperations: z.array(z.string()).default([
    'search',
    'list-databases',
    'query-database',
    'retrieve-page',
    'retrieve-block',
    'read-comment',
  ]),
  requiresApproval: z.array(z.string()).default([
    'create-page',
    'update-page',
    'update-properties',
    'append-blocks',
    'add-comment',
  ]),
  disallowed: z.array(z.string()).default([
    'delete-page-bulk',
    'delete-block-bulk',
    'erase-content',
    'move-database',
    'move-to-workspace',
  ]),
  bulkOperationLimit: z.number().default(50),
  requiresDryRun: z.boolean().default(true),
});

export type DefaultGovernancePolicy = z.infer<typeof DefaultGovernancePolicySchema>;

/**
 * Safety workflow configuration
 * Implements Propose → Approve → Apply from copilot-instructions.md
 */
export const SafetyWorkflowConfigSchema = z.object({
  enabled: z.boolean().default(true),
  steps: z
    .object({
      propose: z.object({
        required: z.boolean().default(true),
        includesDiff: z.boolean().default(true),
        includesSideEffects: z.boolean().default(true),
      }),
      approve: z.object({
        required: z.boolean().default(true),
        keyword: z.string().default('Approved'),
        timeout: z.number().optional(), // seconds
      }),
      apply: z.object({
        requiresVerification: z.boolean().default(true),
        rollbackOnFailure: z.boolean().default(false),
      }),
      verify: z.object({
        required: z.boolean().default(true),
        requery: z.boolean().default(true),
      }),
    })
    .default({
      propose: { required: true, includesDiff: true, includesSideEffects: true },
      approve: { required: true, keyword: 'Approved' },
      apply: { requiresVerification: true, rollbackOnFailure: false },
      verify: { required: true, requery: true },
    }),
});

export type SafetyWorkflowConfig = z.infer<typeof SafetyWorkflowConfigSchema>;

/**
 * Pre-change checklist items
 * From copilot-instructions.md section "Pre-Change Checklist"
 */
export const PreChangeChecklistItemSchema = z.object({
  id: z.string(),
  description: z.string(),
  required: z.boolean().default(true),
  checked: z.boolean().default(false),
  checkedAt: z.date().optional(),
  checkedBy: z.string().optional(),
});

export type PreChangeChecklistItem = z.infer<typeof PreChangeChecklistItemSchema>;

/**
 * Complete pre-change checklist
 */
export const PreChangeChecklistSchema = z.object({
  proposalId: z.string(),
  items: z
    .array(PreChangeChecklistItemSchema)
    .default([])
    .refine((items) => items.every((item) => !item.required || item.checked), {
      message: 'All required checklist items must be checked',
    }),
  allChecked: z.boolean(),
  checkedAt: z.date().optional(),
});

export type PreChangeChecklist = z.infer<typeof PreChangeChecklistSchema>;

/**
 * Governance violation
 * Records when a governance rule is violated
 */
export const GovernanceViolationSchema = z.object({
  id: z.string(),
  timestamp: z.date(),
  rule: GovernanceRuleSchema,
  attemptedOperation: z.string(),
  actor: z.string(),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  description: z.string(),
  blocked: z.boolean(), // Was the operation blocked?
});

export type GovernanceViolation = z.infer<typeof GovernanceViolationSchema>;

/**
 * Governance policy
 * Complete governance configuration for the control layer
 */
export const GovernancePolicySchema = z.object({
  version: z.string().default('1.0'),
  enabled: z.boolean().default(true),
  rules: z.array(GovernanceRuleSchema),
  safetyWorkflow: SafetyWorkflowConfigSchema,
  defaults: DefaultGovernancePolicySchema,
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export type GovernancePolicy = z.infer<typeof GovernancePolicySchema>;

/**
 * Permission check result
 */
export const PermissionCheckResultSchema = z.object({
  allowed: z.boolean(),
  permission: PermissionLevelSchema,
  reason: z.string().optional(),
  appliedRule: GovernanceRuleSchema.optional(),
  requiresApproval: z.boolean().default(false),
});

export type PermissionCheckResult = z.infer<typeof PermissionCheckResultSchema>;
