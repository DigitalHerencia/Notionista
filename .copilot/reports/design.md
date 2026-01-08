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
