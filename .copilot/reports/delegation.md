cloud agent runbook per epic
Use one cloud agent session per epic to keep scope contained. Recommended branch names assume a GitHub remote the cloud agent can access.

EPIC-001 – Project Foundation

Branch: epic-001-project-foundation
Goal: create package.json, tsconfig (strict), bundler (tsup/esbuild), ESLint/Prettier, Vitest, initial src/ layout.
Prompt seed: “Implement TASK-001 subtasks; ensure pnpm build outputs ESM+CJS, pnpm test runs, pnpm lint passes.”
EPIC-002 – MCP Client Layer

Branch: epic-002-mcp-client (base on EPIC-001 branch or main after merge).
Goal: stdio transport, McpClient with middleware, rate limiter/retry/logger/cache, typed tool wrappers.
Prompt seed: “Implement TASK-005 through TASK-011 using @notionhq/notion-mcp-server; include Zod input validation.”
EPIC-003 – Domain Layer

Branch: epic-003-domain-layer (after EPIC-002).
Goal: BaseRepository, Team/Project/Task/Meeting repos, entities, proposal-returning mutations.
Prompt seed: “Implement TASK-012 through TASK-017; map Notion properties per PRD/design; all mutations return proposals.”
EPIC-004 – Query Builder

Branch: epic-004-query-builder (after EPIC-001; consumed by repos).
Goal: Fluent query API, all filter operators, compound filters, pagination.
Prompt seed: “Implement TASK-018; type-safe builder composing filters/sorts/cursors used by repositories.”
EPIC-005 – Safety Layer

Branch: epic-005-safety-layer (after EPIC-002; before workflows).
Goal: ProposalManager, diff engine, validator, batch limiter (<=50), rollback hook.
Prompt seed: “Implement TASK-019 through TASK-022; enforce Propose→Approve→Apply workflow.”
EPIC-006 – Workflows

Branch: epic-006-workflows (after EPIC-003 & EPIC-005).
Goal: Sprint creation, daily standup, analytics/reporting, all via proposals.
Prompt seed: “Implement TASK-023 through TASK-025; orchestrate repos + safety layer; output summaries.”
EPIC-007 – Snapshot & Sync

Branch: epic-007-snapshot-sync (after EPIC-001 & EPIC-002).
Goal: CSV/Markdown parsers for snapshots/, snapshot manager, diff against live.
Prompt seed: “Implement TASK-026 and TASK-027; parse Notion exports in snapshots/; produce drift reports.”
EPIC-008 – Documentation & Polish

Branch: epic-008-docs-polish (after prior epics).
Goal: README quickstart, JSDoc, example workflows, integration tests, CI.
Prompt seed: “Implement TASK-028 through TASK-030; ensure docs + tests + CI; DX <5 min.”
how to start each cloud agent session
Push the repository to GitHub so the cloud agent can access it; include PRD/design/tasks links.
In VS Code Chat view, start New Cloud Agent (or type @cloud <task>) and set the branch name above.
Paste the epic prompt seed plus links to requirements.md, design.md, and tasks.md.
State dependencies (e.g., “Base branch: main after EPIC-001 merged”) and any secrets needed later (e.g., NOTION_TOKEN as repo secret—don’t paste it).
Ask the cloud agent to open a PR when done with a summary, tests run, and checklist against acceptance criteria.
Monitor from Chat view; if blocked, hand back to local agent for fixes.
