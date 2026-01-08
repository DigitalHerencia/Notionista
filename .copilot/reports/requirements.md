# Requirements

## User stories

- As a maintainer, I want this workspace to contain a durable reference to the Competitive Advantage product code repository so contributors can find the correct codebase quickly.
- As an automation agent, I want a machine-readable pointer to the Competitive Advantage repository so future tools/scripts can discover it without hard-coding URLs.

## Acceptance criteria (EARS)

- WHEN a contributor looks for the Competitive Advantage codebase, THE SYSTEM SHALL provide a single canonical reference document in `.copilot/docs/` that includes the repository URL and how it relates to this workspace.
- WHEN tooling needs to programmatically locate the Competitive Advantage repository, THE SYSTEM SHALL provide a machine-readable entry in `config/external-repos.json`.
- WHEN Copilot instructions are consulted, THE SYSTEM SHALL reference the Competitive Advantage repository link from `.github/copilot-instructions.md`.
- IF the repository is not accessible from an unauthenticated context, THEN THE SYSTEM SHALL document the access requirement and expected credentials at the reference location.
