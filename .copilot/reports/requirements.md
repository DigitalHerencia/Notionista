# Requirements

## User stories

- As a maintainer, I want this workspace to contain a durable reference to the Competitive Advantage product code repository so contributors can find the correct codebase quickly.
- As an automation agent, I want a machine-readable pointer to the Competitive Advantage repository so future tools/scripts can discover it without hard-coding URLs.

- As a product team lead, I want the final deliverable (T05 Feasibility review) created in Portfolio so the PROD-M1-P1.1-PRD project is complete and actionable.
- As a delivery owner, I want the T05 task marked Done and meeting notes verified so the audit trail (meeting → task → portfolio) is consistent.

- As an operations lead, I want the final deliverable (T05 Publish OKRs) captured on the T05 task page so the OPS-M1-P1.1-OKR project is complete and publishable.
- As a delivery owner, I want Ops meetings (Jan 1–7) to either contain real notes or be explicitly annotated as template-only so audits do not imply work that was not recorded.

## Acceptance criteria (EARS)

- WHEN a contributor looks for the Competitive Advantage codebase, THE SYSTEM SHALL provide a single canonical reference document in `.copilot/docs/` that includes the repository URL and how it relates to this workspace.
- WHEN tooling needs to programmatically locate the Competitive Advantage repository, THE SYSTEM SHALL provide a machine-readable entry in `config/external-repos.json`.
- WHEN Copilot instructions are consulted, THE SYSTEM SHALL reference the Competitive Advantage repository link from `.github/copilot-instructions.md`.
- IF the repository is not accessible from an unauthenticated context, THEN THE SYSTEM SHALL document the access requirement and expected credentials at the reference location.

- WHEN the user requests completion of a PROD Portfolio project, THE SYSTEM SHALL populate the missing T05 Portfolio page with a feasibility review synthesizing T01–T04.
- WHEN the feasibility review is produced, THE SYSTEM SHALL include an executive summary, task completion status, team lead feedback, critical action items, and a feasibility checklist with a Go/No-Go recommendation.
- WHEN the T05 deliverable is created, THE SYSTEM SHALL set the T05 task's `Done` checkbox to `true`.
- WHEN verifying related meetings, THE SYSTEM SHALL confirm that each meeting contains contextual notes that align with the tasks assigned/completed for that project.
- IF a related meeting page contains only the template scaffold (empty sections), THEN THE SYSTEM SHALL propose (and upon approval, apply) minimal context updates that reference the relevant task(s).

- WHEN the user requests completion of an OPS OKR project, THE SYSTEM SHALL populate the T05 task page body with an executive-ready publish memo that links to the canonical OKR and budget/constraint documents.
- WHEN publishing OKRs, THE SYSTEM SHALL use only verifiable meeting notes and existing OKR/constraints content (no fabricated standup notes).
- IF a meeting page in the audit window contains only template scaffolding, THEN THE SYSTEM SHALL propose (and upon approval, apply) a short annotation indicating that no substantive notes were captured and pointing to the canonical deliverable.

## Validation (2026-01-08)

- T05 Portfolio deliverable page was populated with a feasibility review synthesizing T01–T04.
- T05 Task `Done` is now `true` (verified via page properties).
- Daily Standups for 2026-01-06 and 2026-01-07 were confirmed to be template-only scaffolds and were annotated (upon approval) with a minimal context note indicating no notes were captured.

## Validation (2026-01-08) — OPS (in progress)

- Identified OPS project `OPS-M1-P1.1-OKR – OKRs & Constraints` and enumerated linked meetings for 2026-01-01..2026-01-07.
- Verified that 2026-01-06 and 2026-01-07 Ops meeting pages are template-only scaffolds (no substantive notes present).
- Verified that the T05 task page exists and `Done=true`, but the page body is currently empty (requires publish memo content).
