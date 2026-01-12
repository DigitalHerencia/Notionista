---
mode: agent
description: Execute daily meeting workflow - get next task and add to meeting
agent: Notion Dashboard Automation
---

# Daily Meeting Workflow

Execute the daily workflow for the specified team.

## Team

{{team}}

## Workflow Steps

1. **Query today's meeting** for the {{team}}
   - For Operations, Design, Engineering: Query their dedicated meeting
   - For Product, Marketing, Research: Query the shared Daily Standup

2. **Get next task** from the active project
   - Filter: `Done=false`
   - Sort by: `Task Code` ascending
   - Take: First result (next sequential task)

3. **Add task relation** to meeting's Action Items

4. **Update task due date** to today (if not already set)

5. **Report results**:
   - Meeting name and date
   - Task added (name and code)
   - Project context
   - Any previous task status

## Safety

- This is a write operation—await "Approved" before modifying the meeting
- Verify the meeting exists before attempting to add relations
- Confirm the task is from the correct team's active project
