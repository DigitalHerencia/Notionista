# Daily Workflow Execution Guide

## Prerequisites

- Notion MCP integration connected
- Team has an active project with incomplete tasks
- Today's meeting exists (auto-generated from template)

## Step 1: Query Today's Meeting

```text
Query Meetings database:
- Filter: date = today
- Filter: attendees contains [Team]
- OR: type = "Standup" (for Product/Marketing/Research)
```

**MCP Tool:** `mcp_notionapi_API-query-data-source`

**Database ID:** `{{registry.databases.meetings.id}}`

## Step 2: Get Next Task

```text
Query Tasks database:
- Filter: team = [Team]
- Filter: done = false
- Sort: task_code ascending
- Limit: 1 (take first)
```

**MCP Tool:** `mcp_notionapi_API-query-data-source`

**Database ID:** `{{registry.databases.tasks.id}}`

## Step 3: Add Task to Meeting

```text
Update meeting page:
- Add task to action_items relation
```

**MCP Tool:** `mcp_notionapi_API-patch-page`

**Requires:** User approval ("Approved")

## Step 4: Complete Previous Task (if applicable)

```text
If previous task exists (e.g., T01 when adding T02):
- Set done = true
- Optionally set archived = true
```

**MCP Tool:** `mcp_notionapi_API-patch-page`

## Step 5: Update Task Due Date

```text
Update the newly added task:
- Set due = today
```

**MCP Tool:** `mcp_notionapi_API-patch-page`

## Step 6: Report Results

Provide summary:

- Meeting: [Name] on [Date]
- Task Added: [Task Name] (T0X)
- Project: [Project Name]
- Previous Task: [Marked complete / N/A]
- Progress: X/5 tasks complete
