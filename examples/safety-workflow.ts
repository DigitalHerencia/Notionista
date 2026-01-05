/**
 * Example: Safety Workflow (Propose → Approve → Apply)
 * 
 * This example demonstrates the built-in safety workflow that prevents
 * accidental data loss by requiring explicit approval before mutations.
 * 
 * The workflow has three phases:
 * 1. Propose: Generate a change proposal (no execution yet)
 * 2. Review: Inspect the proposed changes
 * 3. Approve & Apply: Execute only after explicit approval
 */

import { NotionistaSdk } from '../src';

// Initialize the SDK
const sdk = new NotionistaSdk({
  notionToken: process.env.NOTION_TOKEN!,
  logLevel: 'info',
});

async function main() {
  try {
    console.log('🔌 Connecting to Notion MCP server...\n');
    await sdk.connect();

    // ========================================
    // Example 1: Create a New Task
    // ========================================
    console.log('📝 Example 1: Creating a new task with safety workflow');
    console.log('═'.repeat(60));
    
    // Phase 1: Propose the change (doesn't execute yet)
    console.log('\n🔵 Phase 1: PROPOSE');
    console.log('─'.repeat(60));
    const createProposal = await sdk.tasks.create({
      name: 'Review safety workflow documentation',
      priority: 'High',
      due: new Date('2026-01-20'),
    });
    
    console.log('✓ Proposal created (not yet executed)');
    console.log(`  Proposal ID: ${createProposal.id}`);
    console.log(`  Status: ${createProposal.status}`);
    console.log();

    // Phase 2: Review the proposed changes
    console.log('🔵 Phase 2: REVIEW');
    console.log('─'.repeat(60));
    console.log(createProposal.formatForReview());
    console.log();

    // Simulating user review process
    console.log('🤔 Reviewing proposed changes...');
    console.log('   - Task name looks good ✓');
    console.log('   - Priority is appropriate ✓');
    console.log('   - Due date is reasonable ✓');
    console.log('   → Decision: APPROVE\n');

    // Phase 3: Approve and apply
    console.log('🔵 Phase 3: APPROVE & APPLY');
    console.log('─'.repeat(60));
    
    await createProposal.approve();
    console.log('✓ Proposal approved');
    
    const result = await createProposal.apply();
    console.log('✓ Changes applied successfully');
    console.log(`  Created task ID: ${result.id}`);
    console.log(`  Task name: ${result.name}`);
    console.log();

    // ========================================
    // Example 2: Update a Task
    // ========================================
    console.log('\n📝 Example 2: Updating an existing task');
    console.log('═'.repeat(60));

    // Phase 1: Propose update
    console.log('\n🔵 Phase 1: PROPOSE');
    console.log('─'.repeat(60));
    const updateProposal = await sdk.tasks.update(result.id, {
      priority: 'Medium',
      done: false,
    });

    console.log('✓ Update proposal created');
    console.log();

    // Phase 2: Review changes with diff
    console.log('🔵 Phase 2: REVIEW (with diff)');
    console.log('─'.repeat(60));
    console.log(updateProposal.formatForReview());
    
    // Show the diff clearly
    console.log('\n📊 Property Changes:');
    updateProposal.diff.forEach(change => {
      console.log(`  ${change.property}:`);
      console.log(`    - Old: ${JSON.stringify(change.oldValue)}`);
      console.log(`    + New: ${JSON.stringify(change.newValue)}`);
      console.log(`    Impact: ${change.impact}`);
    });
    console.log();

    // Phase 3: Approve and apply
    console.log('🔵 Phase 3: APPROVE & APPLY');
    console.log('─'.repeat(60));
    await updateProposal.approve();
    await updateProposal.apply();
    console.log('✓ Task updated successfully');
    console.log();

    // ========================================
    // Example 3: Rejecting a Proposal
    // ========================================
    console.log('\n📝 Example 3: Rejecting a proposal');
    console.log('═'.repeat(60));

    console.log('\n🔵 Phase 1: PROPOSE');
    console.log('─'.repeat(60));
    const rejectProposal = await sdk.tasks.update(result.id, {
      done: true,  // Accidentally marking as done
    });

    console.log('✓ Proposal created');
    console.log();

    console.log('🔵 Phase 2: REVIEW');
    console.log('─'.repeat(60));
    console.log(rejectProposal.formatForReview());
    console.log();

    console.log('🤔 Reviewing proposed changes...');
    console.log('   - Wait, this task isn\'t actually done yet!');
    console.log('   → Decision: REJECT\n');

    console.log('🔵 Phase 3: REJECT');
    console.log('─'.repeat(60));
    await rejectProposal.reject();
    console.log('✓ Proposal rejected (no changes applied)');
    console.log(`  Status: ${rejectProposal.status}`);
    console.log();

    // ========================================
    // Example 4: Batch Operations with Safety
    // ========================================
    console.log('\n📝 Example 4: Batch operations with safety limits');
    console.log('═'.repeat(60));

    // Get some tasks to update
    const tasksToUpdate = await sdk.tasks.findMany({
      where: { done: false },
      limit: 3,
    });

    console.log(`\nFound ${tasksToUpdate.length} tasks to update in batch`);
    console.log();

    console.log('🔵 Phase 1: PROPOSE BATCH UPDATE');
    console.log('─'.repeat(60));
    
    const batchProposal = await sdk.tasks.bulkUpdate(
      tasksToUpdate.map(task => ({
        id: task.id,
        updates: { priority: 'Low' },
      }))
    );

    console.log('✓ Batch proposal created');
    console.log(`  Items in batch: ${batchProposal.items.length}`);
    console.log(`  Status: ${batchProposal.status}`);
    console.log();

    console.log('🔵 Phase 2: REVIEW BATCH');
    console.log('─'.repeat(60));
    console.log(batchProposal.formatForReview());
    console.log();

    console.log('Batch Summary:');
    console.log(`  • Total items: ${batchProposal.items.length}`);
    console.log(`  • All priorities will change to: Low`);
    console.log(`  • Estimated duration: ${batchProposal.estimatedDuration}ms`);
    console.log();

    console.log('🔵 Phase 3: APPROVE & APPLY BATCH');
    console.log('─'.repeat(60));
    await batchProposal.approve();
    const batchResult = await batchProposal.apply();
    
    console.log('✓ Batch update completed');
    console.log(`  Successful: ${batchResult.successful}`);
    console.log(`  Failed: ${batchResult.failed}`);
    console.log();

    // ========================================
    // Example 5: Safety Violations
    // ========================================
    console.log('\n📝 Example 5: Safety violations and limits');
    console.log('═'.repeat(60));

    try {
      console.log('\nAttempting to apply proposal without approval...');
      const unsafeProposal = await sdk.tasks.create({
        name: 'Unsafe task',
      });
      
      // Try to apply without approving
      await unsafeProposal.apply();
      
    } catch (error) {
      console.log('❌ Error caught (as expected):');
      console.log(`   ${error.message}`);
      console.log('   → Proposals must be approved before applying');
    }
    console.log();

    try {
      console.log('Attempting batch update exceeding limit (max 50)...');
      const tooManyItems = Array(51).fill(null).map((_, i) => ({
        id: `task-${i}`,
        updates: { priority: 'High' },
      }));
      
      await sdk.tasks.bulkUpdate(tooManyItems);
      
    } catch (error) {
      console.log('❌ Error caught (as expected):');
      console.log(`   ${error.message}`);
      console.log('   → Batch operations limited to 50 items for safety');
    }
    console.log();

    // ========================================
    // Cleanup: Delete the test task
    // ========================================
    console.log('\n🧹 Cleanup: Deleting test task');
    console.log('═'.repeat(60));
    
    const deleteProposal = await sdk.tasks.delete(result.id);
    console.log('\n🔵 Review deletion proposal:');
    console.log(deleteProposal.formatForReview());
    
    await deleteProposal.approve();
    await deleteProposal.apply();
    console.log('✓ Test task deleted');
    console.log();

    console.log('═'.repeat(60));
    console.log('✨ Safety workflow demonstration completed!');
    console.log('═'.repeat(60));
    console.log('\n📚 Key Takeaways:');
    console.log('   1. All mutations return proposals (not executed immediately)');
    console.log('   2. Review proposals before approving');
    console.log('   3. Proposals must be approved before applying');
    console.log('   4. Batch operations have safety limits (max 50 items)');
    console.log('   5. Proposals can be rejected to prevent unwanted changes');

  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('\n❌ Error:', error.message);
      if (error.stack) {
        console.error(error.stack);
      }
    } else {
      console.error('\n❌ Error:', error);
    }
    process.exit(1);
  } finally {
    console.log('\n🔌 Disconnecting from MCP server...');
    await sdk.disconnect();
  }
}

// Run the example
main();
