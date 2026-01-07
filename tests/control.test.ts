import { describe, it, expect } from 'vitest';
import {
  ProposalSchema,
  ValidationResultSchema,
  GovernancePolicySchema,
  WorkflowTypeSchema,
  DatabaseTargetSchema,
  ChangeRequestSchema,
  CreateProjectRequestSchema,
  CreateTaskRequestSchema,
} from '../src/control/index.js';

describe('Control Layer Schemas', () => {
  describe('Proposal Schema', () => {
    it('should validate a valid proposal', () => {
      const proposal = {
        id: 'test-proposal-1',
        type: 'create',
        target: {
          database: 'tasks',
        },
        intent: {
          action: 'Create new task',
        },
        currentState: null,
        proposedState: {
          name: 'Update documentation',
          priority: 'High',
        },
        validation: {
          valid: true,
          errors: [],
          warnings: [],
        },
        status: 'pending',
        createdAt: new Date(),
      };

      const result = ProposalSchema.safeParse(proposal);
      expect(result.success).toBe(true);
    });

    it('should enforce required fields', () => {
      const invalidProposal = {
        id: 'test-proposal-2',
        // missing required fields
      };

      const result = ProposalSchema.safeParse(invalidProposal);
      expect(result.success).toBe(false);
    });

    it('should validate proposal status values', () => {
      const statuses = ['pending', 'approved', 'applied', 'rejected', 'failed'];

      statuses.forEach((status) => {
        const proposal = {
          id: `test-${status}`,
          type: 'create',
          target: { database: 'tasks' },
          intent: { action: 'test' },
          currentState: null,
          proposedState: {},
          validation: { valid: true, errors: [], warnings: [] },
          status,
          createdAt: new Date(),
        };

        const result = ProposalSchema.safeParse(proposal);
        expect(result.success).toBe(true);
      });
    });
  });

  describe('Validation Result Schema', () => {
    it('should validate a valid validation result', () => {
      const validationResult = {
        valid: true,
        errors: [],
        warnings: [
          {
            field: 'test',
            rule: 'custom',
            severity: 'warning',
            message: 'This is a warning',
          },
        ],
        info: [
          {
            field: 'test',
            rule: 'custom',
            severity: 'info',
            message: 'This is info',
          },
        ],
      };

      const result = ValidationResultSchema.safeParse(validationResult);
      expect(result.success).toBe(true);
    });

    it('should accept validation results with errors', () => {
      const validationResult = {
        valid: false,
        errors: [
          {
            field: 'name',
            rule: 'required',
            severity: 'error',
            message: 'Field is required',
          },
        ],
        warnings: [],
      };

      const result = ValidationResultSchema.safeParse(validationResult);
      expect(result.success).toBe(true);
    });
  });

  describe('Database Target Schema', () => {
    it('should validate all database targets', () => {
      const databases = [
        'teams',
        'projects',
        'tasks',
        'meetings',
        'prompts',
        'tech-stack',
        'templates',
        'sops',
        'calendar',
      ];

      databases.forEach((db) => {
        const result = DatabaseTargetSchema.safeParse(db);
        expect(result.success).toBe(true);
      });
    });

    it('should reject invalid database targets', () => {
      const result = DatabaseTargetSchema.safeParse('invalid-database');
      expect(result.success).toBe(false);
    });
  });

  describe('Workflow Type Schema', () => {
    it('should validate workflow types', () => {
      const types = [
        'sprint-cycle',
        'daily-standup',
        'sprint-planning',
        'post-mortem',
        'team-sync',
        'ad-hoc',
      ];

      types.forEach((type) => {
        const result = WorkflowTypeSchema.safeParse(type);
        expect(result.success).toBe(true);
      });
    });
  });

  describe('Change Request Schema', () => {
    it('should validate create project request', () => {
      const request = {
        type: 'create-project',
        title: 'API Integration',
        domain: 'ENG',
        milestone: 'M2',
        team: 'engineering-team-id',
        status: 'Active',
      };

      const result = CreateProjectRequestSchema.safeParse(request);
      expect(result.success).toBe(true);
    });

    it('should validate create task request', () => {
      const request = {
        type: 'create-task',
        name: 'Update documentation',
        priority: 'High',
      };

      const result = CreateTaskRequestSchema.safeParse(request);
      expect(result.success).toBe(true);
    });

    it('should reject task name without verb-object format', () => {
      const request = {
        type: 'create-task',
        name: 'documentation', // missing verb
        priority: 'High',
      };

      const result = CreateTaskRequestSchema.safeParse(request);
      expect(result.success).toBe(false);
    });

    it('should validate discriminated union', () => {
      const projectRequest = {
        type: 'create-project',
        title: 'Test Project',
        domain: 'ENG',
        team: 'team-id',
        status: 'Active',
      };

      const taskRequest = {
        type: 'create-task',
        name: 'Complete testing',
        priority: 'Medium',
      };

      expect(ChangeRequestSchema.safeParse(projectRequest).success).toBe(true);
      expect(ChangeRequestSchema.safeParse(taskRequest).success).toBe(true);
    });
  });

  describe('Governance Policy Schema', () => {
    it('should validate a governance policy', () => {
      const policy = {
        version: '1.0',
        enabled: true,
        rules: [],
        safetyWorkflow: {
          enabled: true,
          steps: {
            propose: { required: true, includesDiff: true, includesSideEffects: true },
            approve: { required: true, keyword: 'Approved' },
            apply: { requiresVerification: true, rollbackOnFailure: false },
            verify: { required: true, requery: true },
          },
        },
        defaults: {
          allowedOperations: ['search', 'list-databases'],
          requiresApproval: ['create-page', 'update-page'],
          disallowed: ['delete-page-bulk'],
          bulkOperationLimit: 50,
          requiresDryRun: true,
        },
      };

      const result = GovernancePolicySchema.safeParse(policy);
      expect(result.success).toBe(true);
    });
  });

  describe('Schema Integration', () => {
    it('should work together for a complete workflow', () => {
      // 1. Create a change request
      const changeRequest = {
        type: 'create-task',
        name: 'Implement feature',
        priority: 'High',
      };

      const changeResult = ChangeRequestSchema.safeParse(changeRequest);
      expect(changeResult.success).toBe(true);

      // 2. Create a proposal from the change request
      const proposal = {
        id: 'proposal-workflow-test',
        type: 'create',
        target: { database: 'tasks' },
        intent: { action: 'Create task from change request' },
        currentState: null,
        proposedState: changeRequest,
        validation: { valid: true, errors: [], warnings: [] },
        status: 'pending',
        createdAt: new Date(),
      };

      const proposalResult = ProposalSchema.safeParse(proposal);
      expect(proposalResult.success).toBe(true);

      // 3. Validate the proposal
      const validation = {
        valid: true,
        errors: [],
        warnings: [],
        info: [],
      };

      const validationResult = ValidationResultSchema.safeParse(validation);
      expect(validationResult.success).toBe(true);
    });
  });
});
