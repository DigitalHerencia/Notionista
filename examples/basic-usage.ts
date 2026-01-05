/**
 * Example: Basic Repository Usage
 * 
 * This example demonstrates the core repository operations and safety workflow.
 */

import {
  TeamRepository,
  ProjectRepository,
  TaskRepository,
  MockMcpClient,
  type ChangeProposal,
  type Team,
  type Project,
  type Task,
} from '../src';

async function main() {
  // Initialize repositories with mock client
  const client = new MockMcpClient();
  const teamRepo = new TeamRepository(client);
  const projectRepo = new ProjectRepository(client);
  const taskRepo = new TaskRepository(client);

  console.log('=== Notionista SDK Example ===\n');

  // ============================================
  // Example 1: Create a Team (Safety Workflow)
  // ============================================
  console.log('1. Creating a team using safety workflow...');
  
  const teamProposal = await teamRepo.create({
    name: 'Engineering Team',
  });

  console.log('   - Proposal type:', teamProposal.type);
  console.log('   - Proposal ID:', teamProposal.id);
  console.log('   - Current state:', teamProposal.currentState);
  console.log('   - Proposed state:', teamProposal.proposedState);
  console.log('   - Property diffs:', teamProposal.diff.length, 'changes');
  console.log('   - Validation:', teamProposal.validation.valid ? 'VALID' : 'INVALID');

  // Apply the proposal
  const engineeringTeam = await teamRepo.executeCreate(teamProposal);
  console.log('   ✓ Team created:', engineeringTeam.name, `(${engineeringTeam.id})\n`);

  // ============================================
  // Example 2: Create a Project
  // ============================================
  console.log('2. Creating a project...');
  
  const projectProposal = await projectRepo.create({
    name: 'Q1 2026 Sprint',
    status: 'Active',
    milestone: 'M1',
    phase: 'P1.1',
    domain: 'ENG',
    startDate: '2026-01-01',
    endDate: '2026-01-14',
    teamId: engineeringTeam.id,
  });

  const project = await projectRepo.executeCreate(projectProposal);
  console.log('   ✓ Project created:', project.name);
  console.log('     - Status:', project.status);
  console.log('     - Milestone:', project.milestone);
  console.log('     - Phase:', project.phase, '\n');

  // ============================================
  // Example 3: Create Tasks
  // ============================================
  console.log('3. Creating tasks...');
  
  const tasks = await Promise.all([
    taskRepo.create({
      name: 'Implement authentication',
      done: false,
      priority: 'High',
      due: '2026-01-05',
      projectId: project.id,
      teamId: engineeringTeam.id,
    }),
    taskRepo.create({
      name: 'Write documentation',
      done: false,
      priority: 'Medium',
      due: '2026-01-10',
      projectId: project.id,
      teamId: engineeringTeam.id,
    }),
    taskRepo.create({
      name: 'Setup CI/CD',
      done: true,
      priority: 'High',
      due: '2026-01-03',
      projectId: project.id,
      teamId: engineeringTeam.id,
    }),
  ]);

  const createdTasks = await Promise.all(
    tasks.map(proposal => taskRepo.executeCreate(proposal))
  );

  console.log('   ✓ Created', createdTasks.length, 'tasks');
  createdTasks.forEach(task => {
    console.log(`     - [${task.done ? '✓' : ' '}] ${task.name} (${task.priority})`);
  });

  // ============================================
  // Example 4: Update a Task
  // ============================================
  console.log('\n4. Updating a task (marking as done)...');
  
  const taskToUpdate = createdTasks[0]!;
  const updateProposal = await taskRepo.update(taskToUpdate.id, {
    done: true,
  });

  console.log('   - Current state:', updateProposal.currentState?.done ? 'done' : 'incomplete');
  console.log('   - Proposed state:', updateProposal.proposedState.done ? 'done' : 'incomplete');
  
  const doneChange = updateProposal.diff.find(d => d.property === 'done');
  if (doneChange) {
    console.log('   - Change impact:', doneChange.impact);
  }

  const updatedTask = await taskRepo.executeUpdate(updateProposal);
  console.log('   ✓ Task updated:', updatedTask.name, '- Status:', updatedTask.done ? 'Done' : 'Todo', '\n');

  // ============================================
  // Example 5: Query and Filter
  // ============================================
  console.log('5. Querying data...');
  
  // Find incomplete tasks
  const incompleteTasks = await taskRepo.findIncomplete();
  console.log('   - Incomplete tasks:', incompleteTasks.length);

  // Find high priority tasks
  const highPriorityTasks = await taskRepo.findHighPriority();
  console.log('   - High priority tasks:', highPriorityTasks.length);

  // Calculate project completion rate
  const completionRate = await taskRepo.getProjectCompletionRate(project.id);
  console.log('   - Project completion:', completionRate.toFixed(1), '%');

  // Find active projects
  const activeProjects = await projectRepo.findActive();
  console.log('   - Active projects:', activeProjects.length);

  // Get team metrics
  const metrics = await teamRepo.getMetrics(engineeringTeam.id);
  console.log('   - Team metrics:');
  console.log('     * Total projects:', metrics.totalProjects);
  console.log('     * Total tasks:', metrics.totalTasks);
  console.log('     * Tasks completed:', metrics.tasksCompleted, '\n');

  // ============================================
  // Example 6: Error Handling
  // ============================================
  console.log('6. Error handling...');
  
  try {
    await teamRepo.findByIdOrThrow('non-existent-id');
  } catch (error: any) {
    console.log('   ✓ Caught expected error:', error.message, '\n');
  }

  console.log('=== Example Complete ===');
}

// Run the example
main().catch(console.error);
