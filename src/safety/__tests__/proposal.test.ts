import { describe, it, expect } from 'vitest';
import { ProposalManager } from '../proposal';
import { DATABASE_IDS } from '../../core/types';

describe('ProposalManager', () => {
  it('should create a declarative proposal with pending status', () => {
    const manager = new ProposalManager();

    const proposal = manager.propose({
      type: 'create',
      target: { database: DATABASE_IDS.TASKS },
      intent: {
        description: 'Create a new task in the Tasks database',
        mcpTool: 'post-page',
        parameters: {
          database_id: DATABASE_IDS.TASKS,
          properties: { name: 'Test Task' },
        },
      },
      diff: {
        before: null,
        after: { name: 'Test Task' },
        summary: '1 property added: name',
      },
      validation: { valid: true, errors: [], warnings: [] },
      risks: {
        level: 'low',
        factors: [],
        mitigations: [],
      },
      currentState: null,
      proposedState: { name: 'Test Task' },
      propertyDiffs: [],
      sideEffects: [],
    });

    expect(proposal.id).toBeDefined();
    expect(proposal.status).toBe('pending');
    expect(proposal.createdAt).toBeInstanceOf(Date);
    expect(proposal.intent.mcpTool).toBe('post-page');
    expect(proposal.diff.summary).toContain('added');
    expect(proposal.risks.level).toBe('low');
  });

  it('should approve a pending proposal', () => {
    const manager = new ProposalManager();

    const proposal = manager.propose({
      type: 'create',
      target: { database: DATABASE_IDS.TASKS },
      intent: {
        description: 'Create a new task',
        mcpTool: 'post-page',
        parameters: { database_id: DATABASE_IDS.TASKS },
      },
      diff: {
        before: null,
        after: { name: 'Test Task' },
        summary: 'Creating new task',
      },
      validation: { valid: true, errors: [], warnings: [] },
      risks: { level: 'low', factors: [], mitigations: [] },
      currentState: null,
      proposedState: { name: 'Test Task' },
      propertyDiffs: [],
      sideEffects: [],
    });

    manager.approve(proposal.id);

    const retrieved = manager.get(proposal.id);
    expect(retrieved?.status).toBe('approved');
  });

  it('should reject a pending proposal', () => {
    const manager = new ProposalManager();

    const proposal = manager.propose({
      type: 'create',
      target: { database: DATABASE_IDS.TASKS },
      intent: {
        description: 'Create a new task',
        mcpTool: 'post-page',
        parameters: { database_id: DATABASE_IDS.TASKS },
      },
      diff: {
        before: null,
        after: { name: 'Test Task' },
        summary: 'Creating new task',
      },
      validation: { valid: true, errors: [], warnings: [] },
      risks: { level: 'low', factors: [], mitigations: [] },
      currentState: null,
      proposedState: { name: 'Test Task' },
      propertyDiffs: [],
      sideEffects: [],
    });

    manager.reject(proposal.id);

    const retrieved = manager.get(proposal.id);
    expect(retrieved?.status).toBe('rejected');
  });

  it('should mark an approved proposal as applied', () => {
    const manager = new ProposalManager();

    const proposal = manager.propose({
      type: 'create',
      target: { database: DATABASE_IDS.TASKS },
      intent: {
        description: 'Create a new task',
        mcpTool: 'post-page',
        parameters: { database_id: DATABASE_IDS.TASKS },
      },
      diff: {
        before: null,
        after: { name: 'Test Task' },
        summary: 'Creating new task',
      },
      validation: { valid: true, errors: [], warnings: [] },
      risks: { level: 'low', factors: [], mitigations: [] },
      currentState: null,
      proposedState: { name: 'Test Task' },
      propertyDiffs: [],
      sideEffects: [],
    });

    manager.approve(proposal.id);
    manager.markApplied(proposal.id);

    const retrieved = manager.get(proposal.id);
    expect(retrieved?.status).toBe('applied');
    expect(retrieved?.appliedAt).toBeInstanceOf(Date);
  });

  it('should not mark a proposal as applied without approval', () => {
    const manager = new ProposalManager();

    const proposal = manager.propose({
      type: 'create',
      target: { database: DATABASE_IDS.TASKS },
      intent: {
        description: 'Create a new task',
        mcpTool: 'post-page',
        parameters: { database_id: DATABASE_IDS.TASKS },
      },
      diff: {
        before: null,
        after: { name: 'Test Task' },
        summary: 'Creating new task',
      },
      validation: { valid: true, errors: [], warnings: [] },
      risks: { level: 'low', factors: [], mitigations: [] },
      currentState: null,
      proposedState: { name: 'Test Task' },
      propertyDiffs: [],
      sideEffects: [],
    });

    expect(() => manager.markApplied(proposal.id)).toThrow('must be approved');
  });

  it('should not approve an already approved proposal', () => {
    const manager = new ProposalManager();

    const proposal = manager.propose({
      type: 'create',
      target: { database: DATABASE_IDS.TASKS },
      intent: {
        description: 'Create a new task',
        mcpTool: 'post-page',
        parameters: { database_id: DATABASE_IDS.TASKS },
      },
      diff: {
        before: null,
        after: { name: 'Test Task' },
        summary: 'Creating new task',
      },
      validation: { valid: true, errors: [], warnings: [] },
      risks: { level: 'low', factors: [], mitigations: [] },
      currentState: null,
      proposedState: { name: 'Test Task' },
      propertyDiffs: [],
      sideEffects: [],
    });

    manager.approve(proposal.id);

    expect(() => manager.approve(proposal.id)).toThrow('cannot be approved');
  });

  it('should format declarative proposal for review with intent and risks', () => {
    const manager = new ProposalManager();

    const proposal = manager.propose({
      type: 'create',
      target: { database: DATABASE_IDS.TASKS },
      intent: {
        description: 'Create a new task for testing',
        mcpTool: 'post-page',
        parameters: {
          database_id: DATABASE_IDS.TASKS,
          properties: { name: 'Test Task' },
        },
      },
      diff: {
        before: null,
        after: { name: 'Test Task' },
        summary: 'Creating new task with name property',
      },
      validation: {
        valid: true,
        errors: [],
        warnings: ['This is a test warning'],
      },
      risks: {
        level: 'medium',
        factors: ['New database entry', 'Affects team metrics'],
        mitigations: ['Validate before creation', 'Backup available'],
      },
      currentState: null,
      proposedState: { name: 'Test Task' },
      propertyDiffs: [
        {
          property: 'name',
          oldValue: null,
          newValue: 'Test Task',
          impact: 'medium',
        },
      ],
      sideEffects: [
        {
          type: 'relation_update',
          description: 'Updates project relation',
          affectedItems: ['project-1'],
        },
      ],
    });

    const formatted = manager.formatForReview(proposal);

    expect(formatted).toContain('Change Proposal');
    expect(formatted).toContain('create');
    expect(formatted).toContain('Intent');
    expect(formatted).toContain('post-page');
    expect(formatted).toContain('Diff Summary');
    expect(formatted).toContain('Creating new task');
    expect(formatted).toContain('Risk Assessment');
    expect(formatted).toContain('MEDIUM');
    expect(formatted).toContain('Risk Factors');
    expect(formatted).toContain('Mitigations');
    expect(formatted).toContain('Property Changes');
    expect(formatted).toContain('name');
    expect(formatted).toContain('Side Effects');
    expect(formatted).toContain('Warnings');
  });

  it('should list proposals by status', () => {
    const manager = new ProposalManager();

    manager.propose({
      type: 'create',
      target: { database: DATABASE_IDS.TASKS },
      intent: {
        description: 'Create task 1',
        mcpTool: 'post-page',
        parameters: {},
      },
      diff: {
        before: null,
        after: { name: 'Task 1' },
        summary: 'Creating task 1',
      },
      validation: { valid: true, errors: [], warnings: [] },
      risks: { level: 'low', factors: [], mitigations: [] },
      currentState: null,
      proposedState: { name: 'Task 1' },
      propertyDiffs: [],
      sideEffects: [],
    });

    const proposal2 = manager.propose({
      type: 'create',
      target: { database: DATABASE_IDS.TASKS },
      intent: {
        description: 'Create task 2',
        mcpTool: 'post-page',
        parameters: {},
      },
      diff: {
        before: null,
        after: { name: 'Task 2' },
        summary: 'Creating task 2',
      },
      validation: { valid: true, errors: [], warnings: [] },
      risks: { level: 'low', factors: [], mitigations: [] },
      currentState: null,
      proposedState: { name: 'Task 2' },
      propertyDiffs: [],
      sideEffects: [],
    });

    manager.approve(proposal2.id);

    const pending = manager.list('pending');
    const approved = manager.list('approved');

    expect(pending).toHaveLength(1);
    expect(approved).toHaveLength(1);
  });

  it('should mark a proposal as failed', () => {
    const manager = new ProposalManager();

    const proposal = manager.propose({
      type: 'create',
      target: { database: DATABASE_IDS.TASKS },
      intent: {
        description: 'Create a new task',
        mcpTool: 'post-page',
        parameters: { database_id: DATABASE_IDS.TASKS },
      },
      diff: {
        before: null,
        after: { name: 'Test Task' },
        summary: 'Creating new task',
      },
      validation: { valid: true, errors: [], warnings: [] },
      risks: { level: 'low', factors: [], mitigations: [] },
      currentState: null,
      proposedState: { name: 'Test Task' },
      propertyDiffs: [],
      sideEffects: [],
    });

    manager.approve(proposal.id);
    manager.markFailed(proposal.id);

    const retrieved = manager.get(proposal.id);
    expect(retrieved?.status).toBe('failed');
  });
});
