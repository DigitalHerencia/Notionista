/**
 * Example: Analytics and Reporting
 * 
 * This example demonstrates generating analytics and reports including:
 * - Team performance metrics
 * - Project progress tracking
 * - Task completion rates
 * - Sprint reports
 */

import { NotionistaSdk } from '../src';
import { AnalyticsService } from '../src/domain/services/analytics';

// Initialize the SDK
const sdk = new NotionistaSdk({
  notionToken: process.env.NOTION_TOKEN!,
  logLevel: 'info',
});

async function main() {
  try {
    console.log('🔌 Connecting to Notion MCP server...\n');
    await sdk.connect();

    const analytics = new AnalyticsService(sdk);

    // ========================================
    // Example 1: Team Metrics
    // ========================================
    console.log('📊 Example 1: Team Performance Metrics');
    console.log('═'.repeat(60));

    // Get all teams
    const teams = await sdk.teams.findMany();
    
    if (teams.length === 0) {
      console.log('No teams found\n');
    } else {
      console.log(`Found ${teams.length} teams\n`);

      for (const team of teams) {
        const metrics = await analytics.getTeamMetrics(team.id);

        console.log(`\n📋 ${team.name}`);
        console.log('─'.repeat(60));
        console.log(`Projects:`);
        console.log(`  Total: ${metrics.totalProjects}`);
        console.log(`  Active: ${metrics.activeProjects}`);
        console.log(`  Completed: ${metrics.completedProjects}`);
        console.log(`  On Hold: ${metrics.onHoldProjects}`);
        console.log();
        console.log(`Tasks:`);
        console.log(`  Total: ${metrics.totalTasks}`);
        console.log(`  Completed: ${metrics.completedTasks}`);
        console.log(`  In Progress: ${metrics.inProgressTasks}`);
        console.log(`  Completion Rate: ${metrics.completionRate.toFixed(1)}%`);
        console.log();
        console.log(`Priority Breakdown:`);
        console.log(`  High: ${metrics.tasksByPriority.High || 0}`);
        console.log(`  Medium: ${metrics.tasksByPriority.Medium || 0}`);
        console.log(`  Low: ${metrics.tasksByPriority.Low || 0}`);
        console.log();
        
        if (metrics.overdueTasks > 0) {
          console.log(`⚠️  Overdue Tasks: ${metrics.overdueTasks}`);
        }
      }
    }
    console.log();

    // ========================================
    // Example 2: Project Progress Report
    // ========================================
    console.log('📊 Example 2: Project Progress Report');
    console.log('═'.repeat(60));

    const activeProjects = await sdk.projects.findMany({
      where: { status: 'Active' },
    });

    if (activeProjects.length === 0) {
      console.log('No active projects\n');
    } else {
      console.log(`\nFound ${activeProjects.length} active projects\n`);

      for (const project of activeProjects) {
        const report = await analytics.getProjectProgress(project.id);

        console.log(`\n🎯 ${project.name}`);
        console.log('─'.repeat(60));
        console.log(`Milestone: ${project.milestone || 'None'}`);
        console.log(`Phase: ${project.phase || 'None'}`);
        console.log(`Duration: ${report.durationDays} days`);
        console.log(`Progress: ${report.progressPercent.toFixed(1)}%`);
        console.log();
        console.log(`Tasks: ${report.completedTasks}/${report.totalTasks} completed`);
        
        if (report.remainingDays !== null) {
          console.log(`Remaining: ${report.remainingDays} days`);
        }
        
        // Progress bar (uses Unicode blocks by default; fall back to ASCII on
        // terminals that may not render block characters correctly)
        const barLength = 40;
        const filled = Math.round((report.progressPercent / 100) * barLength);
        const useAsciiBar =
          process.env.TERM === 'dumb' || process.env.CI === 'true';
        const filledChar = useAsciiBar ? '#' : '█';
        const emptyChar = useAsciiBar ? '-' : '░';
        const bar = filledChar.repeat(filled) + emptyChar.repeat(barLength - filled);
        console.log(`[${bar}] ${report.progressPercent.toFixed(1)}%`);
      }
    }
    console.log();

    // ========================================
    // Example 3: Sprint Report
    // ========================================
    console.log('📊 Example 3: Sprint Report');
    console.log('═'.repeat(60));

    // Find recent sprints (projects in the last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentSprints = await sdk.projects.findMany({
      where: {
        startDate: { onOrAfter: thirtyDaysAgo.toISOString() },
      },
      limit: 3,
    });

    if (recentSprints.length === 0) {
      console.log('\nNo recent sprints found\n');
    } else {
      for (const sprint of recentSprints) {
        const report = await analytics.generateSprintReport(sprint.id);

        console.log(`\n🏃 ${report.name}`);
        console.log('─'.repeat(60));
        console.log(`Status: ${report.status}`);
        console.log(`Duration: ${report.startDate} - ${report.endDate}`);
        console.log(`Days: ${report.durationDays}`);
        console.log();
        console.log(`Velocity: ${report.velocity.toFixed(1)} tasks/day`);
        console.log(`Burndown: ${report.remainingTasks} tasks remaining`);
        console.log();
        console.log(`Task Breakdown:`);
        console.log(`  Completed: ${report.completedTasks}`);
        console.log(`  In Progress: ${report.inProgressTasks}`);
        console.log(`  Not Started: ${report.notStartedTasks}`);
        console.log(`  Total: ${report.totalTasks}`);
        console.log();
        
        if (report.blockers.length > 0) {
          console.log(`🚧 Blockers (${report.blockers.length}):`);
          report.blockers.forEach(blocker => {
            console.log(`  • ${blocker.name}`);
          });
        }
      }
    }
    console.log();

    // ========================================
    // Example 4: Task Completion Trends
    // ========================================
    console.log('📊 Example 4: Task Completion Trends');
    console.log('═'.repeat(60));

    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date;
    });

    console.log('\nTasks completed per day (last 7 days):\n');

    for (const date of last7Days) {
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);

      const completedTasks = await sdk.tasks.findMany({
        where: {
          done: true,
          completedAt: {
            onOrAfter: date.toISOString(),
            before: nextDay.toISOString(),
          },
        },
      });

      const dateStr = date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
      
      const bar = '█'.repeat(completedTasks.length);
      console.log(`  ${dateStr}: ${bar} ${completedTasks.length}`);
    }
    console.log();

    // ========================================
    // Example 5: Custom Analytics Query
    // ========================================
    console.log('📊 Example 5: Custom Analytics Query');
    console.log('═'.repeat(60));

    console.log('\nHigh-priority tasks by team:\n');

    for (const team of teams) {
      const highPriorityTasks = await sdk.tasks.findMany({
        where: {
          teamId: team.id,
          priority: 'High',
          done: false,
        },
      });

      if (highPriorityTasks.length > 0) {
        console.log(`  ${team.name}: ${highPriorityTasks.length} tasks`);
      }
    }
    console.log();

    // ========================================
    // Example 6: Export Report
    // ========================================
    console.log('📊 Example 6: Export Report to Markdown');
    console.log('═'.repeat(60));

    const report = await analytics.generateFullReport({
      includeTeams: true,
      includeProjects: true,
      includeTasks: true,
      format: 'markdown',
    });

    console.log('\n📄 Report generated:');
    console.log('─'.repeat(60));
    console.log(report.slice(0, 500) + '...');
    console.log('\n(truncated for display)');
    console.log();

    // Save to file
    const fs = await import('fs/promises');
    const reportPath = `/tmp/notion-report-${Date.now()}.md`;
    await fs.writeFile(reportPath, report);
    console.log(`✓ Full report saved to: ${reportPath}`);
    console.log();

    // ========================================
    // Summary
    // ========================================
    console.log('═'.repeat(60));
    console.log('✨ Analytics Capabilities Summary');
    console.log('═'.repeat(60));
    console.log('\n📊 Available Analytics:');
    console.log('   1. Team performance metrics');
    console.log('   2. Project progress tracking');
    console.log('   3. Sprint reports and velocity');
    console.log('   4. Task completion trends');
    console.log('   5. Custom queries and filters');
    console.log('   6. Export to various formats');
    console.log('\n💡 Use Cases:');
    console.log('   • Daily standup reports');
    console.log('   • Sprint retrospectives');
    console.log('   • Team performance reviews');
    console.log('   • Resource allocation');
    console.log('   • Bottleneck identification');

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
