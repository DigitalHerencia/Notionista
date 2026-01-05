/**
 * Example: Bulk Update Operations
 * 
 * This example demonstrates safe bulk update operations with:
 * - Batch size limits (max 50 items)
 * - Dry-run summaries
 * - Progress tracking
 * - Error handling
 */

import { NotionistaSdk } from '../src';
import { BulkOperationManager } from '../src/domain/bulk-operations';

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
    // Example 1: Small Batch Update
    // ========================================
    console.log('📦 Example 1: Small batch update (safe)');
    console.log('═'.repeat(60));

    // Get some incomplete tasks
    const tasksToUpdate = await sdk.tasks.findMany({
      where: { done: false, priority: { isEmpty: true } },
      limit: 5,
    });

    if (tasksToUpdate.length === 0) {
      console.log('No tasks found to update\n');
    } else {
      console.log(`Found ${tasksToUpdate.length} tasks without priority\n`);

      // Create bulk update proposal
      const bulkProposal = await sdk.tasks.bulkUpdate(
        tasksToUpdate.map(task => ({
          id: task.id,
          updates: { priority: 'Medium' },
        }))
      );

      console.log('📋 Bulk Update Proposal:');
      console.log('─'.repeat(60));
      console.log(`  Items: ${bulkProposal.items.length}`);
      console.log(`  Status: ${bulkProposal.status}`);
      console.log(`  Estimated duration: ${bulkProposal.estimatedDuration}ms`);
      console.log();

      // Show detailed changes
      console.log('📝 Changes:');
      bulkProposal.items.forEach((item, index) => {
        console.log(`  ${index + 1}. Task: ${tasksToUpdate[index].name}`);
        console.log(`     Change: priority → Medium`);
      });
      console.log();

      // Review and approve
      console.log('🤔 Reviewing bulk update...');
      console.log('   → Decision: APPROVE\n');

      await bulkProposal.approve();
      console.log('✓ Proposal approved\n');

      // Apply changes with progress tracking
      console.log('🚀 Applying changes...');
      const result = await bulkProposal.apply();

      console.log('✓ Bulk update complete!');
      console.log(`  Successful: ${result.successful}`);
      console.log(`  Failed: ${result.failed}`);
      console.log(`  Total time: ${result.duration}ms`);
      console.log();

      // Show results
      if (result.errors.length > 0) {
        console.log('⚠️  Errors:');
        result.errors.forEach(error => {
          console.log(`  • ${error.taskId}: ${error.message}`);
        });
      }
    }
    console.log();

    // ========================================
    // Example 2: Batch Size Limit Enforcement
    // ========================================
    console.log('📦 Example 2: Batch size limit enforcement');
    console.log('═'.repeat(60));

    try {
      console.log('\nAttempting to update 51 items (exceeds limit)...');
      
      const tooManyUpdates = Array(51).fill(null).map((_, i) => ({
        id: `task-${i}`,
        updates: { priority: 'High' },
      }));

      await sdk.tasks.bulkUpdate(tooManyUpdates);
      
    } catch (error) {
      console.log('❌ Error caught (as expected):');
      console.log(`   ${error.message}`);
      console.log('   → Batch operations limited to 50 items for safety');
    }
    console.log();

    // ========================================
    // Example 3: Dry Run
    // ========================================
    console.log('📦 Example 3: Dry run (preview without executing)');
    console.log('═'.repeat(60));

    const dryRunTasks = await sdk.tasks.findMany({
      where: { done: false },
      limit: 10,
    });

    console.log(`\nGenerating dry-run for ${dryRunTasks.length} tasks...\n`);

    const dryRunProposal = await sdk.tasks.bulkUpdate(
      dryRunTasks.map(task => ({
        id: task.id,
        updates: { priority: 'Low' },
      })),
      { dryRun: true }
    );

    console.log('📊 Dry Run Summary:');
    console.log('─'.repeat(60));
    console.log(dryRunProposal.dryRunSummary);
    console.log();
    console.log('ℹ️  This was a preview only - no changes applied');
    console.log();

    // ========================================
    // Example 4: Bulk Update with Error Handling
    // ========================================
    console.log('📦 Example 4: Bulk update with error handling');
    console.log('═'.repeat(60));

    const tasksForUpdate = await sdk.tasks.findMany({
      where: { done: false },
      limit: 3,
    });

    if (tasksForUpdate.length > 0) {
      console.log(`\nUpdating ${tasksForUpdate.length} tasks...\n`);

      try {
        const proposal = await sdk.tasks.bulkUpdate(
          tasksForUpdate.map(task => ({
            id: task.id,
            updates: { 
              priority: 'High',
              due: new Date('2026-01-15'),
            },
          })),
          { continueOnError: true }  // Continue even if some fail
        );

        await proposal.approve();
        const result = await proposal.apply();

        console.log('📊 Results:');
        console.log(`  Total: ${result.total}`);
        console.log(`  Successful: ${result.successful}`);
        console.log(`  Failed: ${result.failed}`);
        
        if (result.failed > 0) {
          console.log('\n⚠️  Failed items:');
          result.errors.forEach(error => {
            console.log(`  • ${error.id}: ${error.message}`);
          });
        }

      } catch (error) {
        console.error('❌ Bulk update failed:', error.message);
      }
    }
    console.log();

    // ========================================
    // Example 5: Progress Tracking
    // ========================================
    console.log('📦 Example 5: Progress tracking for large batches');
    console.log('═'.repeat(60));

    const largeBatchTasks = await sdk.tasks.findMany({
      where: { done: false },
      limit: 20,
    });

    if (largeBatchTasks.length > 0) {
      console.log(`\nUpdating ${largeBatchTasks.length} tasks with progress tracking...\n`);

      const proposal = await sdk.tasks.bulkUpdate(
        largeBatchTasks.map(task => ({
          id: task.id,
          updates: { priority: 'Medium' },
        }))
      );

      await proposal.approve();

      // Set up progress tracking
      proposal.on('progress', (event) => {
        const percent = ((event.completed / event.total) * 100).toFixed(0);
        process.stdout.write(`\r  Progress: ${percent}% (${event.completed}/${event.total})`);
      });

      await proposal.apply();
      console.log('\n✓ Batch update complete!\n');
    }

    // ========================================
    // Best Practices Summary
    // ========================================
    console.log('═'.repeat(60));
    console.log('✨ Bulk Update Best Practices');
    console.log('═'.repeat(60));
    console.log('\n📚 Key Takeaways:');
    console.log('   1. Batch operations limited to 50 items for safety');
    console.log('   2. Always use dry-run to preview large updates');
    console.log('   3. Use continueOnError for fault tolerance');
    console.log('   4. Track progress for large batches');
    console.log('   5. Handle errors gracefully');
    console.log('   6. Review proposals before applying');

  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  } finally {
    console.log('\n🔌 Disconnecting from MCP server...');
    await sdk.disconnect();
  }
}

// Run the example
main();
