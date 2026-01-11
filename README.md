# Notionista

A lightweight automation and tooling layer for interacting with Notion workspaces using the Model Context Protocol (MCP). Notionista provides schemas, configuration, and helper scripts to automate common workflows for projects, tasks, meetings, and portfolio items.

> [!info]
> This repository contains configuration and automation helpers for a Notion/MCP-based workflow. It is intentionally lightweight and focused on developer productivity.

## Quick overview

- Purpose: centralize Notion database schemas and MCP configuration used by automation agents.
- Language: TypeScript
- Primary files:
  - `config/databases.json` — canonical database IDs and safety limits
  - `src/schemas/*.ts` — TypeScript schema modules for Projects, Tasks, Teams, Meetings, Portfolio
  - `.github/prompts` — workspace prompts and automation guidance

## Features

- Canonical database configuration for Notion (IDs, URLs, properties).
- Typed schema definitions for core workspace databases.
- Guidance and prompts for safe automation workflows (Propose → Approve → Apply → Verify).

## Quick start

Prerequisites:

- Node.js 18+ (LTS)
- npm or yarn

Install dependencies:

```bash
npm install
# or
# yarn
```

Run tests (project uses Vitest):

```bash
npm test
# or
npm run test:watch
```

Project tasks (example):

```bash
# run a simple task defined in the workspace
npm run echo
```

## Repository layout

- `config/` — runtime configuration and canonical database metadata (`databases.json`).
- `src/schemas/` — TypeScript schema files describing Notion database shapes.
- `.github/prompts/` — prompts and templates used by automation agents.
- `AGENTS.md` — operational guidance for Copilot/agents interacting with Notion.
- `package.json`, `tsconfig.json`, `vitest.config.ts` — build and test configuration.

## Development notes

- The repo is intentionally small: most behavior is expressed via schemas and prompts.
- If you add new database IDs or change properties, keep `config/databases.json` in sync.
- Follow the safety workflow in `AGENTS.md` when creating automation that writes to Notion.

### Adding or editing schemas

1. Update or add a file under `src/schemas/` (use existing files as examples).
2. If the schema affects a Notion database, update `config/databases.json` accordingly.
3. Run tests / linting as needed.

## How to use

Use this repository as a source of truth for orchestration agents and automation tooling. Typical usage patterns:

- Read-only automation: query databases and generate proposals.
- Safe write automation: present changes, request approval, then apply minimal updates.
