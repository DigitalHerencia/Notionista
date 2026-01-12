# Competitive Advantage codebase reference

## What this is

This workspace (`Notionista`) is the Notion/MCP automation layer for the Digital Herencia **Competitive Advantage** dev cycle.

The application/product source code lives in a separate GitHub repository:

- Repo: [DigitalHerencia/CompetitiveAdvantage](https://github.com/DigitalHerencia/CompetitiveAdvantage)

## How this repo relates to it

- `Notionista` focuses on:
  - Notion database schemas and automation (projects/tasks/meetings/portfolio)
  - MCP server configuration expectations (e.g., Notion token)
  - Operational workflows (Propose → Approve → Apply → Verify)
- `CompetitiveAdvantage` is expected to contain:
  - The Competitive Advantage product/code implementation
  - App-specific runtime configuration, CI/CD, deployments, etc.

## Access notes

Automated fetch attempts for the repo and its raw README returned `HTTP 404` from an unauthenticated context. This typically means the repo is private or otherwise access-restricted.

If you want Copilot/CI automation to read it, ensure your environment has access (PAT / GitHub App token) with permission to the `DigitalHerencia/CompetitiveAdvantage` repository.

## Recommended local setup options

1. **Clone side-by-side (simplest):** keep `Notionista/` and `CompetitiveAdvantage/` as sibling folders.
2. **Optional: add as a git submodule** under `external/CompetitiveAdvantage/` if you want a pinned commit reference.

(If you want, tell me which option you prefer and I’ll wire it up accordingly.)

## Where it’s registered in this repo

- `config/external-repos.json` is the canonical pointer used by this workspace.
