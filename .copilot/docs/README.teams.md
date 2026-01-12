<!-- Placeholder: teams README -->

# Teams README

Placeholder for teams-related documentation.

# Copilot Teams Reference Guide

> **Purpose**: This document is the authoritative reference for Copilot to query, manage, and understand team structures in the Digital Herencia Notion workspace. Use this guide when working with team assignments, project allocation, and task coordination.

---

## Quick Reference

| Team             | Domain | ID                         | Icon Color | Primary Focus                            |
| ---------------- | ------ | -------------------------- | ---------- | ---------------------------------------- |
| Engineering Team | ENG    | `{{registry.redacted.49}}` | gray       | Technical development and implementation |
| Marketing Team   | MKT    | `{{registry.redacted.50}}` | purple     | Marketing and communications             |
| Operations Team  | OPS    | `{{registry.redacted.51}}` | green      | Operations and process management        |
| Design Team      | DES    | `{{registry.redacted.52}}` | pink       | UI/UX and visual design                  |
| Research Team    | RES    | `{{registry.redacted.53}}` | yellow     | Research and analysis                    |
| Product Team     | PROD   | `{{registry.redacted.54}}` | blue       | Product strategy and roadmap             |

---

## Teams Database Schema

**Database ID**: `{{registry.databases.teams.id}}`

### Properties

| Property              | Type     | Description                                                |
| --------------------- | -------- | ---------------------------------------------------------- |
| **Team name**         | title    | Team name (e.g., "Engineering Team")                       |
| **Meetings**          | relation | Links to Meetings database for team meetings               |
| **Tasks**             | relation | Links to Tasks database for assigned tasks                 |
| **Projects**          | relation | Links to Projects database for team projects               |
| **Tasks Completed**   | formula  | Displays "Tasks Completed: X/Y" based on task status       |
| **Projects Complete** | formula  | Displays "Projects Completed: X/Y" based on project status |

### Property IDs (for MCP Operations)

```json
{
  "Team name": "title",
  "Meetings": "%3DkEt",
  "Tasks": "B%7Bf%5C",
  "Projects": "T%3BR~",
  "Tasks Completed": "Mpl%60",
  "Projects Complete": "vXds"
}
```

---

## Team Page Structure

Each team page contains:

1. **Callout Block 1** (green background): Contains embedded **Projects database** for that team
   - Format: "{Domain} Projects" (e.g., "Ops Projects", "Eng Projects")
2. **Callout Block 2** (green background): Contains embedded **Tasks database** for that team
   - Format: "{Domain} Tasks" (e.g., "Ops Tasks", "Eng Tasks")

### Embedded Database Structure

Each team maintains its own filtered views of:

- **{Domain} Projects**: Projects filtered to show only this team's assignments
- **{Domain} Tasks**: Tasks filtered to show only this team's assignments

> **Note**: Embedded child databases may not be shared with the MCP integration. Use the main Projects and Tasks databases with team relation filters instead.

---

## Domain-Team Mapping

| Domain | Team             | Domain Code | Color  |
| ------ | ---------------- | ----------- | ------ |
| OPS    | Operations Team  | OPS         | green  |
| PROD   | Product Team     | PROD        | blue   |
| DES    | Design Team      | DES         | pink   |
| ENG    | Engineering Team | ENG         | gray   |
| MKT    | Marketing Team   | MKT         | purple |
| RES    | Research Team    | RES         | yellow |

---

## Team Workflow Patterns

### Sprint Cycle Integration

Teams participate in the 2-week sprint cycle:

1. **Sprint Planning** (Biweekly): Projects assigned to teams, milestones set
2. **Daily Standups**: Tasks assigned, progress tracked, blockers identified
3. **Post-mortem** (Biweekly): Sprint reviewed, lessons captured

### Team Responsibilities

| Team        | Typical Projects                  | Meeting Cadence |
| ----------- | --------------------------------- | --------------- |
| Operations  | Process improvements, SOPs        | Daily           |
| Product     | Roadmap items, feature specs      | Daily/Weekly    |
| Design      | UI/UX, wireframes, design systems | Daily           |
| Engineering | Implementation, tech debt         | Daily           |
| Marketing   | Campaigns, content, outreach      | Daily/Weekly    |
| Research    | Analysis, user research, insights | Weekly          |

---

## Formula Properties Explained

### Tasks Completed Formula

Displays: `"Tasks Completed: X/Y"` where:

- **X** = Count of tasks with `Done = true` linked to this team
- **Y** = Total count of tasks linked to this team

### Projects Complete Formula

Displays: `"Projects Completed: X/Y"` where:

- **X** = Count of projects with `Status = Done` linked to this team
- **Y** = Total count of projects linked to this team

---

## MCP Operation Examples

### Query All Teams

```typescript
const allTeams = await mcp.queryDataSource({
  data_source_id: '{{registry.databases.teams.id}}',
  page_size: 10,
});
```

