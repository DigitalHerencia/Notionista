# Design

## Architecture

This repository (`Notionista`) remains a TypeScript project focused on Notion/MCP automation for the Digital Herencia workspace.

The Competitive Advantage application codebase is treated as an **external repository dependency** referenced by URL, not vendored by default.

## Components

- `config/external-repos.json`
  - Machine-readable registry of related repos.
  - Enables future scripts/agents to discover the correct codebase.
- `.copilot/docs/competitive-advantage-repo.md`
  - Human-readable reference: purpose, linkage, and access notes.
- `.github/copilot-instructions.md`
  - Operational guidance; now includes a “Related repositories” pointer.

## Security / access considerations

- The Competitive Advantage repo appears access-restricted (unauthenticated fetch returns 404).
- Any future automation that reads it should use least-privilege GitHub credentials (PAT or GitHub App token) scoped to `DigitalHerencia/CompetitiveAdvantage`.

## Future extension (optional)

If we later decide to vendor the repo for development convenience:

- Preferred: git submodule under `external/CompetitiveAdvantage/`.
- Alternative: sibling folder clone (no git metadata coupling).

This design intentionally does not force either option without an explicit decision.

## Notion workflow design (Portfolio completion)

### Entities and relationships (OPS)

- Portfolio item (parent): `PROD-M1-P1.1-PRD – Problem Definition`
  - Owns `Sub-item` relations to T01–T05 Portfolio pages.
  - Owns `Tasks` relations to T01–T05 Tasks.
  - Owns `Meetings` relations to planning/standup artifacts.
- Portfolio item (child): `T05 Feasibility review`
  - Links to the T05 Task, Product Team, and the project.
  - Stores deliverable content in page blocks.
- Tasks: T01–T05
  - Each task links to its originating meeting for audit trail.
- Meetings
  - Contain meeting notes (blocks) and link back to projects.

### Data flow (OPS)

1. Read: Retrieve parent Portfolio item to identify related Task/Meeting/Page IDs.
2. Read: Retrieve the T05 Portfolio page blocks to confirm it is empty.
3. Read: Retrieve T01–T04 Portfolio content (as templates) and task/meeting state.
4. Write (approved): Append structured content blocks to the T05 Portfolio page.
5. Write (approved): Mark the T05 Task `Done=true`.
6. Verify: Re-fetch the updated page/task and confirm meeting context coverage.

### Constraints and implementation notes (OPS)

- Workspace guardrails require a Propose → Approve → Apply workflow for Notion writes.
- Some Notion block append operations may be constrained to a limited subset of block types; if headings/tables cannot be created directly, represent structure using paragraphs (e.g., `##` / `###`) plus bulleted lists.

### Error handling

- If Notion permissions prevent reading a page (404/403), report the missing share/integration access requirement.
- If a meeting page appears to contain only the template scaffold, treat it as "needs context" and propose minimal additions (do not overwrite existing notes).

## Notion workflow design (OPS OKR publish)

### Entities and relationships

- Project: `OPS-M1-P1.1-OKR – OKRs & Constraints`
  - Links to the Ops daily meetings used as an audit trail (Jan 1–7).
  - Links to tasks T01–T05.
- Task: `T05 Publish OKRs`
  - Stores the publish memo directly in the task page body (page blocks).
  - References canonical OKR / budgets+constraints pages rather than duplicating long tables.
- Meetings: Ops daily meetings (Type=Operations, Cadence=Daily)
  - Some pages may be template scaffolds; these must not be “filled in” with invented history.

### Data flow

1. Read: query Meetings for the Ops team over the audit window; read blocks to confirm substantive notes vs scaffold.
2. Read: retrieve the T05 task page blocks to confirm whether the publish memo exists.
3. Draft: create an executive-ready memo that summarizes verified decisions (e.g., OKR framework selection, cadence, traceability rules) and links out to canonical source pages.
4. Write (approved): append memo blocks to the T05 task page.
5. Write (approved): if needed, append minimal “no notes captured” annotations to scaffold-only meeting pages.
6. Verify: re-fetch updated pages (T05 + meetings) to confirm the audit trail matches reality.

### Constraints and implementation notes

- Integrity constraint: do not fabricate meeting notes.
- If Notion write operations are gated, document proposed changes and await explicit approval before applying.

## Validation notes (2026-01-08)

- T05 deliverable content was appended using paragraph + bulleted list blocks to stay within block-type constraints.
- Standup pages for 2026-01-06 and 2026-01-07 were updated by inserting a single bulleted context note immediately after the "What did we do yesterday?" heading.
- T05 Task `Done` was observed as `true` after updates.
