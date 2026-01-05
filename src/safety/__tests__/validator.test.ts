import { describe, it, expect } from 'vitest';
import { Validator } from '../validator';

describe('Validator', () => {
  const validator = new Validator();

  describe('validate', () => {
    it('should validate required fields', () => {
      const entity = { name: 'Test' };
      const rules = [{ field: 'name', required: true }];

      const result = validator.validate(entity, rules);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail when required field is missing', () => {
      const entity = {};
      const rules = [{ field: 'name', required: true }];

      const result = validator.validate(entity, rules);

      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('required');
    });

    it('should validate field types', () => {
      const entity = { name: 'Test', age: 25 };
      const rules = [
        { field: 'name', type: 'string' as const },
        { field: 'age', type: 'number' as const },
      ];

      const result = validator.validate(entity, rules);

      expect(result.valid).toBe(true);
    });

    it('should fail on type mismatch', () => {
      const entity = { name: 123 };
      const rules = [{ field: 'name', type: 'string' as const }];

      const result = validator.validate(entity, rules);

      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('type');
    });

    it('should validate allowed values', () => {
      const entity = { status: 'Active' };
      const rules = [{ field: 'status', allowedValues: ['Active', 'Completed', 'On Hold'] }];

      const result = validator.validate(entity, rules);

      expect(result.valid).toBe(true);
    });

    it('should fail on invalid value', () => {
      const entity = { status: 'Invalid' };
      const rules = [{ field: 'status', allowedValues: ['Active', 'Completed'] }];

      const result = validator.validate(entity, rules);

      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('invalid value');
    });

    it('should validate string length', () => {
      const entity = { name: 'Test' };
      const rules = [{ field: 'name', minLength: 2, maxLength: 10 }];

      const result = validator.validate(entity, rules);

      expect(result.valid).toBe(true);
    });

    it('should fail on string too short', () => {
      const entity = { name: 'A' };
      const rules = [{ field: 'name', minLength: 2 }];

      const result = validator.validate(entity, rules);

      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('at least');
    });

    it('should fail on string too long', () => {
      const entity = { name: 'Very Long Name' };
      const rules = [{ field: 'name', maxLength: 5 }];

      const result = validator.validate(entity, rules);

      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('at most');
    });

    it('should validate pattern', () => {
      const entity = { email: 'test@example.com' };
      const rules = [{ field: 'email', pattern: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/ }];

      const result = validator.validate(entity, rules);

      expect(result.valid).toBe(true);
    });

    it('should fail on pattern mismatch', () => {
      const entity = { email: 'invalid-email' };
      const rules = [{ field: 'email', pattern: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/ }];

      const result = validator.validate(entity, rules);

      expect(result.valid).toBe(false);
    });

    it('should run custom validation', () => {
      const entity = { age: 25 };
      const rules = [
        {
          field: 'age',
          custom: (value: unknown) => typeof value === 'number' && value >= 18,
        },
      ];

      const result = validator.validate(entity, rules);

      expect(result.valid).toBe(true);
    });

    it('should fail custom validation', () => {
      const entity = { age: 15 };
      const rules = [
        {
          field: 'age',
          custom: (value: unknown) => typeof value === 'number' && value >= 18,
        },
      ];

      const result = validator.validate(entity, rules);

      expect(result.valid).toBe(false);
    });

    it('should warn about unknown fields in strict mode', () => {
      const entity = { name: 'Test', extra: 'field' };
      const rules = [{ field: 'name', required: true }];
      const context = { options: { allowUnknownFields: false } };

      const result = validator.validate(entity, rules, context);

      expect(result.valid).toBe(true);
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0]).toContain('Unknown field');
    });
  });

  describe('validateRequired', () => {
    it('should validate all required fields present', () => {
      const entity = { name: 'Test', status: 'Active' };
      const result = validator.validateRequired(entity, ['name', 'status']);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect missing required fields', () => {
      const entity = { name: 'Test' };
      const result = validator.validateRequired(entity, ['name', 'status']);

      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('status');
    });

    it('should detect empty strings as missing', () => {
      const entity = { name: '' };
      const result = validator.validateRequired(entity, ['name']);

      expect(result.valid).toBe(false);
    });
  });

  describe('validateSelectOptions', () => {
    it('should validate select options', () => {
      const entity = { status: 'Active', priority: 'High' };
      const options = {
        status: ['Active', 'Completed', 'On Hold'],
        priority: ['High', 'Medium', 'Low'],
      };

      const result = validator.validateSelectOptions(entity, options);

      expect(result.valid).toBe(true);
    });

    it('should fail on invalid select value', () => {
      const entity = { status: 'Invalid' };
      const options = { status: ['Active', 'Completed'] };

      const result = validator.validateSelectOptions(entity, options);

      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('Invalid value');
    });

    it('should allow undefined values', () => {
      const entity = {};
      const options = { status: ['Active', 'Completed'] };

      const result = validator.validateSelectOptions(entity, options);

      expect(result.valid).toBe(true);
    });
  });

  describe('validateDates', () => {
    it('should validate Date objects', () => {
      const entity = { due: new Date('2026-01-01') };
      const result = validator.validateDates(entity, ['due']);

      expect(result.valid).toBe(true);
    });

    it('should validate ISO date strings', () => {
      const entity = { due: '2026-01-01T00:00:00.000Z' };
      const result = validator.validateDates(entity, ['due']);

      expect(result.valid).toBe(true);
    });

    it('should fail on invalid date format', () => {
      const entity = { due: 'not-a-date' };
      const result = validator.validateDates(entity, ['due']);

      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('Invalid date format');
    });

    it('should fail on invalid Date object', () => {
      const entity = { due: new Date('invalid') };
      const result = validator.validateDates(entity, ['due']);

      expect(result.valid).toBe(false);
    });

    it('should allow undefined dates', () => {
      const entity = {};
      const result = validator.validateDates(entity, ['due']);

      expect(result.valid).toBe(true);
    });
  });

  describe('validateRelations', () => {
    it('should validate relation IDs', () => {
      const entity = { projectId: 'proj-123' };
      const relations = { projectId: 'Projects' };

      const result = validator.validateRelations(entity, relations);

      expect(result.valid).toBe(true);
    });

    it('should validate array of relation IDs', () => {
      const entity = { teamIds: ['team-1', 'team-2'] };
      const relations = { teamIds: 'Teams' };

      const result = validator.validateRelations(entity, relations);

      expect(result.valid).toBe(true);
    });

    it('should fail on empty relation ID', () => {
      const entity = { projectId: '' };
      const relations = { projectId: 'Projects' };

      const result = validator.validateRelations(entity, relations);

      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('Invalid relation ID');
    });

    it('should warn on non-existent relation target', () => {
      const entity = { projectId: 'proj-999' };
      const relations = { projectId: 'Projects' };
      const existingIds = new Map([['Projects', new Set(['proj-123', 'proj-456'])]]);

      const result = validator.validateRelations(entity, relations, existingIds);

      expect(result.valid).toBe(true);
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0]).toContain('non-existent');
    });
  });

  describe('generateWarnings', () => {
    it('should warn on status changes', () => {
      const current = { status: 'Active' };
      const proposed = { status: 'Completed' };

      const result = validator.generateWarnings(current, proposed);

      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0]).toContain('Status change');
    });

    it('should warn when marking completed task as incomplete', () => {
      const current = { done: true };
      const proposed = { done: false };

      const result = validator.generateWarnings(current, proposed);

      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0]).toContain('incomplete');
    });

    it('should warn on past due dates', () => {
      const current = { due: new Date('2026-02-01') };
      const proposed = { due: new Date('2025-01-01') };

      const result = validator.generateWarnings(current, proposed);

      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0]).toContain('past');
    });

    it('should warn when removing relations', () => {
      const current = { projectId: 'proj-123', name: 'Task' };
      const proposed = { name: 'Task' };

      const result = validator.generateWarnings(current, proposed);

      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0]).toContain('Removing relation');
    });

    it('should not warn on normal changes', () => {
      const current = { name: 'Old Name' };
      const proposed = { name: 'New Name' };

      const result = validator.generateWarnings(current, proposed);

      expect(result.warnings).toHaveLength(0);
    });
  });
});
