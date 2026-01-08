# Sprint Planning Execution Guide

## Prerequisites

- Notion MCP integration connected
- Sprint Planning meeting exists for the target date (auto-generated)
- Team has active projects assigned via "Add Project" buttons

## Step 1: Query Active Projects

```text
Query Projects database:
- Filter: team = [Team]
- Filter: status = "Active"
- Filter: milestone = "M1" (current)
- Filter: phase = "P1.1" (current)
```

**MCP Tool:** `mcp_notionapi_API-query-data-source`

**Database ID:** `2d5a4e63-bf23-8115-a70f-000bc1ef9d05`

## Step 2: Query Sprint Planning Meeting

```text
Query Meetings database:
- Filter: type = "Sprint Planning"
- Filter: date = [sprint_start_date]
```

**MCP Tool:** `mcp_notionapi_API-query-data-source`

**Database ID:** `2caa4e63-bf23-815a-8981-000bbdbb7f0b`

## Step 3: Review Project Alignment

For each project, verify:

- Phase matches current dev cycle (P1.1)
- Milestone matches current milestone (M1)
- All 5 tasks (T01-T05) exist
- No blocking dependencies

## Step 4: Assign Projects to Meeting

```text
Update Sprint Planning meeting:
- Add projects to projects relation
- Add team to attendees relation
```

**MCP Tool:** `mcp_notionapi_API-patch-page`

**Requires:** User approval ("Approved")

## Step 5: Calculate Sprint Scope

Report:

- Total projects in sprint: X
- Total tasks to complete: X × 5 = Y
- Phase/milestone: M1 / P1.1
- Sprint dates: [start] to [end]

## Step 6: Identify Risks

Check for:

- Projects with incomplete task sets
- Carryover tasks from previous sprint
- Cross-team dependencies
