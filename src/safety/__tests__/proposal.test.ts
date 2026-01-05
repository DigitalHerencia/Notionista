import { describe, it, expect } from 'vitest';
import { ProposalManager } from '../proposal';
import { DATABASE_IDS } from '../../core/types';

describe('ProposalManager', () => {
  it('should create a proposal with pending status', async () => {
    const manager = new ProposalManager();

    const proposal = await manager.propose({
      type: 'create',
      target: { database: DATABASE_IDS.TASKS },
      currentState: null,
      proposedState: { name: 'Test Task' },
      diff: [],
      sideEffects: [],
      validation: { valid: true, errors: [], warnings: [] },
    });

    expect(proposal.id).toBeDefined();
    expect(proposal.status).toBe('pending');
    expect(proposal.createdAt).toBeInstanceOf(Date);
  });

  it('should approve a pending proposal', async () => {
    const manager = new ProposalManager();

    const proposal = await manager.propose({
      type: 'create',
      target: { database: DATABASE_IDS.TASKS },
      currentState: null,
      proposedState: { name: 'Test Task' },
      diff: [],
      sideEffects: [],
      validation: { valid: true, errors: [], warnings: [] },
    });

    manager.approve(proposal.id);

    const retrieved = manager.get(proposal.id);
    expect(retrieved?.status).toBe('approved');
  });

  it('should reject a pending proposal', async () => {
    const manager = new ProposalManager();

    const proposal = await manager.propose({
      type: 'create',
      target: { database: DATABASE_IDS.TASKS },
      currentState: null,
      proposedState: { name: 'Test Task' },
      diff: [],
      sideEffects: [],
      validation: { valid: true, errors: [], warnings: [] },
    });

    manager.reject(proposal.id);

    const retrieved = manager.get(proposal.id);
    expect(retrieved?.status).toBe('rejected');
  });

  it('should apply an approved proposal', async () => {
    const manager = new ProposalManager();

    const proposal = await manager.propose({
      type: 'create',
      target: { database: DATABASE_IDS.TASKS },
      currentState: null,
      proposedState: { name: 'Test Task' },
      diff: [],
      sideEffects: [],
      validation: { valid: true, errors: [], warnings: [] },
    });

    manager.approve(proposal.id);

    const executor = async () => 'entity-123';
    const result = await manager.apply(proposal.id, executor);

    expect(result.success).toBe(true);
    expect(result.entityId).toBe('entity-123');

    const retrieved = manager.get(proposal.id);
    expect(retrieved?.status).toBe('applied');
    expect(retrieved?.appliedAt).toBeInstanceOf(Date);
  });

  it('should not apply a proposal without approval', async () => {
    const manager = new ProposalManager();

    const proposal = await manager.propose({
      type: 'create',
      target: { database: DATABASE_IDS.TASKS },
      currentState: null,
      proposedState: { name: 'Test Task' },
      diff: [],
      sideEffects: [],
      validation: { valid: true, errors: [], warnings: [] },
    });

    const executor = async () => 'entity-123';

    await expect(manager.apply(proposal.id, executor)).rejects.toThrow('must be approved');
  });

  it('should not approve an already approved proposal', async () => {
    const manager = new ProposalManager();

    const proposal = await manager.propose({
      type: 'create',
      target: { database: DATABASE_IDS.TASKS },
      currentState: null,
      proposedState: { name: 'Test Task' },
      diff: [],
      sideEffects: [],
      validation: { valid: true, errors: [], warnings: [] },
    });

    manager.approve(proposal.id);

    expect(() => manager.approve(proposal.id)).toThrow('cannot be approved');
  });

  it('should format proposal for review', async () => {
    const manager = new ProposalManager();

    const proposal = await manager.propose({
      type: 'create',
      target: { database: DATABASE_IDS.TASKS },
      currentState: null,
      proposedState: { name: 'Test Task' },
      diff: [
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
      validation: {
        valid: true,
        errors: [],
        warnings: ['This is a test warning'],
      },
    });

    const formatted = manager.formatForReview(proposal);

    expect(formatted).toContain('Change Proposal');
    expect(formatted).toContain('create');
    expect(formatted).toContain('Property Changes');
    expect(formatted).toContain('name');
    expect(formatted).toContain('Side Effects');
    expect(formatted).toContain('Warnings');
  });

  it('should list proposals by status', async () => {
    const manager = new ProposalManager();

    await manager.propose({
      type: 'create',
      target: { database: DATABASE_IDS.TASKS },
      currentState: null,
      proposedState: { name: 'Task 1' },
      diff: [],
      sideEffects: [],
      validation: { valid: true, errors: [], warnings: [] },
    });

    const proposal2 = await manager.propose({
      type: 'create',
      target: { database: DATABASE_IDS.TASKS },
      currentState: null,
      proposedState: { name: 'Task 2' },
      diff: [],
      sideEffects: [],
      validation: { valid: true, errors: [], warnings: [] },
    });

    manager.approve(proposal2.id);

    const pending = manager.list('pending');
    const approved = manager.list('approved');

    expect(pending).toHaveLength(1);
    expect(approved).toHaveLength(1);
  });

  it('should handle failed proposal application', async () => {
    const manager = new ProposalManager();

    const proposal = await manager.propose({
      type: 'create',
      target: { database: DATABASE_IDS.TASKS },
      currentState: null,
      proposedState: { name: 'Test Task' },
      diff: [],
      sideEffects: [],
      validation: { valid: true, errors: [], warnings: [] },
    });

    manager.approve(proposal.id);

    const executor = async () => {
      throw new Error('Execution failed');
    };

    const result = await manager.apply(proposal.id, executor);

    expect(result.success).toBe(false);
    expect(result.error).toBeInstanceOf(Error);

    const retrieved = manager.get(proposal.id);
    expect(retrieved?.status).toBe('failed');
  });
});
