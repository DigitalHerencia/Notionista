# [Feature] Convert ChangeProposal into declarative intent objects

## Epic

## Alignment Epic: Notionista → Copilot-Governed Control Plane

**Issue:** 04 of 07  
**Execution Order:** Sequential (depends on Issue 03)  
**Assigned to:** GitHub Copilot (Cloud Agent)

---

## Problem Statement

The current `ChangeProposal` implementation assumes `.apply()` execution semantics, meaning the proposal object contains methods that execute changes. This conflicts with the Copilot-governed model where Copilot should handle all execution through MCP tools.

## Proposed Solution

Refactor `ChangeProposal` to represent declarative intent only:

- Remove all `apply()`, `execute()`, and similar methods
- Include diff summaries describing what would change
- Include validation checklists and risk assessments
- Describe MCP tool intents (which tools Copilot should call)
- Proposals become pure data objects, not executable classes

## Alternative Solutions

1. Keep `apply()` but make it optional - **Rejected:** Creates confusion about ownership
2. Rename to different concept - **Rejected:** Proposal is the right abstraction

## Use Case / Example

```typescript
// Before: Executable proposal
class ChangeProposal {
  async apply(): Promise<Result> {
    return this.mcpClient.execute(this.changes);
  }
}

// After: Declarative intent object
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
  
  // No execute methods - Copilot handles execution
}
```

## Priority

High

---

## Scope

**Files affected:** `src/safety/**`

## Acceptance Criteria

- [ ] Proposals describe intent only (no execution methods)
- [ ] Include diff summaries showing before/after states
- [ ] Include validation checklists with errors/warnings
- [ ] Include risk assessments
- [ ] Include MCP tool intent descriptions
- [ ] No `.apply()`, `.execute()`, or similar methods
- [ ] Pure data objects suitable for Copilot reasoning

## Copilot Execution Prompt

See: `.github/prompts/04-declarative-proposals.prompt.md`

## PR Output

- **PR name:** `refactor/declarative-proposals`
- **Run summary:** `/docs/runs/04-declarative-proposals.md`

---

## Labels

- enhancement
- triage
- safety
- alignment-epic

## Verification

- [x] I have searched for existing feature requests
- [x] This feature aligns with the project scope
- [x] This is part of the Alignment Epic execution plan
