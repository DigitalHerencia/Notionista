# Notion Portfolio Skill

This skill bundle provides automated Portfolio page creation for completed tasks.

## Purpose

Create Portfolio documentation for work artifacts:

1. Mark task as complete
2. Create Portfolio page with deliverable details
3. Link Portfolio to Task, Project, Team, Meeting
4. Archive completed task (optional)

## Files

- `skill.md` - This documentation
- `portfolio-workflow.md` - Step-by-step execution guide

## Usage

Invoke via the Notion Dashboard Automation agent:

```text
@Notion Dashboard Automation Complete task T02 and create Portfolio for the deliverable
```

## Portfolio Database Schema

| Property | Type     | Description                              |
| -------- | -------- | ---------------------------------------- |
| name     | title    | Work artifact name (typically task name) |
| tasks    | relation | Link to originating task                 |
| projects | relation | Link to parent project                   |
| teams    | relation | Link to responsible team                 |
| meetings | relation | Link to meeting where task was assigned  |

**Database ID:** `{{registry.databases.portfolio.id}}`

## When to Create Portfolio

Portfolio pages are manually created for:

- Completed deliverables (code, designs, documents)
- Milestones or achievements
- Artifacts that should be preserved and referenced

**Not all tasks need Portfolio pages.** Only create when there's a tangible output.

## MCP Tools Used

- `mcp_notionapi_API-query-data-source` - Get task details
- `mcp_notionapi_API-patch-page` - Mark task done, archive
- `mcp_notionapi_API-post-page` - Create Portfolio page

## Safety Notes

- Always await "Approved" before creating Portfolio pages
- Verify task is genuinely complete before marking done
- Portfolio pages require proper relations to be useful
