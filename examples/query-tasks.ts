/**
 * Example: Query Tasks
 * 
 * This example demonstrates basic task querying capabilities including:
 * - Querying all tasks
 * - Filtering by completion status
 * - Filtering by priority
 * - Ordering results
 * - Working with due dates
 */

import { NotionistaSdk } from '../src';

// Initialize the SDK with your Notion token
const sdk = new NotionistaSdk({
  notionToken: process.env.NOTION_TOKEN!,
  logLevel: 'info',
});

async function main() {
  try {
    console.log('🔌 Connecting to Notion MCP server...\n');
    await sdk.connect();

    // Example 1: Query all incomplete tasks
    console.log('📋 Example 1: Query all incomplete tasks');
    console.log('─'.repeat(50));
    const incompleteTasks = await sdk.tasks.findMany({
      where: { done: false },
    });
    console.log(`Found ${incompleteTasks.length} incomplete tasks`);
    incompleteTasks.slice(0, 5).forEach(task => {
      console.log(`  • ${task.name} (Priority: ${task.priority || 'None'})`);
    });
    console.log();

    // Example 2: Query high-priority tasks
    console.log('🔥 Example 2: Query high-priority incomplete tasks');
    console.log('─'.repeat(50));
    const highPriorityTasks = await sdk.tasks.findMany({
      where: { 
        done: false,
        priority: 'High',
      },
    });
    console.log(`Found ${highPriorityTasks.length} high-priority tasks`);
    highPriorityTasks.forEach(task => {
      const dueDate = task.due ? new Date(task.due).toLocaleDateString() : 'No due date';
      console.log(`  • ${task.name}`);
      console.log(`    Due: ${dueDate}`);
    });
    console.log();

    // Example 3: Query tasks by due date
    console.log('📅 Example 3: Query tasks due this week');
    console.log('─'.repeat(50));
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    const tasksDueThisWeek = await sdk.tasks.findMany({
      where: {
        done: false,
        due: {
          onOrAfter: today.toISOString(),
          onOrBefore: nextWeek.toISOString(),
        },
      },
      orderBy: { due: 'ascending' },
    });
    
    console.log(`Found ${tasksDueThisWeek.length} tasks due this week`);
    tasksDueThisWeek.forEach(task => {
      const dueDate = new Date(task.due!).toLocaleDateString();
      console.log(`  • ${task.name} - Due: ${dueDate}`);
    });
    console.log();

    // Example 4: Query tasks by team
    console.log('👥 Example 4: Query tasks by team');
    console.log('─'.repeat(50));
    
    // First, get the Engineering team
    const teams = await sdk.teams.findMany({
      where: { name: { contains: 'Engineering' } },
    });
    
    if (teams.length > 0) {
      const engineeringTeam = teams[0];
      const teamTasks = await sdk.tasks.findMany({
        where: { teamId: engineeringTeam.id },
        limit: 10,
      });
      
      console.log(`Found ${teamTasks.length} tasks for ${engineeringTeam.name}`);
      teamTasks.forEach(task => {
        const status = task.done ? '✓' : '○';
        console.log(`  ${status} ${task.name}`);
      });
    } else {
      console.log('  Engineering team not found');
    }
    console.log();

    // Example 5: Query completed tasks
    console.log('✅ Example 5: Recently completed tasks');
    console.log('─'.repeat(50));
    const completedTasks = await sdk.tasks.findMany({
      where: { done: true },
      orderBy: { completedAt: 'descending' },
      limit: 5,
    });
    
    console.log(`Found ${completedTasks.length} recently completed tasks`);
    completedTasks.forEach(task => {
      console.log(`  ✓ ${task.name}`);
      if (task.completedAt) {
        console.log(`    Completed: ${new Date(task.completedAt).toLocaleDateString()}`);
      }
    });
    console.log();

    // Example 6: Query tasks with project information
    console.log('🎯 Example 6: Tasks with project context');
    console.log('─'.repeat(50));
    const tasksWithProjects = await sdk.tasks.findMany({
      where: { 
        done: false,
        projectId: { isNotEmpty: true },
      },
      limit: 5,
    });
    
    for (const task of tasksWithProjects) {
      console.log(`  • ${task.name}`);
      if (task.projectId) {
        const project = await sdk.projects.findById(task.projectId);
        if (project) {
          console.log(`    Project: ${project.name} (${project.status})`);
        }
      }
    }
    console.log();

    // Example 7: Using the query builder
    console.log('🔧 Example 7: Advanced query with QueryBuilder');
    console.log('─'.repeat(50));
    const query = sdk.tasks.queryBuilder()
      .where('done', 'equals', false)
      .where('priority', 'equals', 'High')
      .orderBy('due', 'ascending')
      .limit(10);
    
    const advancedResults = await sdk.tasks.query(query);
    console.log(`Found ${advancedResults.length} tasks with advanced query`);
    advancedResults.forEach(task => {
      console.log(`  • ${task.name}`);
    });
    console.log();

    console.log('✨ All queries completed successfully!');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    console.log('\n🔌 Disconnecting from MCP server...');
    await sdk.disconnect();
  }
}

// Run the example
main();