### Get Specific Team

```typescript
const opsTeam = await mcp.retrievePage({
  page_id: '{{registry.redacted.51}}',
});
```

### Query Projects for a Team

```typescript
// Get all projects assigned to Operations Team
const opsProjects = await mcp.queryDataSource({
  data_source_id: '{{registry.databases.projects.id}}',
  filter: {
    property: 'Team',
    relation: {
      contains: '{{registry.redacted.51}}', // Operations Team ID
    },
  },
});
```

### Query Incomplete Tasks for a Team

```typescript
// Get incomplete tasks assigned to Engineering Team
const engTasks = await mcp.queryDataSource({
  data_source_id: '{{registry.databases.tasks.id}}',
  filter: {
    and: [
      {
        property: 'Team',
        relation: {
          contains: '{{registry.redacted.49}}', // Engineering Team ID
        },
      },
      {
        property: 'Done',
        checkbox: {
          equals: false,
        },
      },
    ],
  },
  sorts: [
    {
      property: 'Due',
      direction: 'ascending',
    },
  ],
});
```

### Query Team Meetings

```typescript
// Get upcoming meetings for Product Team
const productMeetings = await mcp.queryDataSource({
  data_source_id: '{{registry.databases.meetings.id}}',
  filter: {
    property: 'Team',
    relation: {
      contains: '{{registry.redacted.54}}', // Product Team ID
    },
  },
  sorts: [
    {
      property: 'Created',
      direction: 'descending',
    },
  ],
});
```

---

## Relation Patterns

### Core Relations

```text
Teams ─┬─→ Projects (one-to-many)
       ├─→ Tasks (one-to-many)
       └─→ Meetings (one-to-many)
```

### Bidirectional Links

When creating a project or task:

1. Set the `Team` relation on the project/task
2. The Teams database will automatically show the relation in its `Projects` or `Tasks` property

### Cascading Updates

- When a Task is marked `Done = true`, the team's "Tasks Completed" formula updates automatically
- When a Project `Status = Done`, the team's "Projects Complete" formula updates automatically

---

## Naming Conventions

| Entity  | Format                 | Example                     |
| ------- | ---------------------- | --------------------------- |
| Team    | `{Domain} Team`        | Engineering Team            |
| Project | Descriptive name       | Q1 Analytics Dashboard      |
| Task    | `{Verb} {Object}`      | Implement OAuth flow        |
| Meeting | `{Type} @{YYYY-MM-DD}` | Sprint Planning @2026-01-15 |

---

## Best Practices

### Team Assignment

1. **Every project** should have exactly one team assigned
2. **Every task** should have a project relation (and inherit team from project)
3. **Meetings** should specify attendee teams for proper filtering

### Progress Tracking

1. Use formula rollups (Tasks Completed, Projects Complete) for team health metrics
2. Query incomplete tasks by team for standup preparation
3. Filter projects by team + status for sprint planning

### Cross-Team Coordination

1. Use Meetings with multiple team attendees for cross-functional sync
2. Create separate tasks for each team when work spans domains
3. Document dependencies in project descriptions

---

## Troubleshooting

### Common Issues

| Issue                       | Solution                                                  |
| --------------------------- | --------------------------------------------------------- |
| Team relation not showing   | Ensure bidirectional relation is configured in Notion     |
| Formula not updating        | Check that related items (tasks/projects) have team links |
| Embedded database 404 error | Use main databases with team filters instead              |
| Wrong team assignment       | Update the `Team` property on the project/task page       |

### Access Errors

If you receive a 404 error when querying team-embedded databases:

- The child databases may not be shared with the MCP integration
- Use the main Projects/Tasks databases with team relation filters instead
- Contact workspace admin to share child databases if direct access is needed

---

## Related Documentation

- [README.meetings.md](README.meetings.md) - Meeting templates and block structures
- [README.projects.md](README.projects.md) - Project lifecycle and status workflow
- [README.tasks.md](README.tasks.md) - Task codes and completion patterns
- [config/databases.json](../../config/databases.json) - Database ID registry

---

## Team-Specific Databases (Projects & Tasks)

> **Terminology Note**: "Projects" and "Roadmaps" are interchangeable terms in this workspace.

Each team has embedded **Projects/Roadmap** and **Tasks** databases within their team page. These are child databases with team-specific views.

### Verified Access Status (as of 2026-01-07)

