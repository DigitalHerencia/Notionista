# Notion Daily Workflow Skill

This skill bundle provides automated daily meeting workflows for the Digital Herencia Notion workspace.

## Purpose

Execute the daily workflow pattern:

1. Query today's meeting for a team
2. Get the next sequential task (T01→T02→T03→T04→T05)
3. Add task to meeting Action Items
4. Mark previous task as complete
5. Update task due date to today

## Files

- `skill.md` - This documentation
- `daily-workflow.md` - Step-by-step execution guide

## Usage

Invoke via the Notion Dashboard Automation agent:

```text
@Notion Dashboard Automation Run daily workflow for Engineering Team
```

## Team-Meeting Mapping

| Team        | Meeting Type           |
| ----------- | ---------------------- |
| Engineering | Engineering Meeting    |
| Design      | Design Meeting         |
| Operations  | Operations Meeting     |
| Product     | Daily Standup (shared) |
| Marketing   | Daily Standup (shared) |
| Research    | Daily Standup (shared) |

## MCP Tools Used

- `mcp_notionapi_API-query-data-source` - Query meetings and tasks
- `mcp_notionapi_API-patch-page` - Update meeting relations, mark task done
- `mcp_notionapi_API-post-search` - Find specific meetings by date

## Safety Notes

- Never create meetings (they auto-generate from templates)
- Always await "Approved" before write operations
- Verify task belongs to correct team/project before updating
