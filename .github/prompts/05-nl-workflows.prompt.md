---
mode: 'agent'
description: 'Add canonical workflows for common Copilot intents - Issue 05/07'
tools: ['editFiles', 'codebase', 'terminal']
---

# Natural Language Workflows

**Epic:** Alignment Epic: Notionista → Copilot-Governed Control Plane
**Issue:** 05 of 07
**Depends on:** Issue 04 must be completed first
**PR Name:** `feat/nl-workflows`

## Objective

Define explicit workflow definitions that map common natural-language intents into structured query → proposal → verification steps. Do not execute MCP calls.

## Instructions

1. **Create workflow definitions** in `src/workflows/definitions/`
2. **Map natural language triggers** to structured steps
3. **Follow Query → Proposal → Verification pattern**
4. **Keep as pure data structures**, not executable code

## Required Workflows

1. **Daily Audit** - Progress review and metrics
2. **Task Completion Verification** - Verify tasks are properly completed
3. **Meeting Notes Update** - Update meeting records with action items
4. **Project Progress Review** - Sprint/milestone progress tracking

## Workflow Structure

```typescript
export interface WorkflowDefinition {
  id: string;
  name: string;
  triggers: string[]; // Natural language patterns
  
  steps: WorkflowStep[];
  
  verification: {
    description: string;
    checks: string[];
  };
}

export interface WorkflowStep {
  phase: 'query' | 'analysis' | 'proposal';
  description: string;
  mcpTool?: string;
  parameters?: Record<string, unknown>;
  pure?: boolean;
  function?: string;
  output?: string;
}
```

## Example

```typescript
export const dailyAuditWorkflow: WorkflowDefinition = {
  id: 'daily-audit',
  name: 'Daily Progress Audit',
  triggers: ['audit progress', 'daily audit', 'check team status'],
  steps: [
    {
      phase: 'query',
      description: 'Retrieve tasks updated today',
      mcpTool: 'query-data-source',
      parameters: { database: 'tasks', filter: { updated: 'today' } }
    },
    // ...more steps
  ],
  verification: {
    description: 'Confirm audit data matches expectations',
    checks: ['data freshness', 'completeness']
  }
};
```

## Acceptance Criteria

- [ ] Daily audit workflow defined
- [ ] Task completion verification workflow defined
- [ ] Meeting notes update workflow defined
- [ ] Project progress review workflow defined
- [ ] All workflows are pure data structures
- [ ] No MCP calls executed

## Output

After completion, create:

- **PR:** `feat/nl-workflows`
- **Run summary:** `docs/runs/05-nl-workflows.md`
