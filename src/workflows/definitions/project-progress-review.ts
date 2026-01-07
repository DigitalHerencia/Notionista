/**
 * Project Progress Review Workflow Definition
 *
 * Tracks sprint/milestone progress and identifies at-risk projects.
 * Provides comprehensive project status overview.
 */

import type { WorkflowDefinition } from './types';

/**
 * Project Progress Review Workflow
 *
 * Triggers: "review project progress", "check sprint status", "milestone progress"
 *
 * Steps:
 * 1. Query active projects
 * 2. Query tasks for each project
 * 3. Calculate completion rates
 * 4. Identify at-risk projects
 * 5. Generate progress report
 *
 * Output: Progress report with project metrics and recommendations
 */
export const projectProgressReviewWorkflow: WorkflowDefinition = {
  id: 'project-progress-review',
  name: 'Project Progress Review',
  triggers: [
    'review project progress',
    'check sprint status',
    'milestone progress',
    'sprint progress',
    'project status report',
    'check project health',
  ],

  steps: [
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
        sorts: [
          {
            property: 'End Date',
            direction: 'ascending',
          },
        ],
      },
      output: 'activeProjects',
    },
    {
      phase: 'query',
      description: 'Retrieve all tasks for active projects',
      mcpTool: 'query-data-source',
      parameters: {
        database_id: '2d5a4e63-bf23-8137-8277-000b41c867c3', // Tasks database
        // Will need to filter by project relations
      },
      output: 'projectTasks',
    },
    {
      phase: 'query',
      description: 'Retrieve teams associated with projects',
      mcpTool: 'query-data-source',
      parameters: {
        database_id: '2d5a4e63-bf23-816b-9f75-000b219f7713', // Teams database
      },
      output: 'teams',
    },
    {
      phase: 'analysis',
      description: 'Calculate project completion rates',
      pure: true,
      function: 'calculateProjectCompletionRates',
      output: 'completionRates',
    },
    {
      phase: 'analysis',
      description: 'Identify at-risk projects (low completion, near deadline)',
      pure: true,
      function: 'identifyAtRiskProjects',
      output: 'atRiskProjects',
    },
    {
      phase: 'analysis',
      description: 'Calculate days remaining until deadlines',
      pure: true,
      function: 'calculateProjectTimeRemaining',
      output: 'timeMetrics',
    },
    {
      phase: 'analysis',
      description: 'Determine if projects are on track',
      pure: true,
      function: 'assessProjectHealth',
      output: 'healthAssessment',
    },
    {
      phase: 'analysis',
      description: 'Group projects by milestone and phase',
      pure: true,
      function: 'groupProjectsByMilestone',
      output: 'milestoneGroups',
    },
    {
      phase: 'analysis',
      description: 'Generate comprehensive progress report',
      pure: true,
      function: 'generateProjectProgressReport',
      output: 'progressReport',
    },
  ],

  verification: {
    description: 'Confirm project progress data is accurate and complete',
    checks: [
      'All active projects are included in report',
      'Task completion rates are calculated correctly',
      'At-risk projects are properly identified',
      'Timeline metrics are accurate',
      'Milestone groupings are correct',
      'Team associations are verified',
    ],
  },

  metadata: {
    category: 'project-management',
    tags: ['project', 'progress', 'sprint', 'milestone', 'tracking'],
    version: '1.0.0',
    author: 'Digital Herencia',
  },
};
