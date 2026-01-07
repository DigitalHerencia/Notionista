---
mode: 'agent'
description: 'Remove MCP server lifecycle management from codebase - Issue 01/07'
tools: ['editFiles', 'codebase', 'terminal']
---

# Remove MCP Runtime Ownership

**Epic:** Alignment Epic: Notionista → Copilot-Governed Control Plane
**Issue:** 01 of 07
**PR Name:** `chore/remove-mcp-runtime`

## Objective

Remove all code responsible for spawning, managing, or authenticating an MCP server. MCP should be treated as an external dependency provided by VS Code.

## Instructions

1. **Delete or neutralize `src/mcp/transport.ts`** and any `child_process` usage
2. **Remove MCP server startup/shutdown logic** from all files
3. **Replace with interfaces and comments** that assume MCP is provided by VS Code
4. **Do not introduce new runtime dependencies**

## Files to Examine

- `src/mcp/**` - Primary scope
- Any file importing `child_process`
- Any file with server lifecycle management

## Acceptance Criteria

- [ ] No `child_process` imports or usage
- [ ] No MCP server startup/shutdown logic
- [ ] MCP treated as external (provided by VS Code)
- [ ] Interfaces assume MCP is externally provided
- [ ] No new runtime dependencies

## Output

After completion, create:

- **PR:** `chore/remove-mcp-runtime`
- **Run summary:** `docs/runs/01-remove-mcp-runtime.md`

The run summary should document:

1. Files modified/deleted
2. Key changes made
3. Verification steps completed
