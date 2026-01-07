# [Docs] Final documentation pass for Copilot-first usage

## Epic

## Alignment Epic: Notionista → Copilot-Governed Control Plane

**Issue:** 07 of 07  
**Execution Order:** Sequential (depends on Issue 06) - **FINAL**  
**Assigned to:** GitHub Copilot (Cloud Agent)

---

## Documentation Issue

The current documentation still implies executable SDK behavior. Terms like "running the SDK," "executing queries," and "calling the API" suggest this is a runtime library, which conflicts with the Copilot-governed control plane model.

## Documentation Location

- `README.md`
- `/docs/**` (all documentation files)
- `CONTRIBUTING.md`
- `AGENTS.md`
- `.github/copilot-instructions.md`

## Suggested Improvement

Update all documentation to reflect Copilot-first usage:

1. **Reframe the repository purpose:**
   - Position as a governance and reasoning layer
   - Clarify that MCP is owned by VS Code
   - Describe Copilot as the operator

2. **Update terminology:**
   - Replace "execute" with "propose" or "intent"
   - Replace "SDK" with "control plane" or "governance layer"
   - Replace "run" with "reason about" or "validate"

3. **Add Copilot usage examples:**
   - Show how Copilot consumes the types and schemas
   - Demonstrate the Propose → Approve → Apply workflow
   - Explain how natural language maps to workflows

4. **Remove misleading content:**
   - Server startup instructions
   - Direct API usage examples
   - Runtime configuration

## Additional Context

This is the final issue in the Alignment Epic. After this PR, the repository should be completely aligned with the Copilot-governed model:

- Copilot Chat becomes the **operator**
- MCP stays inside VS Code
- Repo becomes the **brain**, the **rules**, and the **memory**
- Natural language → governed automation

---

## Scope

**Files affected:** `README.md`, `/docs/**`, `CONTRIBUTING.md`

## Acceptance Criteria

- [ ] Docs describe Copilot-first usage
- [ ] MCP ownership clearly stated as external (VS Code)
- [ ] Repo framed as control plane / governance layer
- [ ] No references to running servers
- [ ] No references to SDK execution
- [ ] Examples show Copilot consuming types/schemas
- [ ] Propose → Approve → Apply workflow documented

## Copilot Execution Prompt

See: `.github/prompts/07-docs-pass.prompt.md`

## PR Output

- **PR name:** `docs/copilot-first-docs`
- **Run summary:** `/docs/runs/07-docs-pass.md`

---

## Labels

- documentation
- alignment-epic

## Verification

- [x] I have read the relevant documentation
- [x] This is part of the Alignment Epic execution plan
