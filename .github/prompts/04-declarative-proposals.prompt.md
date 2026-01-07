---
mode: 'agent'
description: 'Convert ChangeProposal into declarative intent objects - Issue 04/07'
tools: ['editFiles', 'codebase', 'terminal']
---

# Declarative Proposals Refactor

**Epic:** Alignment Epic: Notionista → Copilot-Governed Control Plane
**Issue:** 04 of 07
**Depends on:** Issue 03 must be completed first
**PR Name:** `refactor/declarative-proposals`

## Objective

Refactor ChangeProposal so it represents declarative intent only. Remove apply/execute semantics. Copilot handles all execution.

## Instructions

1. **Remove `.apply()`, `.execute()`** and similar methods from proposals
2. **Add diff summaries** showing before/after states
3. **Add validation checklists** with errors and warnings
4. **Add risk assessments** with levels and mitigations
5. **Add MCP tool intent descriptions** (which tools Copilot should call)

## Scope

- `src/safety/**`

## Target Structure

```typescript
interface ChangeProposal {
  id: string;
  type: 'create' | 'update' | 'delete';
  target: { database: string; pageId?: string };
  
  // Declarative intent
  intent: {
    description: string;
    mcpTool: 'post-page' | 'patch-page' | 'delete-a-block';
    parameters: Record<string, unknown>;
  };
  
  // Diff summary
  diff: {
    before: Record<string, unknown> | null;
    after: Record<string, unknown>;
    summary: string;
  };
  
  // Validation and risks
  validation: {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  };
  
  risks: {
    level: 'low' | 'medium' | 'high';
    factors: string[];
    mitigations: string[];
  };
  
  // NO execute methods
}
```

## Acceptance Criteria

- [ ] Proposals describe intent only
- [ ] Include diff summaries
- [ ] Include validation checklists
- [ ] Include risk assessments
- [ ] Include MCP tool intent descriptions
- [ ] No `.apply()`, `.execute()` methods

## Output

After completion, create:

- **PR:** `refactor/declarative-proposals`
- **Run summary:** `docs/runs/04-declarative-proposals.md`
