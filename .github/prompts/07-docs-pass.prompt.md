---
mode: 'agent'
description: 'Final documentation pass for Copilot-first usage - Issue 07/07'
tools: ['editFiles', 'codebase', 'terminal']
---

# Copilot-First Documentation Pass

**Epic:** Alignment Epic: Notionista → Copilot-Governed Control Plane
**Issue:** 07 of 07 (FINAL)
**Depends on:** Issue 06 must be completed first
**PR Name:** `docs/copilot-first-docs`

## Objective

Update documentation to reflect Copilot-first usage. Clarify that MCP is owned by VS Code. Position the repository as a governance and reasoning layer.

## Instructions

1. **Update README.md** to frame repo as control plane
2. **Update all `/docs/**` files** to describe Copilot usage
3. **Update CONTRIBUTING.md** to align with new model
4. **Remove references** to running servers or SDK execution
5. **Add Copilot usage examples** throughout

## Terminology Changes

| Before | After |
|--------|-------|
| execute | propose / intent |
| SDK | control plane / governance layer |
| run | reason about / validate |
| call API | describe intent |
| server startup | (remove) |

## Key Messages to Convey

1. **Copilot Chat is the operator** - executes via MCP
2. **MCP stays inside VS Code** - not managed by this repo
3. **This repo is the brain** - schemas, rules, memory
4. **Natural language → governed automation**

## Files to Update

- `README.md`
- `/docs/**` (all documentation files)
- `CONTRIBUTING.md`
- `AGENTS.md` (verify alignment)
- `.github/copilot-instructions.md` (verify alignment)

## Example Documentation Pattern

```markdown
## Usage

Notionista provides the governance layer for Copilot-driven Notion automation.

### Propose a Change

```typescript
// Create a declarative proposal (no execution)
const proposal = createTaskUpdateProposal({
  taskId: 'abc123',
  changes: { status: 'Done' }
});

// Copilot reviews and executes via MCP
// This repo does NOT execute - it describes intent
```
```

## Acceptance Criteria

- [ ] Docs describe Copilot-first usage
- [ ] MCP ownership clearly external (VS Code)
- [ ] Repo framed as control plane
- [ ] No references to running servers
- [ ] No references to SDK execution
- [ ] Examples show Copilot consuming types/schemas

## Output

After completion, create:

- **PR:** `docs/copilot-first-docs`
- **Run summary:** `docs/runs/07-docs-pass.md`

## Final State

After this PR, the repository is fully aligned:

- ✅ Copilot Chat = operator
- ✅ MCP = VS Code owned
- ✅ Repo = brain, rules, memory
- ✅ Natural language → governed automation
