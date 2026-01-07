# [Feature] Convert SDK runtime logic into declarative Copilot control layer

## Epic

## Alignment Epic: Notionista → Copilot-Governed Control Plane

**Issue:** 02 of 07  
**Execution Order:** Sequential (depends on Issue 01)  
**Assigned to:** GitHub Copilot (Cloud Agent)

---

## Problem Statement

The repository currently behaves like an executable SDK instead of a reasoning/control layer. This architectural mismatch prevents Copilot from properly reasoning about the codebase and creates runtime side effects that conflict with the declarative control plane model.

## Proposed Solution

Refactor the repository to contain no runtime side effects. Convert all execution-oriented logic into:

- Declarative schemas
- Validators (pure functions)
- Pure functions for transformation and reasoning
- Type definitions for Copilot consumption

## Alternative Solutions

1. Keep execution logic but isolate it - **Rejected:** Still creates runtime ownership conflicts
2. Create separate packages - **Rejected:** Adds complexity without solving core issue

## Use Case / Example

```typescript
// Before: Execution-oriented
async function updateTask(id: string, data: TaskUpdate): Promise<Task> {
  const response = await mcpClient.call('update', { id, ...data });
  return parseTask(response);
}

// After: Declarative control layer
interface TaskUpdateIntent {
  type: 'task.update';
  target: { id: string };
  changes: TaskUpdate;
  validation: ValidationResult;
  mcpToolIntent: 'patch-page';
}

function createTaskUpdateIntent(id: string, data: TaskUpdate): TaskUpdateIntent {
  return {
    type: 'task.update',
    target: { id },
    changes: data,
    validation: validateTaskUpdate(data),
    mcpToolIntent: 'patch-page'
  };
}
```

## Priority

High

---

## Scope

**Files affected:** `src/**` (excluding tests)

## Acceptance Criteria

- [ ] No network calls in the codebase
- [ ] No execution side effects
- [ ] Logic expressed as schemas, validators, and pure functions
- [ ] Type safety preserved
- [ ] Domain clarity maintained
- [ ] Suitable for Copilot reasoning, not execution

## Copilot Execution Prompt

See: `.github/prompts/02-declarative-control-layer.prompt.md`

## PR Output

- **PR name:** `refactor/declarative-control-layer`
- **Run summary:** `/docs/runs/02-declarative-control-layer.md`

---

## Labels

- enhancement
- triage
- refactor
- alignment-epic

## Verification

- [x] I have searched for existing feature requests
- [x] This feature aligns with the project scope
- [x] This is part of the Alignment Epic execution plan
