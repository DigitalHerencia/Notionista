# Copilot Instructions for Notion MCP (Digital Herencia Workspace)

This document operationalizes safe, controlled edits to your Notion using Model Context Protocol (MCP) in VS Code Copilot Chat. It documents the Digital Herencia team-based workspace structure and leverages relations, rollups, and formulas across your existing Notion databases.

## Scope & Guardrails

- Primary goal: Automate and maintain Digital Herencia team workflows in Notion using Copilot + MCP.
- Allowed operations (default):
  - Read-only: search, list/query data sources (databases), retrieve pages/blocks, read comments.
  - Write (requires explicit "Approved"): create/update pages, update properties, append blocks, add comments.
- Disallowed without explicit approval:
  - Bulk destructive actions (delete pages/blocks, erase content).
  - Moving pages/databases to new parents or workspaces.
  - Large-scale updates (>50 items) without a dry-run summary.

## Server & Auth

- Recommended: Notion MCP Remote
  - Configured in this workspace's `settings.json` under `github.copilot.chat.mcpServers` → `Notion` → `https://mcp.notion.com/mcp`.
  - Sign-in prompts will appear in Copilot Chat when tools require authorization.
- Alternative: Local open-source Notion MCP server
  - Env: `NOTION_TOKEN=ntn_***` (Internal Integration Token). Share target pages/databases with your integration in Notion UI.
  - If using HTTP transport, secure with a bearer `AUTH_TOKEN` and configure client headers accordingly.

## Safety Workflow (Propose → Approve → Apply)

1. Propose: Copilot must first query and list targets, and present intended changes (properties/content diffs) as a summary.
2. Approve: You reply with "Approved" to proceed. Otherwise, request revisions.
3. Apply: Copilot executes the minimal set of MCP tool calls to implement the plan.
4. Verify: Copilot re-queries affected items, confirms changes, and reports results.

## Digital Herencia Workspace Structure

### Core Databases

| Database       | Data Source ID                         | URL                                                    |
| -------------- | -------------------------------------- | ------------------------------------------------------ |
| **Teams**      | `2d5a4e63-bf23-8151-9b98-c81833668844` | https://www.notion.so/2d5a4e63bf2381519b98c81833668844 |
| **Projects**   | `2d5a4e63-bf23-81b1-b507-f5ac308958e6` | https://www.notion.so/2d5a4e63bf2381b1b507f5ac308958e6 |
| **Tasks**      | `2d5a4e63-bf23-816f-a217-ef754ce4a70e` | https://www.notion.so/2d5a4e63bf23816fa217ef754ce4a70e |
| **Meetings**   | `2d5a4e63-bf23-8168-af99-d85e20bfb76f` | https://www.notion.so/2d5a4e63bf238168af99d85e20bfb76f |
| **Prompts**    | `2d5a4e63-bf23-81fa-9ca8-f6368bcda19a` | https://www.notion.so/2d5a4e63bf2381fa9ca8f6368bcda19a |
| **Tech Stack** | `276a4e63-bf23-80e2-bbae-000b2fa9662a` | https://www.notion.so/276a4e63bf2380e2bbae0025cc95d009 |
| **Templates**  | `2d5a4e63-bf23-8162-8db4-fcce1bbe3471` | https://www.notion.so/2d5a4e63bf2381628db4fcce1bbe3471 |
| **SOPs**       | `2d8a4e63-bf23-801e-b6ac-e52358ee91dc` | https://www.notion.so/2d8a4e63bf23801eb6ace52358ee91dc |
| **Calendar**   | `2d5a4e63-bf23-8130-acc7-f5ee01d15f22` | https://www.notion.so/2d5a4e63bf238130acc7f5ee01d15f22 |

### Teams (6 Active)

Teams serve as de facto Areas and contain auxiliary mutable Project and Task databases where template items can be assigned via button properties.

| Team             | Role                                     |
| ---------------- | ---------------------------------------- |
| Engineering Team | Technical development and implementation |
| Design Team      | UI/UX and visual design                  |
| Marketing Team   | Marketing and communications             |
| Operations Team  | Operations and process management        |
| Product Team     | Product strategy and roadmap             |
| Research Team    | Research and analysis                    |

### Team-Specific Databases (Auxiliary)

| Database           | Data Source ID                         |
| ------------------ | -------------------------------------- |
| Marketing Tasks    | `2d5a4e63-bf23-816c-8877-000b6ff1beb5` |
| Marketing Projects | `2d2a4e63-bf23-81b1-a7ef-000bab5ba8f8` |
| Ops Tasks          | `2d5a4e63-bf23-8113-a0ef-000be10caf3e` |
| Ops Projects       | `2d2a4e63-bf23-8078-828e-000b16ccc334` |
| Design Tasks       | `2d5a4e63-bf23-8168-9326-000b7670541f` |
| Research           | `2d5a4e63-bf23-8167-b32a-000b356bda57` |

## Workflow: Sprint Cycle (2 Weeks)

1. **Sprint Planning Meeting** (biweekly): Assign projects to teams, set milestones.
2. **Daily Standups**: Assign tasks, track progress, remove blockers.
3. **Post-mortem Meeting**: Review completed sprint, capture lessons learned.
4. **Team Sync**: Regular coordination within each team.

### Project Lifecycle

- Projects are 2-week sprints with defined start and end dates.
- All project tasks must be completed for project to be marked done.
- Projects roll up to team-level completion metrics.

### Task Lifecycle

- Tasks are assigned during daily meetings.
- Tasks are relational to Projects (completion of all tasks = project done).
- Tasks use a checkbox `Done` property for completion tracking.

