<!-- Placeholder: portfolio README -->

# Portfolio README

Placeholder for portfolio documentation.

# Copilot Portfolio Reference Guide

> **Purpose**: This document is the authoritative reference for Copilot to query, manage, and understand the Portfolio database in the Digital Herencia Notion workspace. Use this guide when working with work artifacts, task outputs, and deliverable documentation.

---

## Quick Reference

| Property | Type     | Description                             |
| -------- | -------- | --------------------------------------- |
| Name     | title    | Task name used as the page title        |
| Tasks    | relation | Link to the originating task            |
| Meetings | relation | Link to meeting where task was assigned |
| Teams    | relation | Link to the responsible team            |
| Projects | relation | Link to the parent project              |

---

## Portfolio Database Schema

**Database ID**: `{{registry.databases.portfolio.id}}`

### Purpose

The Portfolio database stores **work artifacts** generated from completed tasks. Each portfolio item:

- Is named after the task (using the task name as the page title)
- Links to the originating task for traceability
- Links to the meeting where the task was assigned
- Links to the responsible team
- Links to the parent project

This creates a complete audit trail from meeting → task → deliverable.

### Properties

| Property     | Type     | ID      | Required | Description               |
| ------------ | -------- | ------- | -------- | ------------------------- |
| **Name**     | title    | `title` | ✅       | Task name (page title)    |
| **Tasks**    | relation | `UjCt`  | ✅       | Link to originating Task  |
| **Meetings** | relation | `ZpMt`  | ✅       | Link to assigning Meeting |
| **Teams**    | relation | `fsXi`  | ✅       | Link to responsible Team  |
| **Projects** | relation | `{bbP`  | ✅       | Link to parent Project    |

### Property IDs (for MCP Operations)

```json
{
  "Name": "title",
  "Tasks": "UjCt",
  "Meetings": "ZpMt",
  "Teams": "fsXi",
  "Projects": "%7BbbP"
}
```

---

## Relation Structure

```text
Meeting ──→ Task ──→ Portfolio Item
   │          │           │
   │          └───────────┤
   └──────────────────────┤
                          │
Team ─────────────────────┤
                          │
Project ──────────────────┘
```

Each Portfolio item has **four relations**:

1. **Tasks**: The task that generated this work artifact
2. **Meetings**: The meeting where the task was originally assigned
3. **Teams**: The team responsible for the work
4. **Projects**: The project this work belongs to

---

## Workflow Integration

### Task Completion → Portfolio

When a task is completed:

1. Create a new Portfolio page with the task name
2. Link to the completed task
3. Link to the meeting where task was assigned
4. Link to the responsible team
5. Link to the parent project
6. Add deliverable content to the page body

### Naming Convention

Portfolio items use the task name as the page title:

- Format: `{Task Code} {Task Description}`
- Examples:
  - "T01 Define company objectives"
  - "T02 Messaging framework"
  - "T01 Core user flows"

---

## MCP Operation Examples

### Query All Portfolio Items

```typescript
const portfolio = await mcp.queryDataSource({
  data_source_id: '{{registry.databases.portfolio.id}}',
  page_size: 50,
});
```

### Query Portfolio Items by Team

```typescript
const teamPortfolio = await mcp.queryDataSource({
  data_source_id: '{{registry.databases.portfolio.id}}',
  filter: {
    property: 'Teams',
    relation: {
      contains: '{{registry.redacted.32}}', // Engineering Team ID
    },
  },
});
```

### Query Portfolio Items by Project

```typescript
const projectPortfolio = await mcp.queryDataSource({
  data_source_id: '{{registry.databases.portfolio.id}}',
  filter: {
    property: 'Projects',
    relation: {
      contains: 'PROJECT_ID_HERE',
    },
  },
});
```

### Create New Portfolio Item

```typescript
const newItem = await mcp.postPage({
  parent: {
    database_id: '{{registry.databases.portfolio.id}}',
  },
  properties: {
    Name: {
      title: [{ text: { content: 'T03 Feature implementation' } }],
    },
    Tasks: {
      relation: [{ id: 'TASK_ID_HERE' }],
    },
    Meetings: {
      relation: [{ id: 'MEETING_ID_HERE' }],
    },
    Teams: {
      relation: [{ id: 'TEAM_ID_HERE' }],
    },
    Projects: {
      relation: [{ id: 'PROJECT_ID_HERE' }],
    },
  },
});
```

### Get Portfolio Item with Relations

```typescript
const item = await mcp.retrievePage({
  page_id: 'PORTFOLIO_ITEM_ID',
});

// Extract relation IDs
const taskId = item.properties.Tasks.relation[0]?.id;
const meetingId = item.properties.Meetings.relation[0]?.id;
const teamId = item.properties.Teams.relation[0]?.id;
const projectId = item.properties.Projects.relation[0]?.id;
```

---

## TypeScript Schema Usage

Import the Portfolio schemas from the schemas module:

```typescript
import { Portfolio } from '../schemas';

// Validate a portfolio page
const validatedPage = Portfolio.PortfolioPage.parse(apiResponse);

// Get the name
const name = Portfolio.getPortfolioName(validatedPage);

// Get relation IDs
const taskIds = Portfolio.getTaskIds(validatedPage);
const meetingIds = Portfolio.getMeetingIds(validatedPage);
const teamIds = Portfolio.getTeamIds(validatedPage);
const projectIds = Portfolio.getProjectIds(validatedPage);

// Build a create payload
const payload = Portfolio.buildCreatePayload('T03 Feature implementation', taskId, {
  meetingId: 'MEETING_ID',
  teamId: 'TEAM_ID',
  projectId: 'PROJECT_ID',
});
```

---

## Best Practices

### Creating Portfolio Items

1. **Always link to the originating task** - This is the core relation
2. **Include meeting context** - Links back to where the work was assigned
3. **Set team ownership** - Identifies who produced the work
4. **Connect to project** - Provides project-level organization

### Content Structure

Each Portfolio page should contain:

1. **Summary** - Brief description of the deliverable
2. **Artifacts** - Links, embeds, or descriptions of outputs
3. **Notes** - Context, decisions, and lessons learned
4. **Next Steps** - Follow-up actions if applicable

### Querying Patterns

- Filter by **Team** to see team-specific deliverables
- Filter by **Project** to see project outputs
- Filter by **Meeting** to see work assigned in a specific meeting
- Sort by **created_time** to see recent deliverables

---

## Related Documentation

- [README.tasks.md](README.tasks.md) - Task database and completion workflow
- [README.meetings.md](README.meetings.md) - Meeting database and action items
- [README.teams.md](README.teams.md) - Team structure and assignments
- [README.projects.md](README.projects.md) - Project lifecycle
- [config/databases.json](../../config/databases.json) - Database ID registry

---

## Appendix: Database Icon

| Database  | Icon      | Color |
| --------- | --------- | ----- |
| Portfolio | briefcase | gray  |
