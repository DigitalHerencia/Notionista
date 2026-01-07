/**
 * Natural Language Workflow Definitions
 *
 * This module exports declarative workflow definitions that map natural language
 * intents to structured query → proposal → verification steps.
 *
 * These are pure data structures and do NOT execute any MCP operations.
 * They serve as blueprints for workflow execution engines.
 */

export type { WorkflowDefinition, WorkflowStep, WorkflowVerification } from './types';

export { dailyAuditWorkflow } from './daily-audit';
export { taskCompletionVerificationWorkflow } from './task-completion-verification';
export { meetingNotesUpdateWorkflow } from './meeting-notes-update';
export { projectProgressReviewWorkflow } from './project-progress-review';

import { dailyAuditWorkflow } from './daily-audit';
import { taskCompletionVerificationWorkflow } from './task-completion-verification';
import { meetingNotesUpdateWorkflow } from './meeting-notes-update';
import { projectProgressReviewWorkflow } from './project-progress-review';
import type { WorkflowDefinition } from './types';

/**
 * Registry of all available workflow definitions
 */
export const workflowRegistry: Record<string, WorkflowDefinition> = {
  [dailyAuditWorkflow.id]: dailyAuditWorkflow,
  [taskCompletionVerificationWorkflow.id]: taskCompletionVerificationWorkflow,
  [meetingNotesUpdateWorkflow.id]: meetingNotesUpdateWorkflow,
  [projectProgressReviewWorkflow.id]: projectProgressReviewWorkflow,
};

/**
 * Get a workflow definition by ID
 */
export function getWorkflowById(id: string): WorkflowDefinition | undefined {
  return workflowRegistry[id];
}

/**
 * Find workflow definitions by natural language trigger
 */
export function findWorkflowByTrigger(trigger: string): WorkflowDefinition | undefined {
  const normalizedTrigger = trigger.toLowerCase().trim();

  for (const workflow of Object.values(workflowRegistry)) {
    const matches = workflow.triggers.some((t) =>
      normalizedTrigger.includes(t.toLowerCase())
    );

    if (matches) {
      return workflow;
    }
  }

  return undefined;
}

/**
 * Get all workflow definitions
 */
export function getAllWorkflows(): WorkflowDefinition[] {
  return Object.values(workflowRegistry);
}

/**
 * Get workflows by category
 */
export function getWorkflowsByCategory(category: string): WorkflowDefinition[] {
  return Object.values(workflowRegistry).filter(
    (workflow) => workflow.metadata?.category === category
  );
}

/**
 * Get workflows by tag
 */
export function getWorkflowsByTag(tag: string): WorkflowDefinition[] {
  return Object.values(workflowRegistry).filter((workflow) =>
    workflow.metadata?.tags?.includes(tag)
  );
}
