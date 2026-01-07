---
mode: 'agent'
description: 'Remove SDK-only runtime infrastructure - Issue 06/07'
tools: ['editFiles', 'codebase', 'terminal']
---

# Remove Runtime Infrastructure

**Epic:** Alignment Epic: Notionista → Copilot-Governed Control Plane
**Issue:** 06 of 07
**Depends on:** Issue 05 must be completed first
**PR Name:** `chore/remove-runtime-infra`

## Objective

Remove SDK-only infrastructure such as retry logic, rate limiting, and batch execution. Replace with documentation and constraint annotations suitable for Copilot reasoning.

## Instructions

1. **Remove retry middleware** from `src/mcp/middleware/**`
2. **Remove rate limiting logic** from all files
3. **Remove batch executors** like `src/safety/batch-limiter.ts`
4. **Document constraints** as type annotations and metadata
5. **Add documentation** explaining VS Code MCP client handles these concerns

## Files to Examine

- `src/mcp/middleware/**`
- `src/safety/batch-limiter.ts`
- Any retry/rate-limit logic throughout codebase

## Replacement Pattern

```typescript
// Before: Runtime rate limiting
class RateLimiter {
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    await this.waitForSlot();
    return fn();
  }
}

// After: Constraint annotation
interface McpCallConstraints {
  /** VS Code MCP client handles rate limiting */
  rateLimit: {
    requestsPerSecond: 3;
    handledBy: 'vscode-mcp-client';
  };
  
  /** Batch size recommendations for Copilot */
  batchGuidance: {
    maxItemsPerBatch: 50;
    requiresDryRunSummary: true;
  };
}
```

## Acceptance Criteria

- [ ] No retry middleware
- [ ] No rate limiting logic
- [ ] No batch executors
- [ ] Constraints documented as metadata
- [ ] Documentation explains VS Code handles runtime concerns

## Output

After completion, create:

- **PR:** `chore/remove-runtime-infra`
- **Run summary:** `docs/runs/06-remove-runtime-infra.md`
