import { z } from 'zod';

/**
 * Validation Schema
 *
 * Defines validation rules and constraints from copilot-instructions.md
 * Ensures data integrity before proposals are executed
 */

/**
 * Validation rule types
 */
export const ValidationRuleTypeSchema = z.enum([
  'required',
  'type',
  'format',
  'range',
  'pattern',
  'custom',
  'relation',
  'select',
]);

export type ValidationRuleType = z.infer<typeof ValidationRuleTypeSchema>;

/**
 * Field type constraints
 */
export const FieldTypeSchema = z.enum([
  'string',
  'number',
  'boolean',
  'date',
  'array',
  'object',
  'relation',
  'select',
  'multi-select',
  'checkbox',
  'formula',
  'rollup',
]);

export type FieldType = z.infer<typeof FieldTypeSchema>;

/**
 * Validation severity
 */
export const ValidationSeveritySchema = z.enum(['error', 'warning', 'info']);

export type ValidationSeverity = z.infer<typeof ValidationSeveritySchema>;

/**
 * Validation rule definition
 */
export const ValidationRuleSchema = z.object({
  field: z.string(),
  type: ValidationRuleTypeSchema,
  severity: ValidationSeveritySchema.default('error'),
  message: z.string().optional(),
  constraint: z.unknown().optional(), // Type-specific constraint
});

export type ValidationRule = z.infer<typeof ValidationRuleSchema>;

/**
 * Validation issue
 */
export const ValidationIssueSchema = z.object({
  field: z.string(),
  rule: ValidationRuleTypeSchema,
  severity: ValidationSeveritySchema,
  message: z.string(),
  value: z.unknown().optional(),
});

export type ValidationIssue = z.infer<typeof ValidationIssueSchema>;

/**
 * Validation context
 * Provides additional information for validation
 */
export const ValidationContextSchema = z.object({
  database: z.string(),
  operation: z.enum(['create', 'update', 'delete']),
  existingData: z.unknown().optional(),
  schema: z
    .object({
      requiredFields: z.array(z.string()).optional(),
      selectOptions: z.record(z.string(), z.array(z.string())).optional(),
      relationTargets: z.record(z.string(), z.string()).optional(),
      dateFields: z.array(z.string()).optional(),
    })
    .optional(),
});

export type ValidationContext = z.infer<typeof ValidationContextSchema>;

/**
 * Validation result
 */
export const ValidationResultSchema = z.object({
  valid: z.boolean(),
  errors: z.array(ValidationIssueSchema),
  warnings: z.array(ValidationIssueSchema),
  info: z.array(ValidationIssueSchema).default([]),
  context: ValidationContextSchema.optional(),
});

export type ValidationResult = z.infer<typeof ValidationResultSchema>;

/**
 * Database schema definition
 * Maps to database schemas in copilot-instructions.md
 */
export const DatabaseSchemaSchema = z.object({
  database: z.string(),
  requiredFields: z.array(z.string()),
  fields: z.record(
    z.string(),
    z.object({
      type: FieldTypeSchema,
      required: z.boolean().default(false),
      options: z.array(z.string()).optional(), // For select/multi-select
      target: z.string().optional(), // For relations
      formula: z.string().optional(), // For formula fields
      readOnly: z.boolean().default(false),
    })
  ),
  relations: z.record(z.string(), z.string()).optional(), // field -> target database
  validations: z.array(ValidationRuleSchema).default([]),
});

export type DatabaseSchema = z.infer<typeof DatabaseSchemaSchema>;

/**
 * Pre-change checklist from copilot-instructions.md
 * Must be confirmed before any write operation
 */
export const PreChangeChecklistSchema = z.object({
  server: z.enum(['mcp-remote', 'local-mcp']),
  accessConfirmed: z.boolean(), // Target pages/databases are shared
  scopeDefined: z.boolean(), // Precise targets identified
  safetyVerified: z.boolean(), // No bulk destructive actions
  approvalReceived: z.boolean(), // Explicit "Approved" from user
  postChangeVerificationPlanned: z.boolean(), // Will re-query after changes
});

export type PreChangeChecklist = z.infer<typeof PreChangeChecklistSchema>;

/**
 * Validation policy
 * Defines which validations are required for each database
 */
export const ValidationPolicySchema = z.object({
  database: z.string(),
  strictMode: z.boolean().default(true),
  allowUnknownFields: z.boolean().default(false),
  requiredValidations: z.array(ValidationRuleTypeSchema),
  customRules: z.array(ValidationRuleSchema).default([]),
});

export type ValidationPolicy = z.infer<typeof ValidationPolicySchema>;
