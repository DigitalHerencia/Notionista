# Portfolio Creation Execution Guide

## Prerequisites

- Notion MCP integration connected
- Task exists and has a deliverable to document
- Task has proper relations (project, team)

## Step 1: Query the Task

```text
Query Tasks database:
- Filter: name = [task_name] OR id = [task_id]
- Include: project relation, team relation, done status
```

**MCP Tool:** `mcp_notionapi_API-query-data-source`

**Database ID:** `{{registry.databases.tasks.id}}`

## Step 2: Mark Task Complete

```text
Update task page:
- Set done = true
```

**MCP Tool:** `mcp_notionapi_API-patch-page`

**Requires:** User approval ("Approved")

## Step 3: Create Portfolio Page

```text
Create page in Portfolio database:
- parent: { database_id: "{{registry.databases.portfolio.id}}" }
- properties:
  - title: [Task Name / Deliverable Name]
  - tasks: [Task ID]
  - projects: [Project ID from task relation]
  - teams: [Team ID from task relation]
  - meetings: [Meeting ID if known]
```

**MCP Tool:** `mcp_notionapi_API-post-page`

**Requires:** User approval ("Approved")

## Step 4: Add Content (Optional)

```text
Append blocks to Portfolio page:
- Description of deliverable
- Links to artifacts (code, designs, docs)
- Key decisions or notes
```

**MCP Tool:** `mcp_notionapi_API-patch-block-children`

## Step 5: Archive Task (Optional)

```text
Update task page:
- Set archived = true
```

**MCP Tool:** `mcp_notionapi_API-patch-page`

## Step 6: Report Results

Provide summary:

- Task: [Name] marked complete
- Portfolio: [Name] created with ID [id]
- Relations established:
  - Task ↔ Portfolio
  - Project ↔ Portfolio
  - Team ↔ Portfolio
- Next task: T0X ready for assignment