| Team        | Projects DB                                          | Projects Access | Tasks DB                                          | Tasks Access  |
| ----------- | ---------------------------------------------------- | --------------- | ------------------------------------------------- | ------------- |
| Operations  | `{{registry.teamDatabases.operations.projects.id}}`  | ✅ Accessible   | `{{registry.teamDatabases.operations.tasks.id}}`  | ✅ Accessible |
| Product     | `{{registry.teamDatabases.product.projects.id}}`     | ✅ Accessible   | `{{registry.teamDatabases.product.tasks.id}}`     | ✅ Accessible |
| Design      | `{{registry.teamDatabases.design.projects.id}}`      | ✅ Accessible   | `{{registry.teamDatabases.design.tasks.id}}`      | ✅ Accessible |
| Engineering | `{{registry.teamDatabases.engineering.projects.id}}` | ✅ Accessible   | `{{registry.teamDatabases.engineering.tasks.id}}` | ✅ Accessible |
| Marketing   | `{{registry.teamDatabases.marketing.projects.id}}`   | ✅ Accessible   | `{{registry.teamDatabases.marketing.tasks.id}}`   | ✅ Accessible |
| Research    | `{{registry.teamDatabases.research.courses.id}}`     | ✅ Accessible   | `{{registry.teamDatabases.research.modules.id}}`  | ✅ Accessible |

### Database Details

#### Operations Team

- **Ops Projects** (`{{registry.teamDatabases.operations.projects.id}}`)
  - Properties: Name (title), Phase (select), Create Project (button)
  - Color: green

- **Ops Tasks** (`{{registry.teamDatabases.operations.tasks.id}}`)
  - Properties: Task name (title), Project (select), Add Tasks (button)
  - Color: green

#### Product Team

- **Product Roadmap** (`{{registry.teamDatabases.product.projects.id}}`)
  - Properties: Initiative (title), Phase (select), Add Project (button)
  - Color: blue

- **Product Tasks** (`{{registry.teamDatabases.product.tasks.id}}`)
  - Properties: Task name (title), Project (select), Add Task (button)
  - Color: blue

#### Design Team

- **Design Roadmap** (`{{registry.teamDatabases.design.projects.id}}`)
  - Properties: Name (title), Phase (select), Add Project (button)
  - Color: pink

- **Design Tasks** (`{{registry.teamDatabases.design.tasks.id}}`)
  - Properties: Task (title), Select (select for project), Add Task (button)
  - Color: pink

#### Engineering Team

- **Engineering Roadmap** (`{{registry.teamDatabases.engineering.projects.id}}`)
  - Properties: Name (title), Phase (select), Add Project (button)
  - Color: gray

- **Engineering Tasks** (`{{registry.teamDatabases.engineering.tasks.id}}`)
  - Properties: Task name (title), Project (select), Add Task (button)
  - Color: gray

#### Marketing Team

- **Marketing Projects** (`{{registry.teamDatabases.marketing.projects.id}}`)
  - Properties: Name (title), Phase (select), Add Project (button)
  - Color: purple

- **Marketing Tasks** (`{{registry.teamDatabases.marketing.tasks.id}}`)
  - Properties: Name (title), Project (select), Add Task (button)
  - Color: purple

#### Research Team

- **Course Topics** (`{{registry.teamDatabases.research.courses.id}}`)
  - Properties: Name (title), Status (status), Modules (relation), Progress (rollup), Add Project (button)
  - Color: yellow

- **Learning Modules** (`{{registry.teamDatabases.research.modules.id}}`)
  - Properties: Name (title), Done (checkbox), Topic (relation), Add Tasks (button)
  - Color: yellow

- **LeetCode Blind 75 Tracker** (`{{registry.teamDatabases.research.leetcode.id}}`)
  - Properties: problem (title), difficulty (select), Topics (multi-select), Add Task (button)
  - Color: yellow

### MCP Examples for Team-Specific Databases

```typescript
// Query Operations team projects directly
const opsProjects = await mcp.queryDataSource({
  data_source_id: '{{registry.teamDatabases.operations.projects.id}}',
  page_size: 50,
});

// Query Engineering tasks directly
const engTasks = await mcp.queryDataSource({
  data_source_id: '{{registry.teamDatabases.engineering.tasks.id}}',
  filter: {
    property: 'Project',
    select: {
      equals: 'ENG-M2-P2.1-MVP – MVP Build',
    },
  },
});

// Fallback for inaccessible Product Projects: use main DB with filter
const productProjects = await mcp.queryDataSource({
  data_source_id: '{{registry.databases.projects.id}}', // Main Projects DB
  filter: {
    property: 'Team',
    relation: {
      contains: '{{registry.redacted.54}}', // Product Team ID
    },
  },
});
```

### Schema Reference

See [config/databases.json](../../config/databases.json) `teamDatabases` section for the complete mapping of team-specific database IDs with URLs and access notes.

---

## Appendix: Team Icons

| Team             | Icon          | Color     |
| ---------------- | ------------- | --------- |
| Engineering Team | command-line  | lightgray |
| Marketing Team   | megaphone     | purple    |
| Operations Team  | meeting       | green     |
| Design Team      | color-palette | pink      |
| Research Team    | chemistry     | yellow    |
| Product Team     | barcode       | blue      |
