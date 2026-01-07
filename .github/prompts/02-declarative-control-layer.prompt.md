---
mode: 'agent'
description: 'Convert SDK runtime logic into declarative Copilot control layer - Issue 02/07'
tools: ['editFiles', 'codebase', 'terminal']
---

# Declarative Control Layer Refactor

**Epic:** Alignment Epic: Notionista → Copilot-Governed Control Plane
**Issue:** 02 of 07
**Depends on:** Issue 01 must be completed first
**PR Name:** `refactor/declarative-control-layer`

## Objective

Refactor the repository so it contains no runtime side effects. Convert execution-oriented logic into declarative schemas, validators, and pure functions.

## Instructions

1. **Identify all network calls** and remove them
2. **Convert execution logic** into declarative schemas
3. **Create validators** as pure functions
4. **Preserve type safety** and domain clarity
5. **Ensure suitability** for Copilot reasoning, not execution

## Scope

- `src/**` (excluding tests)

## Transformation Pattern

```typescript
// Before: Execution-oriented
async function updateTask(id: string, data: TaskUpdate): Promise<Task> {
  const response = await mcpClient.call('update', { id, ...data });
  return parseTask(response);
}

// After: Declarative intent
interface TaskUpdateIntent {
  type: 'task.update';
  target: { id: string };
  changes: TaskUpdate;
  validation: ValidationResult;
  mcpToolIntent: 'patch-page';
}
```

## Acceptance Criteria

- [ ] No network calls in the codebase
- [ ] No execution side effects
- [ ] Logic expressed as schemas, validators, pure functions
- [ ] Type safety preserved
- [ ] Domain clarity maintained

## Output

After completion, create:

- **PR:** `refactor/declarative-control-layer`
- **Run summary:** `docs/runs/02-declarative-control-layer.md`
