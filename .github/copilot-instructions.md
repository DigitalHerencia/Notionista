# Copilot Instructions for Notion MCP (Digital Herencia Workspace)

This document operationalizes safe, controlled edits to your Notion using Model Context Protocol (MCP) in VS Code Copilot Chat. It documents the Digital Herencia team-based workspace structure and leverages relations, rollups, and formulas across your existing Notion databases.

> **Current Dev Cycle:** Competitive Advantage (SaaS Product) — M1 / P1.1
> **Reference:** See [.copilot/reports/project-task-reference.md](../.copilot/reports/project-task-reference.md) for complete project/task inventory.

## Related repositories

- Competitive Advantage product/code repo: [DigitalHerencia/CompetitiveAdvantage](https://github.com/DigitalHerencia/CompetitiveAdvantage)
- Local reference (how this workspace relates to it): [`.copilot/docs/competitive-advantage-repo.md`](../.copilot/docs/competitive-advantage-repo.md)

## Scope & Guardrails

- Primary goal: Automate and maintain Digital Herencia team workflows in Notion using Copilot + MCP.
- Allowed operations (default):
  - Read-only: search, list/query data sources (databases), retrieve pages/blocks, read comments.
  - Write (requires explicit "Approved"): create/update pages, update properties, append blocks, add comments.
- Disallowed without explicit approval:
  - Bulk destructive actions (delete pages/blocks, erase content).
  - Moving pages/databases to new parents or workspaces.
  - Large-scale updates (>50 items) without a dry-run summary.
- **Critical:** Never create meetings—they are recurring templates that auto-generate. Only add relations to existing meetings.

## Safety Workflow (Propose → Approve → Apply)

1. Propose: Copilot must first query and list targets, and present intended changes (properties/content diffs) as a summary.
2. Approve: You reply with "Approved" to proceed. Otherwise, request revisions.
3. Apply: Copilot executes the minimal set of MCP tool calls to implement the plan.
4. Verify: Copilot re-queries affected items, confirms changes, and reports results.

## Digital Herencia Workspace Structure

> **Note**: Database IDs and URLs are maintained in [config/databases.json](../config/databases.json). Always reference that file as the authoritative source for current database identifiers.

### Core Databases

| Database       | Notes                                                  |
| -------------- | ------------------------------------------------------ |
| **Teams**      | Primary teams database (6 active teams)                |
| **Projects**   | Company-wide projects (89 total across all teams)      |
| **Tasks**      | All tasks across teams (433 total)                     |
| **Meetings**   | Recurring meeting templates (never manually created)   |
| **Portfolio**  | Work artifacts from completed tasks (manually created) |
| **Tech Stack** | Technology inventory                                   |
| **Calendar**   | Team calendar                                          |

### Teams (6 Active)

Teams serve as de facto Areas and contain auxiliary mutable Project and Task databases where template items can be assigned via button properties ("Add Project" / "Add Task").

| Team             | Role                                      | Meeting Type          |
| ---------------- | ----------------------------------------- | --------------------- |
| Engineering Team | Technical development and implementation  | Engineering Meeting   |
| Design Team      | UI/UX and visual design                   | Design Meeting        |
| Marketing Team   | Marketing and communications              | Daily Standup (shared)|
| Operations Team  | Operations and process management         | Operations Meeting    |
| Product Team     | Product strategy and roadmap              | Daily Standup (shared)|
| Research Team    | Research and analysis (topics/modules)    | Daily Standup (shared)|

### Meeting-Team Mapping

**Shared Daily Standup:** Product, Marketing, Research teams share one standup.
**Individual Daily Meetings:** Operations, Design, Engineering each have dedicated meetings.

## Workflow: Sprint Cycle (2 Weeks)

### Phase & Milestone Structure

| Milestone | Description                          |
| --------- | ------------------------------------ |
| **M1**    | Foundation & Core Infrastructure     |
| **M2**    | Feature Development & Integration    |
| **M3**    | Polish, Launch & Optimization        |

| Phase     | Description                          |
| --------- | ------------------------------------ |
| **P1.1**  | Requirements Gathering & Planning    |
| **P1.2**  | Architecture & Technical Design      |
| **P1.3**  | Core Infrastructure Setup            |
| **P2.1**  | Feature Development Sprint 1         |
| **P2.2**  | Feature Development Sprint 2         |
| **P2.3**  | Integration & Testing                |
| **P3.1**  | Performance Optimization             |
| **P3.2**  | User Acceptance Testing              |
| **P3.3**  | Launch & Post-Launch Support         |

### Sprint Workflow

1. **Sprint Planning Meeting** (biweekly): Projects are assigned to teams via relation properties.
2. **Daily Meetings**: Tasks are assigned via "Add Task" buttons, then linked to meeting Action Items.
3. **Post-mortem Meeting**: Review completed sprint, capture lessons learned.
4. **Team Sync**: Regular coordination within each team.

### Project Lifecycle

- Projects are predefined in team pages with "Add Project" buttons.
- Adding a project populates the main Projects database with team relation.
- Projects are 2-week sprints with defined start and end dates.
- All project tasks must be completed for project to be marked done.
- Projects roll up to team-level completion metrics.

### Task Lifecycle

- Tasks are predefined in team pages with "Add Task" buttons.
- Adding a task populates the main Tasks database with project/team relations.
- Tasks follow sequential codes: T01 → T02 → T03 → T04 → T05 per project.
- Tasks are assigned daily and **completed the same day**.
- Task coloring: **green = due today**, **red = overdue**.
- Archive via `Archived` checkbox property (views filter `Archived != true`).

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

### Tech Stack

- **Name** (title): Technology name
- **Category** (select): Language, Framework, Tool, Platform
- **Programming Languages** (multi-select): Python, TypeScript, etc.
- **Tags** (multi-select): Frontend, Backend, DevOps, etc.

## Core Relations

```text
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

## Research Team Structure

> **Note:** Research Team uses **Topics** (equivalent to Projects) and **Learning Modules** (equivalent to Tasks). The same workflows apply—Topics are assigned in sprint planning, Modules are assigned daily.

## MCP Tooling (Common Operations)

MCP tools are accessed via Copilot Chat using the `mcp_notionapi_API-*` prefix.

- Data sources (databases):
  - Retrieve: `mcp_notionapi_API-retrieve-a-data-source`
  - Query: `mcp_notionapi_API-query-data-source`
  - Update: `mcp_notionapi_API-update-a-data-source`
  - Templates: `mcp_notionapi_API-list-data-source-templates`
  - **Note**: Use database IDs from [../config/databases.json](../config/databases.json) for all operations
- Pages/Blocks:
  - Create page: `mcp_notionapi_API-post-page`
  - Update page: `mcp_notionapi_API-patch-page`
  - Move page: `mcp_notionapi_API-move-page`
  - Retrieve page: `mcp_notionapi_API-retrieve-a-page`
  - Retrieve block: `mcp_notionapi_API-retrieve-a-block`
  - Get children: `mcp_notionapi_API-get-block-children`
  - Append children: `mcp_notionapi_API-patch-block-children`
  - Update block: `mcp_notionapi_API-update-a-block`
  - Delete block: `mcp_notionapi_API-delete-a-block`
- Comments:
  - Create: `mcp_notionapi_API-create-a-comment` (via activate_data_source_management_tools)
  - Retrieve: `mcp_notionapi_API-retrieve-a-comment`
- Search:
  - Title search: `mcp_notionapi_API-post-search` (pages and data sources)
- Users:
  - Self: `mcp_notionapi_API-get-self`
  - Get user: `mcp_notionapi_API-get-user`
  - List users: `mcp_notionapi_API-get-users`

Copilot should prefer read-only calls first, then present a proposal before running write operations.

## Naming Conventions

- Projects: `<Project Name>` (descriptive, no prefix required)
- Tasks: `<Verb Object>` (action-oriented description)
- Meetings: `<Type> <YYYY-MM-DD>` (e.g., "Sprint Planning 2025-01-15")
- Teams: `<Domain> Team` (e.g., "Engineering Team")

## Change Request Templates

- "Query all incomplete tasks for `<Team>`."
- "Mark task `<T>` as done."
- "Add task `<T>` to today's `<Meeting>` Action Items."
- "Create a Portfolio page for completed task `<T>`."
- "Get next task for `<Project>`." (filter: `Done=false`, sort by `Task Code`, take first)
- "Show dev cycle status for `<Team>`."

> **Note:** Do not use "Schedule a meeting" or "Create a meeting"—meetings auto-generate from recurring templates.

## Workflow Patterns

### Daily Workflow

1. **Query today's meeting** for the relevant team
2. **Get next task** from project (filter: `Done=false`, sort by `Task Code`, take first)
3. **Add task relation** to meeting's Action Items
4. **Complete previous task** (mark `Done=true`) if applicable
5. **Update task due date** to today

### Task Completion Workflow

1. **Mark task Done** (`Done=true`)
2. **Create Portfolio page** (if deliverable exists)
3. **Link Portfolio** to originating Task, Project, Team
4. **Archive task** if needed (`Archived=true`)

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
