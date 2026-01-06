import type { ValidationResult } from './proposal';

/**
 * Validation rule for a property
 */
export interface ValidationRule {
  field: string;
  required?: boolean;
  type?: 'string' | 'number' | 'boolean' | 'date' | 'array' | 'object';
  allowedValues?: unknown[];
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: unknown) => boolean;
  message?: string;
}

/**
 * Validation context with additional data
 */
export interface ValidationContext {
  /**
   * Database schema information
   */
  schema?: {
    requiredFields?: string[];
    selectOptions?: Record<string, string[]>;
    relationTargets?: Record<string, string>;
  };

  /**
   * Existing entity (for updates)
   */
  existingEntity?: Record<string, unknown>;

  /**
   * Additional validator options
   */
  options?: {
    strict?: boolean; // Fail on warnings
    allowUnknownFields?: boolean;
  };
}

/**
 * Validation issue (error or warning)
 */
interface ValidationIssue {
  field: string;
  message: string;
  severity: 'error' | 'warning';
}

/**
 * Validates entity data before mutations
 * Catches errors before MCP calls
 */
export class Validator {
  /**
   * Validate entity against rules
   * @param entity Entity to validate
   * @param rules Validation rules
   * @param context Additional validation context
   * @returns Validation result
   */
  validate(
    entity: Record<string, unknown>,
    rules: ValidationRule[],
    context?: ValidationContext
  ): ValidationResult {
    const issues: ValidationIssue[] = [];

    // Validate each rule
    for (const rule of rules) {
      const value = entity[rule.field];
      const ruleIssues = this.validateField(value, rule, context);
      issues.push(...ruleIssues);
    }

    // Check for unknown fields if strict mode
    if (context?.options?.allowUnknownFields === false) {
      const knownFields = new Set(rules.map((r) => r.field));
      for (const field of Object.keys(entity)) {
        if (!knownFields.has(field)) {
          issues.push({
            field,
            message: `Unknown field '${field}'`,
            severity: 'warning',
          });
        }
      }
    }

    // Check schema constraints if provided
    if (context?.schema) {
      issues.push(...this.validateSchema(entity, context.schema));
    }

    // Separate errors and warnings
    const errors = issues.filter((i) => i.severity === 'error').map((i) => i.message);
    const warnings = issues.filter((i) => i.severity === 'warning').map((i) => i.message);

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Validate required properties
   * @param entity Entity to validate
   * @param requiredFields Required field names
   * @returns Validation result
   */
  validateRequired(entity: Record<string, unknown>, requiredFields: string[]): ValidationResult {
    const errors: string[] = [];

    for (const field of requiredFields) {
      const value = entity[field];
      if (value === undefined || value === null || value === '') {
        errors.push(`Required field '${field}' is missing`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings: [],
    };
  }

  /**
   * Validate select option values
   * @param entity Entity to validate
   * @param selectOptions Map of field to allowed values
   * @returns Validation result
   */
  validateSelectOptions(
    entity: Record<string, unknown>,
    selectOptions: Record<string, string[]>
  ): ValidationResult {
    const errors: string[] = [];

    for (const [field, allowedValues] of Object.entries(selectOptions)) {
      const value = entity[field];

      if (value !== undefined && value !== null) {
        if (!allowedValues.includes(String(value))) {
          errors.push(
            `Invalid value for '${field}': '${value}'. Allowed: ${allowedValues.join(', ')}`
          );
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings: [],
    };
  }

  /**
   * Validate date formats
   * @param entity Entity to validate
   * @param dateFields Date field names
   * @returns Validation result
   */
  validateDates(entity: Record<string, unknown>, dateFields: string[]): ValidationResult {
    const errors: string[] = [];

    for (const field of dateFields) {
      const value = entity[field];

      if (value !== undefined && value !== null) {
        let isValid = false;

        if (value instanceof Date) {
          isValid = !isNaN(value.getTime());
        } else if (typeof value === 'string') {
          const date = new Date(value);
          isValid = !isNaN(date.getTime());
        }

        if (!isValid) {
          errors.push(`Invalid date format for '${field}': ${value}`);
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings: [],
    };
  }

  /**
   * Validate relation targets
   * @param entity Entity to validate
   * @param relationFields Map of field to target database
   * @param existingIds Optional map of database to existing IDs
   * @returns Validation result
   */
  validateRelations(
    entity: Record<string, unknown>,
    relationFields: Record<string, string>,
    existingIds?: Map<string, Set<string>>
  ): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    for (const [field, targetDatabase] of Object.entries(relationFields)) {
      const value = entity[field];

      if (value !== undefined && value !== null) {
        // Handle array of IDs
        const ids = Array.isArray(value) ? value : [value];

        for (const id of ids) {
          if (typeof id !== 'string' || id.trim() === '') {
            errors.push(`Invalid relation ID for '${field}': ${id}`);
            continue;
          }

          // Check if ID exists (if we have existing IDs)
          if (existingIds && !existingIds.get(targetDatabase)?.has(id as string)) {
            warnings.push(`Relation '${field}' references non-existent ${targetDatabase}: ${id}`);
          }
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Generate warnings for suspicious changes
   * @param current Current entity state
   * @param proposed Proposed entity state
   * @returns Validation result with warnings
   */
  generateWarnings(
    current: Record<string, unknown>,
    proposed: Record<string, unknown>
  ): ValidationResult {
    const warnings: string[] = [];

    // Warn about status changes
    if (current.status && proposed.status && current.status !== proposed.status) {
      warnings.push(
        `Status change: ${current.status} → ${proposed.status}. Verify this is intentional.`
      );
    }

    // Warn about completion changes
    if (current.done === true && proposed.done === false) {
      warnings.push(`Marking completed task as incomplete. This may affect metrics.`);
    }

    // Warn about date changes backwards in time
    if (current.due && proposed.due) {
      const currentDate = new Date(current.due as string);
      const proposedDate = new Date(proposed.due as string);

      if (proposedDate < currentDate && proposedDate < new Date()) {
        warnings.push(`Setting due date to past: ${proposedDate.toISOString()}`);
      }
    }

    // Warn about removing relations
    for (const [key, value] of Object.entries(current)) {
      if (key.toLowerCase().includes('relation') || key.endsWith('Id')) {
        if (value && !proposed[key]) {
          warnings.push(`Removing relation '${key}'. This may break dependencies.`);
        }
      }
    }

    return {
      valid: true,
      errors: [],
      warnings,
    };
  }

  /**
   * Validate a single field against a rule
   */
  private validateField(
    value: unknown,
    rule: ValidationRule,
    _context?: ValidationContext
  ): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    // Required check
    if (rule.required && (value === undefined || value === null || value === '')) {
      issues.push({
        field: rule.field,
        message: rule.message || `Field '${rule.field}' is required`,
        severity: 'error',
      });
      return issues; // Stop further validation if required field is missing
    }

    // Skip validation if value is not provided and not required
    if (value === undefined || value === null) {
      return issues;
    }

    // Type check
    if (rule.type) {
      const actualType = this.getValueType(value);
      if (actualType !== rule.type) {
        issues.push({
          field: rule.field,
          message: `Field '${rule.field}' must be of type ${rule.type}, got ${actualType}`,
          severity: 'error',
        });
      }
    }

    // Allowed values check
    if (rule.allowedValues && !rule.allowedValues.includes(value)) {
      issues.push({
        field: rule.field,
        message: `Field '${rule.field}' has invalid value. Allowed: ${rule.allowedValues.join(', ')}`,
        severity: 'error',
      });
    }

    // String validations
    if (typeof value === 'string') {
      if (rule.minLength && value.length < rule.minLength) {
        issues.push({
          field: rule.field,
          message: `Field '${rule.field}' must be at least ${rule.minLength} characters`,
          severity: 'error',
        });
      }

      if (rule.maxLength && value.length > rule.maxLength) {
        issues.push({
          field: rule.field,
          message: `Field '${rule.field}' must be at most ${rule.maxLength} characters`,
          severity: 'error',
        });
      }

      if (rule.pattern && !rule.pattern.test(value)) {
        issues.push({
          field: rule.field,
          message: `Field '${rule.field}' does not match required pattern`,
          severity: 'error',
        });
      }
    }

    // Custom validation
    if (rule.custom && !rule.custom(value)) {
      issues.push({
        field: rule.field,
        message: rule.message || `Field '${rule.field}' failed custom validation`,
        severity: 'error',
      });
    }

    return issues;
  }

  /**
   * Validate against schema constraints
   */
  private validateSchema(
    entity: Record<string, unknown>,
    schema: NonNullable<ValidationContext['schema']>
  ): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    // Validate required fields
    if (schema.requiredFields) {
      for (const field of schema.requiredFields) {
        const value = entity[field];
        if (value === undefined || value === null || value === '') {
          issues.push({
            field,
            message: `Required field '${field}' is missing`,
            severity: 'error',
          });
        }
      }
    }

    // Validate select options
    if (schema.selectOptions) {
      for (const [field, allowedValues] of Object.entries(schema.selectOptions)) {
        const value = entity[field];
        if (value !== undefined && value !== null) {
          if (!allowedValues.includes(String(value))) {
            issues.push({
              field,
              message: `Invalid value for '${field}': '${value}'. Allowed: ${allowedValues.join(', ')}`,
              severity: 'error',
            });
          }
        }
      }
    }

    return issues;
  }

  /**
   * Get the type of a value
   */
  private getValueType(value: unknown): string {
    if (Array.isArray(value)) return 'array';
    if (value instanceof Date) return 'date';
    if (value === null) return 'null';
    return typeof value;
  }
}
