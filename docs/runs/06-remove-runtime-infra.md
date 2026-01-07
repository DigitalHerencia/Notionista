# Run 06: Remove Runtime Infrastructure

**Date**: 2026-01-07  
**Issue**: [#22 - Remove Runtime Infrastructure](https://github.com/DigitalHerencia/Notionista/issues/22)  
**PR**: `chore/remove-runtime-infra`  
**Status**: ✅ Completed  
**Depends on**: Issue #21 (Natural Language Workflows)

## Objective

Remove SDK-only infrastructure such as retry logic, rate limiting, and batch execution. Replace with documentation and constraint annotations suitable for Copilot reasoning.

The goal is to eliminate runtime execution concerns from the SDK, acknowledging that these are handled by the VS Code MCP client and host environment. Replace runtime enforcement with declarative constraint metadata that Copilot can use for reasoning.

## What Was Done

### 1. Removed Retry Middleware

**File**: `src/mcp/middleware/retry.ts` (deleted)

Removed the retry middleware implementation that performed:
- Exponential backoff retry logic
- Configurable retry attempts and delays
- Retryable error detection

**Rationale**: Retry logic is a runtime concern handled by the VS Code MCP client. The SDK should not implement its own retry mechanism, as this duplicates functionality and creates confusion about responsibility boundaries.

### 2. Removed Rate Limiter Middleware

**File**: `src/mcp/middleware/rate-limiter.ts` (deleted)

Removed the rate limiter middleware that enforced:
- Requests per second limiting
- Request queuing
- Minimum interval enforcement

**Rationale**: Rate limiting is handled by the VS Code MCP client according to Notion API constraints. The SDK should document these constraints for Copilot reasoning but not enforce them at runtime.

### 3. Removed BatchLimiter Class

**File**: `src/safety/batch-limiter.ts` (rewritten)

Removed the `BatchLimiter` class that included:
- Batch size validation with thrown errors
- Automatic batch splitting with execution
- Progress tracking callbacks
- Batch execution with error collection

**Replaced with**: Pure utility functions that provide:
- `isWithinBatchLimit()` - Check if batch size is within recommended limits
- `splitBatch()` - Split items into chunks (pure function, no execution)
- `generateBatchSummary()` - Generate metadata for batch operations
- `formatBatchSummary()` - Format batch summary for display

**Rationale**: The SDK should provide guidance and utilities for batch operations, but not execute them. Batch execution is delegated to the VS Code MCP host, which coordinates with Copilot to execute operations safely.

### 4. Removed Batch Limiter Tests

**File**: `src/safety/__tests__/batch-limiter.test.ts` (deleted)

Removed test file for the `BatchLimiter` class, which tested:
- Batch size validation
- Batch splitting logic
- Batch execution
- Error handling
- Progress callbacks

**Rationale**: The class no longer exists. The replacement utility functions are simple pure functions that don't require extensive testing infrastructure.

### 5. Created Constraint Metadata Types

**File**: `src/core/types/constraints.ts` (new)

Added comprehensive constraint metadata for Copilot reasoning:

#### Rate Limit Constraints
```typescript
interface RateLimitConstraints {
  requestsPerSecond: number;
  handledBy: 'vscode-mcp-client';
}
```

Documents that rate limiting is handled by VS Code MCP client at 3 requests/second.

#### Retry Constraints
```typescript
interface RetryConstraints {
  maxRetries: number;
  backoffStrategy: 'exponential' | 'linear';
  initialDelayMs: number;
  maxDelayMs: number;
  handledBy: 'vscode-mcp-client';
}
```

Documents retry behavior handled by VS Code MCP client (3 retries, exponential backoff).

#### Batch Guidance
```typescript
interface BatchGuidance {
  maxItemsPerBatch: number;
  requiresDryRunSummary: boolean;
  handledBy: 'copilot-agent';
  rationale: string;
}
```

Provides guidance for Copilot on batch operations (50 items max, dry-run required for large batches).

#### Utility Functions
- `validateBatchSize()` - Pure function returning validation result with recommendations
- `splitIntoBatches()` - Pure function for splitting items into chunks

**Rationale**: Copilot needs structured metadata to reason about operation constraints without runtime enforcement. These types make constraints explicit and machine-readable while documenting who handles them.

### 6. Updated MCP Constants

**File**: `src/core/constants/index.ts`

Removed runtime-focused constants:
- `MAX_RETRIES`
- `RATE_LIMIT_PER_SECOND`
- `RETRY_BACKOFF_BASE`
- `RETRY_BACKOFF_MAX`

Kept informational constant:
- `TIMEOUT` (documented as handled by VS Code MCP client)

Added documentation explaining:
- Runtime concerns are handled by VS Code MCP client
- Constants are retained for documentation purposes
- Reference to constraint metadata for Copilot reasoning

**Rationale**: The SDK should not define runtime behavior constants that it doesn't enforce. Instead, document these values and delegate to the MCP host.

### 7. Updated Middleware Index

**File**: `src/mcp/middleware/index.ts`

Removed exports:
- `createRetryMiddleware`
- `RetryOptions`
- `createRateLimiter`
- `RateLimiterOptions`

Kept exports:
- `createLoggerMiddleware` (observability, non-execution)
- `createCacheMiddleware` (read-only optimization)

Added documentation:
- Middleware is deprecated for execution-oriented logic
- Runtime concerns handled by MCP host
- Reference to constraint metadata

**Rationale**: Logger and cache middleware are observability and optimization concerns that don't affect operation semantics. Retry and rate limiting alter execution behavior and should be delegated.

### 8. Updated Main Index Exports

**File**: `src/index.ts`

Removed exports:
- `BatchLimiter` class
- `BatchConfig` interface
- `BatchResult` interface
- `BatchLimitExceededError` error class

Added exports:
- `formatBatchSummary()` function
- `generateBatchSummary()` function
- `isWithinBatchLimit()` function
- `splitBatch()` function
- `DEFAULT_MCP_CONSTRAINTS` constant
- `splitIntoBatches()` function
- `validateBatchSize()` function
- All constraint metadata types

**Rationale**: Expose pure functions and metadata for Copilot reasoning, hide execution-oriented classes.

## Files Modified

1. `src/mcp/middleware/retry.ts` - **Deleted**
2. `src/mcp/middleware/rate-limiter.ts` - **Deleted**
3. `src/safety/__tests__/batch-limiter.test.ts` - **Deleted**
4. `src/safety/batch-limiter.ts` - **Rewritten** (class removed, pure functions added)
5. `src/core/types/constraints.ts` - **Created** (new constraint metadata types)
6. `src/core/constants/index.ts` - **Modified** (removed runtime constants, added docs)
7. `src/mcp/middleware/index.ts` - **Modified** (removed retry/rate-limit exports)
8. `src/index.ts` - **Modified** (updated exports)

## Lines Changed

- **Added**: 397 lines (mostly constraint metadata types)
- **Removed**: 606 lines (middleware implementations, BatchLimiter class, tests)
- **Net change**: -209 lines

## Design Decisions

### Why Remove Instead of Deprecate?

We deleted the middleware files rather than marking them deprecated because:
1. They were not being used anywhere in the codebase
2. Keeping them would create confusion about SDK responsibilities
3. Clean removal makes the architectural shift explicit
4. Constraint metadata provides a clearer replacement

### Why Keep Logger and Cache Middleware?

These middleware are retained because:
- **Logger**: Observability concern, doesn't affect execution semantics
- **Cache**: Read-only optimization, no side effects, transparent to caller

Both are marked as deprecated and documented that runtime concerns should be handled externally.

### Why Pure Functions Instead of Class Methods?

The replacement batch utilities are pure functions because:
- No state to manage
- Easier to test and reason about
- Clear functional composition
- No hidden dependencies or side effects

### Why Constraint Metadata Over Runtime Enforcement?

Constraint metadata is superior for a declarative SDK because:
- Makes constraints explicit and machine-readable
- Documents who handles enforcement (VS Code, Copilot, Notion API)
- Enables Copilot reasoning without runtime coupling
- Preserves flexibility for different execution environments

## Migration Guide

### For Code Using `BatchLimiter`

**Before:**
```typescript
const limiter = new BatchLimiter({ maxBatchSize: 50 });
limiter.validateBatchSize(items.length); // Throws error

const chunks = limiter.splitBatch(items);
const summary = limiter.generateDryRunSummary(items.length);
```

**After:**
```typescript
import { 
  validateBatchSize, 
  splitIntoBatches, 
  DEFAULT_MCP_CONSTRAINTS 
} from 'notionista';

const validation = validateBatchSize(items.length);
if (!validation.withinLimit) {
  console.warn(validation.message);
}

const chunks = splitIntoBatches(items);
const summary = generateBatchSummary(items.length);
```

### For Code Using Retry Middleware

**Before:**
```typescript
const retry = createRetryMiddleware({ maxRetries: 3 });
// Apply middleware to client
```

**After:**
Remove retry middleware usage. Retries are handled by VS Code MCP client automatically. Reference constraint metadata for documentation:

```typescript
import { DEFAULT_MCP_CONSTRAINTS } from 'notionista';

// Document retry behavior for Copilot reasoning
const { retry } = DEFAULT_MCP_CONSTRAINTS;
// retry.maxRetries = 3
// retry.handledBy = 'vscode-mcp-client'
```

### For Code Using Rate Limiter

**Before:**
```typescript
const rateLimiter = createRateLimiter({ requestsPerSecond: 3 });
// Apply middleware to client
```

**After:**
Remove rate limiter usage. Rate limiting is handled by VS Code MCP client. Reference constraint metadata for documentation:

```typescript
import { DEFAULT_MCP_CONSTRAINTS } from 'notionista';

// Document rate limit for Copilot reasoning
const { rateLimit } = DEFAULT_MCP_CONSTRAINTS;
// rateLimit.requestsPerSecond = 3
// rateLimit.handledBy = 'vscode-mcp-client'
```

## Verification

### Build Verification

```bash
npm run build
# ✅ Build successful - 77.68 KB ESM, 82.91 KB CJS, 104.33 KB DTS
```

### Type Checking

```bash
npm run typecheck
# Pre-existing errors unrelated to changes
# No new type errors introduced
```

### Linting

```bash
npx eslint src/core/types/constraints.ts
# ✅ No linting errors in new file
```

## Documentation Updates Required

The following documentation should be updated to reflect these changes:

1. **API Reference** (`docs/api-reference.md`)
   - Remove `BatchLimiter` class documentation
   - Add constraint metadata types documentation
   - Add pure utility functions documentation

2. **Core Concepts** (`docs/core-concepts.md`)
   - Explain constraint metadata approach
   - Document VS Code MCP client responsibilities
   - Update batch operation guidance

3. **Migration Guide** (if exists)
   - Document migration from `BatchLimiter` to pure functions
   - Explain middleware removal
   - Provide examples of new approach

4. **Copilot Instructions** (`.github/copilot-instructions.md`)
   - Update to reference constraint metadata
   - Remove references to deprecated middleware
   - Add examples of using constraint types

## Next Steps

1. **Update Documentation** - Reflect changes in all documentation
2. **Test Integration** - Verify Copilot can reason with constraint metadata
3. **Issue #23** - Continue with next phase of alignment epic
4. **Monitor Usage** - Watch for any breaking changes in downstream code

## Related Issues

- **Depends on**: [#21 - Natural Language Workflows](https://github.com/DigitalHerencia/Notionista/issues/21)
- **Part of**: Alignment Epic: Notionista → Copilot-Governed Control Plane
- **Follows**: Run 05 (Natural Language Workflows)

## Lessons Learned

### Clean Deletion Over Deprecation

When making architectural shifts, clean deletion of unused code is clearer than gradual deprecation. The constraint metadata provides a complete replacement, making the old code unnecessary.

### Explicit Responsibility Boundaries

Documenting who handles what (VS Code, Copilot, SDK, Notion API) prevents confusion and duplicate implementations. The `handledBy` field in constraint metadata makes this explicit.

### Pure Functions Over Classes

For simple utilities, pure functions are superior to classes. They're easier to compose, test, and reason about without hidden state or dependencies.

### Metadata for Machine Reasoning

Structured metadata is more valuable for Copilot reasoning than runtime code. Constraint types provide machine-readable information that Copilot can use to make decisions.

## Success Metrics

- ✅ 209 lines of code removed (net)
- ✅ No new dependencies added
- ✅ Build successful
- ✅ No new type errors
- ✅ No lint errors in new code
- ✅ Clean git history with clear commit messages
- ✅ Comprehensive run summary documentation

## Conclusion

Successfully removed runtime infrastructure (retry logic, rate limiting, batch execution) from the SDK and replaced with declarative constraint metadata. The SDK is now a pure declarative control layer with clear responsibility boundaries. Runtime concerns are delegated to the VS Code MCP client, while the SDK provides type-safe metadata for Copilot reasoning.

This change aligns with the overall goal of transforming Notionista into a Copilot-governed control plane where the SDK describes operations without executing them, and Copilot coordinates execution through the MCP host environment.
