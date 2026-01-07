# [Feature] Add canonical workflows for common Copilot intents

## Epic

## Alignment Epic: Notionista → Copilot-Governed Control Plane

**Issue:** 05 of 07  
**Execution Order:** Sequential (depends on Issue 04)  
**Assigned to:** GitHub Copilot (Cloud Agent)

---

## Problem Statement

Natural language requests from users are not mapped to explicit, structured workflows. When a user asks Copilot to "audit progress" or "update meeting notes," there's no canonical definition of what steps should occur and in what order.

## Proposed Solution

Define explicit workflow definitions that map common natural-language intents into structured steps:

1. **Query phase:** What data to retrieve
2. **Proposal phase:** What changes to propose
3. **Verification phase:** How to confirm success

Each workflow is a pure data structure, not executable code.

## Alternative Solutions

1. Let Copilot figure it out each time - **Rejected:** Inconsistent results
2. Hard-code in Copilot instructions - **Rejected:** Not type-safe or testable

## Use Case / Example

```typescript
// src/workflows/definitions/daily-audit.workflow.ts
export const dailyAuditWorkflow: WorkflowDefinition = {
  id: 'daily-audit',
  name: 'Daily Progress Audit',
  triggers: [
    'audit progress',
    'daily audit',
    'check team status',
    'what did we accomplish today'
  ],
  
  steps: [
    {
      phase: 'query',
      description: 'Retrieve all tasks updated today',
      mcpTool: 'query-data-source',
      parameters: {
        database: 'tasks',
        filter: { updated: 'today' }
      }
    },
    {
      phase: 'query', 
      description: 'Retrieve active projects',
      mcpTool: 'query-data-source',
      parameters: {
        database: 'projects',
        filter: { status: 'Active' }
      }
    },
    {
      phase: 'analysis',
      description: 'Calculate completion metrics',
      pure: true,
      function: 'calculateCompletionMetrics'
    },
    {
      phase: 'proposal',
      description: 'Generate audit summary',
      output: 'AuditReport'
    }
  ],
  
  verification: {
    description: 'Confirm audit data matches expectations',
    checks: ['data freshness', 'completeness', 'accuracy']
  }
};
```

## Priority

High

---

## Scope

**Files affected:** `src/workflows/**`

## Acceptance Criteria

Workflows defined for:

- [ ] **Daily audit:** Progress review and metrics
- [ ] **Task completion verification:** Verify tasks are properly completed
- [ ] **Meeting notes update:** Update meeting records with action items
- [ ] **Project progress review:** Sprint/milestone progress tracking

Additional requirements:

- [ ] Each workflow maps natural language triggers to structured steps
- [ ] Query → Proposal → Verification pattern followed
- [ ] No MCP calls executed (intents only)
- [ ] Type-safe workflow definitions
- [ ] Testable structure

## Copilot Execution Prompt

See: `.github/prompts/05-nl-workflows.prompt.md`

## PR Output

- **PR name:** `feat/nl-workflows`
- **Run summary:** `/docs/runs/05-nl-workflows.md`

---

## Labels

- enhancement
- triage
- workflows
- alignment-epic

## Verification

- [x] I have searched for existing feature requests
- [x] This feature aligns with the project scope
- [x] This is part of the Alignment Epic execution plan
