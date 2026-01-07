/**
 * Daily Audit Workflow Definition
 *
 * Reviews team progress, task completion, and identifies blockers.
 * Maps natural language audit requests to structured queries.
 */

import type { WorkflowDefinition } from './types';

/**
 * Daily Progress Audit Workflow
 *
 * Triggers: "audit progress", "daily audit", "check team status"
 *
 * Steps:
 * 1. Query tasks updated today
 * 2. Query all teams
 * 3. Calculate team metrics (pure function)
 * 4. Identify overdue tasks
 * 5. Generate audit report
 *
 * Output: Audit report with team progress and blockers
 */
export const dailyAuditWorkflow: WorkflowDefinition = {
  id: 'daily-audit',
  name: 'Daily Progress Audit',
  triggers: [
    'audit progress',
    'daily audit',
    'check team status',
    'show team progress',
    'generate daily report',
    'audit today',
  ],

  steps: [
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
      phase: 'query',
      description: 'Retrieve tasks updated today',
      mcpTool: 'query-data-source',
      parameters: {
        database_id: '2d5a4e63-bf23-8137-8277-000b41c867c3', // Tasks database
        filter: {
          property: 'Last edited time',
          date: {
            equals: 'today',
          },
        },
      },
      output: 'tasksUpdatedToday',
    },
    {
      phase: 'query',
      description: 'Retrieve all active tasks',
      mcpTool: 'query-data-source',
      parameters: {
        database_id: '2d5a4e63-bf23-8137-8277-000b41c867c3', // Tasks database
        filter: {
          property: 'Done',
          checkbox: {
            equals: false,
          },
        },
      },
      output: 'activeTasks',
    },
    {
      phase: 'query',
      description: 'Retrieve overdue tasks',
      mcpTool: 'query-data-source',
      parameters: {
        database_id: '2d5a4e63-bf23-8137-8277-000b41c867c3', // Tasks database
        filter: {
          and: [
            {
              property: 'Done',
              checkbox: {
                equals: false,
              },
            },
            {
              property: 'Due',
              date: {
                before: 'today',
              },
            },
          ],
        },
      },
      output: 'overdueTasks',
    },
    {
      phase: 'analysis',
      description: 'Calculate team metrics from fetched data',
      pure: true,
      function: 'calculateTeamMetricsForAudit',
      output: 'teamMetrics',
    },
    {
      phase: 'analysis',
      description: 'Generate audit summary report',
      pure: true,
      function: 'generateAuditReport',
      output: 'auditReport',
    },
  ],

  verification: {
    description: 'Confirm audit data matches expectations',
    checks: [
      'All teams are included in the report',
      'Task counts match database queries',
      'Overdue tasks are correctly identified',
      'Completion rates are calculated correctly',
      'Report data is from today',
    ],
  },

  metadata: {
    category: 'reporting',
    tags: ['audit', 'progress', 'daily', 'metrics'],
    version: '1.0.0',
    author: 'Digital Herencia',
  },
};
