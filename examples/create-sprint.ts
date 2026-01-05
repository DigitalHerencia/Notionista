/**
 * Example: Create Sprint (Workflow Orchestration)
 * 
 * This example demonstrates high-level workflow orchestration for sprint planning.
 * A single workflow call creates a complete sprint including:
 * - A project with all metadata
 * - Multiple tasks linked to the project
 * - Sprint meetings (planning, standups, retrospective)
 * 
 * All changes go through the safety workflow (Propose → Approve → Apply).
 */

import { NotionistaSdk } from '../src';
import { SprintCycleWorkflow } from '../src/workflows';

// Initialize the SDK
const sdk = new NotionistaSdk({
  notionToken: process.env.NOTION_TOKEN!,
  logLevel: 'info',
});

async function main() {
  try {
    console.log('🔌 Connecting to Notion MCP server...\n');
    await sdk.connect();

    // Get the Engineering team
    console.log('🔍 Finding Engineering Team...');
    const teams = await sdk.teams.findMany({
      where: { name: { contains: 'Engineering' } },
    });

    if (teams.length === 0) {
      console.error('❌ Engineering team not found. Please create it first.');
      process.exit(1);
    }

    const engineeringTeam = teams[0];
    console.log(`✓ Found team: ${engineeringTeam.name} (ID: ${engineeringTeam.id})\n`);

    // ========================================
    // Configure Sprint
    // ========================================
    console.log('📋 Sprint Configuration');
    console.log('═'.repeat(60));

    const sprintConfig = {
      teamId: engineeringTeam.id,
      name: 'Sprint 2026-W02: SDK Foundation',
      startDate: new Date('2026-01-06'),
      endDate: new Date('2026-01-20'),
      milestone: 'M1' as const,
      phase: 'P1.1' as const,
      domain: 'ENG' as const,
      tasks: [
        {
          name: 'Set up TypeScript project structure',
          priority: 'High' as const,
          due: new Date('2026-01-08'),
        },
        {
          name: 'Implement MCP client layer',
          priority: 'High' as const,
          due: new Date('2026-01-10'),
        },
        {
          name: 'Create base repository pattern',
          priority: 'High' as const,
          due: new Date('2026-01-13'),
        },
        {
          name: 'Implement safety layer with proposals',
          priority: 'High' as const,
          due: new Date('2026-01-15'),
        },
        {
          name: 'Write unit tests for core modules',
          priority: 'Medium' as const,
          due: new Date('2026-01-17'),
        },
        {
          name: 'Create API documentation',
          priority: 'Medium' as const,
          due: new Date('2026-01-19'),
        },
      ],
    };

    console.log(`Team: ${engineeringTeam.name}`);
    console.log(`Sprint: ${sprintConfig.name}`);
    console.log(`Duration: ${sprintConfig.startDate.toLocaleDateString()} - ${sprintConfig.endDate.toLocaleDateString()}`);
    console.log(`Milestone: ${sprintConfig.milestone}`);
    console.log(`Phase: ${sprintConfig.phase}`);
    console.log(`Domain: ${sprintConfig.domain}`);
    console.log(`Tasks: ${sprintConfig.tasks.length}`);
    console.log();

    // ========================================
    // Phase 1: Plan Sprint (Propose)
    // ========================================
    console.log('🔵 Phase 1: PLAN SPRINT (Generate Proposals)');
    console.log('═'.repeat(60));
    
    const workflow = new SprintCycleWorkflow(sdk);
    
    console.log('🔄 Planning sprint...');
    const sprintProposal = await workflow.planSprint(sprintConfig);
    
    console.log('✓ Sprint planning complete (proposals created)');
    console.log();

    // ========================================
    // Phase 2: Review Proposals
    // ========================================
    console.log('🔵 Phase 2: REVIEW SPRINT PROPOSALS');
    console.log('═'.repeat(60));

    console.log('\n📊 Sprint Summary:');
    console.log('─'.repeat(60));
    console.log(sprintProposal.summary);
    console.log();

    console.log('📋 Project Proposal:');
    console.log('─'.repeat(60));
    console.log(sprintProposal.project.formatForReview());
    console.log();

    console.log(`📝 Task Proposals (${sprintProposal.tasks.length} tasks):`);
    console.log('─'.repeat(60));
    sprintProposal.tasks.forEach((taskProposal, index) => {
      console.log(`\nTask ${index + 1}:`);
      console.log(taskProposal.formatForReview());
    });
    console.log();

    console.log(`📅 Meeting Proposals (${sprintProposal.meetings.length} meetings):`);
    console.log('─'.repeat(60));
    sprintProposal.meetings.forEach((meetingProposal, index) => {
      console.log(`\nMeeting ${index + 1}:`);
      console.log(meetingProposal.formatForReview());
    });
    console.log();

    // Show validation results
    console.log('✅ Validation Results:');
    console.log('─'.repeat(60));
    console.log(`Project validation: ${sprintProposal.project.validation.isValid ? '✓ Passed' : '✗ Failed'}`);
    console.log(`Tasks validation: ${sprintProposal.tasks.every(t => t.validation.isValid) ? '✓ All passed' : '✗ Some failed'}`);
    console.log(`Meetings validation: ${sprintProposal.meetings.every(m => m.validation.isValid) ? '✓ All passed' : '✗ Some failed'}`);
    console.log();

    // Show side effects
    if (sprintProposal.sideEffects.length > 0) {
      console.log('⚠️  Side Effects:');
      console.log('─'.repeat(60));
      sprintProposal.sideEffects.forEach(effect => {
        console.log(`  ${effect.type}: ${effect.description}`);
        console.log(`    Affected items: ${effect.affectedItems.length}`);
      });
      console.log();
    }

    // ========================================
    // User Decision
    // ========================================
    console.log('🤔 Review Decision:');
    console.log('─'.repeat(60));
    console.log('   ✓ Sprint configuration looks good');
    console.log('   ✓ All tasks are properly defined');
    console.log('   ✓ Meetings are scheduled correctly');
    console.log('   ✓ Relations will be set up properly');
    console.log('   → Decision: APPROVE AND EXECUTE');
    console.log();

    // ========================================
    // Phase 3: Execute Sprint
    // ========================================
    console.log('🔵 Phase 3: EXECUTE SPRINT (Apply Proposals)');
    console.log('═'.repeat(60));

    console.log('\n🚀 Executing sprint creation...');
    console.log('   This will create:');
    console.log(`   - 1 project`);
    console.log(`   - ${sprintProposal.tasks.length} tasks`);
    console.log(`   - ${sprintProposal.meetings.length} meetings`);
    console.log();

    const sprintResult = await workflow.executeSprint(sprintProposal);

    console.log('✓ Sprint execution complete!');
    console.log();

    // ========================================
    // Display Results
    // ========================================
    console.log('📊 Execution Results:');
    console.log('═'.repeat(60));

    console.log('\n✅ Project Created:');
    console.log(`   Name: ${sprintResult.project.name}`);
    console.log(`   ID: ${sprintResult.project.id}`);
    console.log(`   Status: ${sprintResult.project.status}`);
    console.log(`   Milestone: ${sprintResult.project.milestone}`);
    console.log(`   Phase: ${sprintResult.project.phase}`);
    console.log();

    console.log('✅ Tasks Created:');
    sprintResult.tasks.forEach((task, index) => {
      const dueDate = task.due ? new Date(task.due).toLocaleDateString() : 'No due date';
      console.log(`   ${index + 1}. ${task.name}`);
      console.log(`      Priority: ${task.priority} | Due: ${dueDate}`);
      console.log(`      ID: ${task.id}`);
    });
    console.log();

    console.log('✅ Meetings Scheduled:');
    sprintResult.meetings.forEach((meeting, index) => {
      const meetingDate = meeting.date ? new Date(meeting.date).toLocaleString() : 'TBD';
      console.log(`   ${index + 1}. ${meeting.name}`);
      console.log(`      Type: ${meeting.type} | Date: ${meetingDate}`);
      console.log(`      ID: ${meeting.id}`);
    });
    console.log();

    // ========================================
    // Verify Relations
    // ========================================
    console.log('🔗 Verifying Relations:');
    console.log('═'.repeat(60));

    // Verify project → tasks relation
    const projectTasks = await sdk.tasks.findMany({
      where: { projectId: sprintResult.project.id },
    });
    console.log(`✓ Project has ${projectTasks.length} linked tasks`);

    // Verify team → project relation
    const teamProjects = await sdk.projects.findMany({
      where: { teamId: engineeringTeam.id },
    });
    console.log(`✓ Project is linked to ${engineeringTeam.name}`);

    // Verify meetings → project relation
    const projectMeetings = await sdk.meetings.findMany({
      where: { projectIds: { contains: sprintResult.project.id } },
    });
    console.log(`✓ Found ${projectMeetings.length} meetings linked to project`);
    console.log();

    // ========================================
    // Generate Sprint Report
    // ========================================
    console.log('📈 Sprint Report:');
    console.log('═'.repeat(60));
    
    const report = await workflow.generateSprintReport(sprintResult.project.id);
    
    console.log(`\nSprint: ${report.name}`);
    console.log(`Duration: ${report.duration} days`);
    console.log(`Progress: ${report.progress.toFixed(1)}% complete`);
    console.log(`\nTasks:`);
    console.log(`  Total: ${report.totalTasks}`);
    console.log(`  Completed: ${report.completedTasks}`);
    console.log(`  In Progress: ${report.inProgressTasks}`);
    console.log(`  Not Started: ${report.notStartedTasks}`);
    console.log(`\nBy Priority:`);
    console.log(`  High: ${report.tasksByPriority.High || 0}`);
    console.log(`  Medium: ${report.tasksByPriority.Medium || 0}`);
    console.log(`  Low: ${report.tasksByPriority.Low || 0}`);
    console.log();

    console.log('═'.repeat(60));
    console.log('✨ Sprint creation completed successfully!');
    console.log('═'.repeat(60));

    console.log('\n🎯 Next Steps:');
    console.log('   1. View the project in Notion');
    console.log('   2. Start working on tasks');
    console.log('   3. Attend scheduled meetings');
    console.log('   4. Track progress throughout the sprint');
    console.log('   5. Run daily standup reports');

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