## Database Schemas

### Teams

- **Name** (title): Team name
- **Tasks Completed** (formula rollup): Derived from related Tasks
- **Projects Complete** (formula rollup): Derived from related Projects
- **Relations**: → Projects, → Tasks

### Projects

- **Name** (title): Project name
- **Status** (select): Active, Completed, On Hold, Cancelled
- **Milestone** (select): M1, M2, M3
- **Phase** (select): P1.1, P1.2, P1.3, P2.1, P2.2, P2.3, P3.1, P3.2, P3.3
- **Domain** (select): OPS, PROD, DES, ENG, MKT, RES
- **Start Date** (date): Sprint start
- **End Date** (date): Sprint end
- **Relations**: → Team, → Tasks

### Tasks

- **Name** (title): Task description (verb-object format)
- **Done** (checkbox): Completion status
- **Task Code** (formula): Auto-generated identifier
- **Due** (date): Task deadline
- **Priority** (select): High, Medium, Low
- **Relations**: → Project, → Team

### Meetings

- **Name** (title): Meeting topic and date
- **Type** (select): Standup, Sprint Planning, Post-mortem, Team Sync, Ad Hoc
- **Cadence** (select): Daily, Weekly, Biweekly, Monthly, Ad Hoc
- **Date** (date): Meeting date/time
- **Attendees** (relation): → Teams
- **Action Items** (relation): → Tasks
- **Relations**: → Projects, → Teams

### Prompts

- **Name** (title): Prompt name
- **Control Layer** (select): System, User, Assistant
- **Use Case** (multi-select): Code generation, Documentation, etc.
- **Relations**: → Team

### Tech Stack

- **Name** (title): Technology name
- **Category** (select): Language, Framework, Tool, Platform
- **Programming Languages** (multi-select): Python, TypeScript, etc.
- **Tags** (multi-select): Frontend, Backend, DevOps, etc.

### SOPs (Deprecated - Pending Update)

- Documentation pages with procedures (content to be updated in subsequent requests)

## Core Relations

```
Teams ─┬─→ Projects ─→ Tasks
       │       ↓         ↓
       │    Meetings ←───┘
       └─→ Tasks (direct)
```

- Teams ↔ Projects (one-to-many)
- Projects ↔ Tasks (one-to-many)
- Tasks → Project (many-to-one)
- Meetings → Teams, Projects, Tasks (many-to-many)

### Key Rollups

- **Team.Tasks Completed**: Count/percent of completed tasks across all team projects.
- **Team.Projects Complete**: Count/percent of completed projects for the team.
- **Project Progress**: Derived from percent-checked Tasks.

## MCP Tooling (Common Operations)

- Data sources (databases):
  - List/query: `retrieve-a-data-source`, `query-data-source`
  - Create/update: `create-a-data-source`, `update-a-data-source`
  - Templates: `list-data-source-templates`
- Pages/Blocks:
  - Create/update/move: `post-page`, `patch-page`, `move-page`
  - Read/children: `retrieve-a-page`, `get-block-children`, `retrieve-a-block`
  - Append/edit/delete blocks: `patch-block-children`, `update-a-block`, `delete-a-block`
- Comments:
  - Create/read: `create-a-comment`, `retrieve-a-comment`
- Search:
  - Title search: `post-search` (pages and data sources)
- Users:
  - Self/users: `get-self`, `get-user`, `get-users`

Copilot should prefer read-only calls first, then present a proposal before running write operations.

## Naming Conventions

- Projects: `<Project Name>` (descriptive, no prefix required)
- Tasks: `<Verb Object>` (action-oriented description)
- Meetings: `<Type> <YYYY-MM-DD>` (e.g., "Sprint Planning 2025-01-15")
- Teams: `<Domain> Team` (e.g., "Engineering Team")

## Change Request Templates

- "Create a project titled `<X>`, domain `<Y>`, milestone `<Z>`, linked to `<Team>`."
- "Create a task `<T>` for project `<P>`, due `<Date>`."
- "Mark task `<T>` as done."
- "Schedule a `<Type>` meeting for `<Date>` with `<Team>` attendees."
- "Query all incomplete tasks for `<Team>`."

## Pre-Change Checklist (Copilot Must Confirm)

1. Server: Using Notion MCP Remote (`https://mcp.notion.com/mcp`) or local MCP with valid token.
2. Access: Target pages/databases are shared with the integration (avoid 404).
3. Scope: List precise targets (IDs/URLs) and the properties/content to change.
4. Safety: No bulk destructive actions; limit batch size; include dry-run summary.
5. Approval: Await explicit "Approved" before writing.
6. Post-change: Re-query to verify changes and report results.

## Formula Cheat Sheet (Quick Reference)

- Logic: `if`, `ifs`, `empty`, `and/or/not`
- Text: `format`, `replaceAll`, `contains`, `slice`, `length`, `concat`
- Regex: `test`, `match`, `replace`
- Dates: `now`, `dateAdd`, `dateBetween`, `formatDate`, `timestamp`
- Numbers: `toNumber`, `round`, `min/max`, `sum/mean`
- Patterns: Snooze dates, recurring tasks, rollup-driven progress, next-action filters

## Limitations & Best Practices

- Share specific databases/pages with the integration to avoid permission errors.
- Prefer property updates over wholesale content rewrites.
- Keep rollup chains simple to avoid evaluation limits.
- Respect rate limits; avoid excessive parallel calls.
- Use data source IDs (not page IDs) when querying databases.

---

Use this file as the authoritative guide for Copilot's behavior in this workspace. All changes to Notion must follow the Propose → Approve → Apply workflow.
