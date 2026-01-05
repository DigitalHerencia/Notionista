/**
 * Example: Using the Safety Layer Components
 * 
 * This example demonstrates how to use the DiffEngine, BatchLimiter, 
 * Validator, and ProposalManager components of the safety layer.
 */

import {
  ProposalManager,
  DiffEngine,
  BatchLimiter,
  Validator,
  type ValidationRule,
} from '../src/index.js';
import { DATABASE_IDS } from '../src/core/types/databases.js';

async function main() {
  console.log('🛡️  Safety Layer Components Demo');
  console.log('═'.repeat(70));
  console.log();

  // ========================================
  // 1. DiffEngine - Compare State Changes
  // ========================================
  console.log('1️⃣  DiffEngine - Computing Property Diffs');
  console.log('─'.repeat(70));
  
  const diffEngine = new DiffEngine();
  
  const currentTask = {
    name: 'Update documentation',
    priority: 'Low',
    done: false,
    due: new Date('2026-01-15'),
  };
  
  const proposedTask = {
    name: 'Update documentation',
    priority: 'High',
    done: false,
    due: new Date('2026-01-10'),
  };
  
  const diffs = diffEngine.computeDiff(currentTask, proposedTask);
  
  console.log(`\nFound ${diffs.length} changes:\n`);
  console.log(diffEngine.formatAsMarkdown(diffs));
  console.log(`\nSummary: ${diffEngine.generateSummary(diffs)}`);
  console.log();

  // ========================================
  // 2. Validator - Pre-change Validation
  // ========================================
  console.log('2️⃣  Validator - Validating Entity Data');
  console.log('─'.repeat(70));
  
  const validator = new Validator();
  
  // Valid entity
  const validTask = {
    name: 'Implement feature',
    priority: 'High',
    due: '2026-01-20T00:00:00.000Z',
  };
  
  const rules: ValidationRule[] = [
    { field: 'name', required: true, minLength: 3 },
    { field: 'priority', allowedValues: ['High', 'Medium', 'Low'] },
    { field: 'due', type: 'string' },
  ];
  
  const validResult = validator.validate(validTask, rules);
  console.log(`\nValidating valid task: ${validResult.valid ? '✅ PASS' : '❌ FAIL'}`);
  
  // Invalid entity
  const invalidTask = {
    name: 'AB', // too short
    priority: 'VeryHigh', // invalid value
  };
  
  const invalidResult = validator.validate(invalidTask, rules);
  console.log(`\nValidating invalid task: ${invalidResult.valid ? '✅ PASS' : '❌ FAIL'}`);
  
  if (!invalidResult.valid) {
    console.log('\nValidation Errors:');
    invalidResult.errors.forEach((error) => console.log(`  ❌ ${error}`));
  }
  
  // Warnings for suspicious changes
  const warningResult = validator.generateWarnings(
    { status: 'Active', done: true },
    { status: 'Completed', done: false }
  );
  
  if (warningResult.warnings.length > 0) {
    console.log('\n⚠️  Warnings:');
    warningResult.warnings.forEach((warning) => console.log(`  ⚠️  ${warning}`));
  }
  console.log();

  // ========================================
  // 3. BatchLimiter - Enforce Batch Limits
  // ========================================
  console.log('3️⃣  BatchLimiter - Managing Bulk Operations');
  console.log('─'.repeat(70));
  
  const batchLimiter = new BatchLimiter({
    maxBatchSize: 50,
    allowSplit: false,
  });
  
  // Valid batch
  const smallBatch = Array.from({ length: 25 }, (_, i) => ({ id: i }));
  console.log(`\nValidating batch of ${smallBatch.length} items:`);
  console.log(`  ✅ Within limit: ${batchLimiter.isWithinLimit(smallBatch.length)}`);
  
  // Dry-run summary
  const summary = batchLimiter.generateDryRunSummary(smallBatch.length);
  console.log(`\n${batchLimiter.formatSummary(summary)}`);
  
  // Try to exceed limit
  const largeBatch = Array.from({ length: 75 }, (_, i) => ({ id: i }));
  console.log(`\n\nValidating batch of ${largeBatch.length} items:`);
  console.log(`  ❌ Within limit: ${batchLimiter.isWithinLimit(largeBatch.length)}`);
  
  try {
    batchLimiter.validateBatchSize(largeBatch.length);
  } catch (error) {
    console.log(`  ❌ Error: ${(error as Error).message}`);
  }
  
  // Execute a small batch
  console.log('\n\nExecuting small batch...');
  const result = await batchLimiter.executeBatch(
    smallBatch.slice(0, 5),
    async (item) => {
      // Simulate processing
      await new Promise((resolve) => setTimeout(resolve, 10));
      return item.id;
    }
  );
  
  console.log(`\n${batchLimiter.formatResult(result)}`);
  console.log();

  // ========================================
  // 4. ProposalManager - Full Workflow
  // ========================================
  console.log('4️⃣  ProposalManager - Propose → Approve → Apply');
  console.log('─'.repeat(70));
  
  const proposalManager = new ProposalManager();
  
  // Create a proposal
  const proposal = await proposalManager.propose({
    type: 'create',
    target: { database: DATABASE_IDS.TASKS },
    currentState: null,
    proposedState: {
      name: 'Implement safety layer',
      priority: 'High',
      done: false,
    },
    diff: diffs,
    sideEffects: [
      {
        type: 'relation_update',
        description: 'Will link to project',
        affectedItems: ['project-123'],
      },
    ],
    validation: { valid: true, errors: [], warnings: [] },
  });
  
  console.log(`\n✓ Proposal created: ${proposal.id}`);
  console.log(`  Status: ${proposal.status}`);
  console.log(`  Type: ${proposal.type}`);
  
  // Format for review
  console.log('\n' + proposalManager.formatForReview(proposal));
  
  // Try to apply without approval (should fail)
  console.log('\n⚠️  Attempting to apply without approval...');
  try {
    await proposalManager.apply(proposal.id, async () => 'mock-id');
    console.log('  ❌ This should not happen!');
  } catch (error) {
    console.log(`  ✓ Correctly blocked: ${(error as Error).message}`);
  }
  
  // Approve and apply
  console.log('\n✅ Approving proposal...');
  proposalManager.approve(proposal.id);
  console.log(`  Status: ${proposalManager.get(proposal.id)?.status}`);
  
  console.log('\n🚀 Applying proposal...');
  const applyResult = await proposalManager.apply(
    proposal.id,
    async () => 'entity-abc123'
  );
  
  if (applyResult.success) {
    console.log(`  ✅ Successfully applied!`);
    console.log(`  Entity ID: ${applyResult.entityId}`);
    console.log(`  Final status: ${proposalManager.get(proposal.id)?.status}`);
  }
  
  // List all proposals
  console.log('\n\n📋 All Proposals:');
  const allProposals = proposalManager.list();
  allProposals.forEach((p) => {
    console.log(`  - ${p.id} (${p.type}): ${p.status}`);
  });
  
  console.log();
  console.log('═'.repeat(70));
  console.log('✅ Demo complete!');
  console.log();
}

// Run the demo
main().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
