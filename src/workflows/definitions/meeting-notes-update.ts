/**
 * Meeting Notes Update Workflow Definition
 *
 * Updates meeting records with action items and links to tasks.
 * Ensures meeting outcomes are properly tracked.
 */

import type { WorkflowDefinition } from './types';

/**
 * Meeting Notes Update Workflow
 *
 * Triggers: "update meeting notes", "add action items", "record meeting outcomes"
 *
 * Steps:
 * 1. Query meeting by date or name
 * 2. Query related tasks (action items)
 * 3. Generate proposal to update meeting page
 * 4. Link action items to meeting
 * 5. Update meeting metadata
 *
 * Output: Change proposal for meeting updates
 */
export const meetingNotesUpdateWorkflow: WorkflowDefinition = {
  id: 'meeting-notes-update',
  name: 'Meeting Notes Update',
  triggers: [
    'update meeting notes',
    'add action items',
    'record meeting outcomes',
    'update meeting',
    'add meeting action items',
    'link tasks to meeting',
  ],

  steps: [
    {
      phase: 'query',
      description: 'Retrieve meeting by identifier (date or name)',
      mcpTool: 'query-data-source',
      parameters: {
        database_id: '2caa4e63-bf23-815a-8981-000bbdbb7f0b', // Meetings database
        // Filter will be dynamic based on meeting identifier
        filter: {
          property: 'Date',
          date: {
            equals: 'today', // Will be replaced with actual date
          },
        },
      },
      output: 'meeting',
    },
    {
      phase: 'query',
      description: 'Retrieve tasks created or updated during meeting timeframe',
      mcpTool: 'query-data-source',
      parameters: {
        database_id: '2d5a4e63-bf23-8137-8277-000b41c867c3', // Tasks database
        filter: {
          property: 'Created time',
          date: {
            equals: 'today', // Will be replaced with meeting date
          },
        },
      },
      output: 'actionItemTasks',
    },
    {
      phase: 'analysis',
      description: 'Extract action items from meeting content',
      pure: true,
      function: 'extractActionItemsFromContent',
      output: 'extractedActionItems',
    },
    {
      phase: 'analysis',
      description: 'Match action items with existing tasks',
      pure: true,
      function: 'matchActionItemsToTasks',
      output: 'matchedActionItems',
    },
    {
      phase: 'proposal',
      description: 'Generate proposal to update meeting page with notes',
      mcpTool: 'patch-page',
      parameters: {
        // page_id will be dynamic from queried meeting
        properties: {
          // Action Items relation will be updated
          'Action Items': {
            relation: [], // Will be populated with task IDs
          },
        },
      },
      output: 'meetingUpdateProposal',
    },
    {
      phase: 'proposal',
      description: 'Generate proposal to append notes as blocks to meeting page',
      mcpTool: 'patch-block-children',
      parameters: {
        // block_id will be dynamic from meeting page
        children: [
          // Will be populated with note blocks
        ],
      },
      output: 'notesAppendProposal',
    },
    {
      phase: 'proposal',
      description: 'Generate proposal to link tasks to meeting',
      mcpTool: 'patch-page',
      parameters: {
        // For each task, update its properties
        // Will be batched for multiple tasks
      },
      output: 'taskLinkProposal',
    },
  ],

  verification: {
    description: 'Confirm meeting notes and action items are properly recorded',
    checks: [
      'Meeting page is correctly identified',
      'All action items are linked to meeting',
      'Notes are appended to meeting page',
      'Task-meeting relationships are bidirectional',
      'Meeting metadata is updated correctly',
    ],
  },

  metadata: {
    category: 'meeting-management',
    tags: ['meeting', 'notes', 'action-items', 'documentation'],
    version: '1.0.0',
    author: 'Digital Herencia',
  },
};
