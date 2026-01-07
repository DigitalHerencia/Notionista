# [Bug] Remove MCP server lifecycle management from codebase

## Epic

## Alignment Epic: Notionista → Copilot-Governed Control Plane

**Issue:** 01 of 07  
**Execution Order:** Sequential (do not start until ready)  
**Assigned to:** GitHub Copilot (Cloud Agent)

---

## Description

The repository incorrectly spawns and manages the Notion MCP server, which conflicts with VS Code MCP ownership. MCP server lifecycle should be owned by VS Code, not by this codebase.

## Steps to Reproduce

1. Examine `src/mcp/transport.ts` and related files
2. Observe `child_process` usage for server spawning
3. Note authentication/lifecycle management code that duplicates VS Code responsibilities

## Expected Behavior

- No `child_process` imports or usage
- No MCP server startup/shutdown logic
- MCP treated as an external dependency provided by VS Code
- Clean interfaces assuming MCP is available externally

## Actual Behavior

- Codebase contains server lifecycle management
- `child_process` is used to spawn MCP server
- Authentication logic duplicates VS Code MCP responsibilities

## Environment

- Notionista: current main branch
- Node: 20.x
- VS Code: with MCP extensions

## Scope

**Files affected:** `src/mcp/**`

## Acceptance Criteria

- [ ] No `child_process` imports or usage anywhere in the codebase
- [ ] No MCP server startup/shutdown logic
- [ ] MCP treated as external (provided by VS Code)
- [ ] Interfaces and documentation assume MCP is externally provided
- [ ] No new runtime dependencies introduced

## Copilot Execution Prompt

See: `.github/prompts/01-remove-mcp-runtime.prompt.md`

## PR Output

- **PR name:** `chore/remove-mcp-runtime`
- **Run summary:** `/docs/runs/01-remove-mcp-runtime.md`

---

## Labels

- bug
- triage
- mcp
- alignment-epic

## Verification

- [x] I have searched for existing issues
- [x] This is part of the Alignment Epic execution plan
