/**
 * Task Completion Verification Workflow Definition
 *
 * Verifies that tasks are properly completed and linked to projects.
 * Ensures task completion follows proper workflow.
 */

import type { WorkflowDefinition } from './types';

/**
 * Task Completion Verification Workflow
 *
 * Triggers: "verify task completion", "check completed tasks", "validate task status"
 *
 * Steps:
 * 1. Query recently completed tasks
 * 2. Query related projects
 * 3. Verify task-project relationships
 * 4. Check for orphaned completed tasks
 * 5. Generate verification report
 *
 * Output: Verification report with any issues or anomalies
 */
export const taskCompletionVerificationWorkflow: WorkflowDefinition = {
  id: 'task-completion-verification',
  name: 'Task Completion Verification',
  triggers: [
    'verify task completion',
    'check completed tasks',
    'validate task status',
    'audit completed tasks',
    'verify task done status',
    'check task completion',
  ],

  steps: [
    {
      phase: 'query',
      description: 'Retrieve recently completed tasks (last 7 days)',
      mcpTool: 'query-data-source',
      parameters: {
        database_id: '2d5a4e63-bf23-8137-8277-000b41c867c3', // Tasks database
        filter: {
          and: [
            {
              property: 'Done',
              checkbox: {
                equals: true,
              },
            },
            {
              property: 'Last edited time',
              date: {
                past_week: {},
              },
            },
          ],
        },
      },
      output: 'completedTasks',
    },
    {
      phase: 'query',
      description: 'Retrieve all active projects',
      mcpTool: 'query-data-source',
      parameters: {
        database_id: '2d5a4e63-bf23-8115-a70f-000bc1ef9d05', // Projects database
        filter: {
          property: 'Status',
          select: {
            equals: 'Active',
          },
        },
      },
      output: 'activeProjects',
    },
    {
      phase: 'query',
      description: 'Retrieve all teams',
      mcpTool: 'query-data-source',
      parameters: {
        database_id: '2d5a4e63-bf23-816b-9f75-000b219f7713', // Teams database
      },
      output: 'teams',
    },
    {
      phase: 'analysis',
      description: 'Verify task-project relationships',
      pure: true,
      function: 'verifyTaskProjectLinks',
      output: 'orphanedTasks',
    },
    {
      phase: 'analysis',
      description: 'Check for tasks without team assignment',
      pure: true,
      function: 'verifyTaskTeamLinks',
      output: 'unassignedTasks',
    },
    {
      phase: 'analysis',
      description: 'Validate task completion data integrity',
      pure: true,
      function: 'validateTaskCompletionIntegrity',
      output: 'integrityIssues',
    },
    {
      phase: 'analysis',
      description: 'Generate verification report',
      pure: true,
      function: 'generateVerificationReport',
      output: 'verificationReport',
    },
  ],

  verification: {
    description: 'Confirm all completed tasks are properly validated',
    checks: [
      'All completed tasks have valid project assignments',
      'All completed tasks have team assignments',
      'No orphaned tasks detected',
      'Task completion dates are within valid range',
      'All required task fields are populated',
    ],
  },

  metadata: {
    category: 'validation',
    tags: ['task', 'completion', 'verification', 'integrity'],
    version: '1.0.0',
    author: 'Digital Herencia',
  },
};
