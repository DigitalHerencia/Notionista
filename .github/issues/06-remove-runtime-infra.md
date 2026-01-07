# [Bug] Remove SDK-only runtime infrastructure

## Epic

## Alignment Epic: Notionista → Copilot-Governed Control Plane

**Issue:** 06 of 07  
**Execution Order:** Sequential (depends on Issue 05)  
**Assigned to:** GitHub Copilot (Cloud Agent)

---

## Description

The codebase contains SDK-only infrastructure (batching, retry logic, rate limiting) that duplicates responsibilities owned by VS Code's MCP client. This infrastructure assumes the repo is an executable SDK, which conflicts with the Copilot-governed control plane model.

## Steps to Reproduce

1. Examine `src/mcp/middleware/**` for retry/rate-limit logic
2. Examine `src/safety/batch-limiter.ts` for batch execution
3. Observe that this duplicates VS Code MCP client responsibilities

## Expected Behavior

- No retry middleware in the codebase
- No rate limiting logic
- No batch executors
- Constraints documented as annotations/metadata for Copilot reasoning
- VS Code MCP client handles all runtime concerns

## Actual Behavior

- Retry logic implemented in middleware
- Rate limiting code present
- Batch execution infrastructure exists
- Creates confusion about runtime ownership

## Environment

- Notionista: current main branch
- Node: 20.x
- VS Code: with MCP extensions

## Scope

**Files affected:**

- `src/mcp/middleware/**`
- `src/safety/batch-limiter.ts`
- Any retry/rate-limit logic throughout codebase

## Acceptance Criteria

- [ ] No retry middleware
- [ ] No rate limiting logic
- [ ] No batch executors
- [ ] Constraints documented as metadata/annotations
- [ ] Documentation explains that VS Code MCP client handles these concerns
- [ ] Type annotations describe constraints for Copilot reasoning

## Copilot Execution Prompt

See: `.github/prompts/06-remove-runtime-infra.prompt.md`

## PR Output

- **PR name:** `chore/remove-runtime-infra`
- **Run summary:** `/docs/runs/06-remove-runtime-infra.md`

---

## Labels

- bug
- triage
- infrastructure
- alignment-epic

## Verification

- [x] I have searched for existing issues
- [x] This is part of the Alignment Epic execution plan
