# Copilot Tasks Reference Guide

> **Purpose**: This document is the authoritative reference for Copilot to query, create, update, and manage task pages in the Digital Herencia Notion workspace. Use this guide when assigning work items, tracking completion, and managing daily workflows.

---

## Quick Reference

| Task Code | Sequence | Usage                      |
| --------- | -------- | -------------------------- |
| T01       | First    | Initial/foundational tasks |
| TO2       | Second   | Follow-up tasks            |
| TO3       | Third    | Tertiary tasks             |
| T04       | Fourth   | Additional tasks           |
| T05       | Fifth    | Extended scope tasks       |

---

## Tasks Database Schema

**Database ID**: `2d5a4e63-bf23-8137-8277-000b41c867c3`

### Properties

| Property         | Type         | Values/Notes                                                        |
| ---------------- | ------------ | ------------------------------------------------------------------- |
| **Name**         | title        | Format: `{TaskCode} {Verb} {Object}`                                |
| **Done**         | checkbox     | Completion status (true/false)                                      |
| **Task Code**    | select       | `T01`, `TO2`, `TO3`, `T04`, `T05`                                   |
| **Created time** | created_time | Auto-set on task creation                                           |
| **Project**      | relation     | Links to Projects database (`2d5a4e63-bf23-8115-a70f-000bc1ef9d05`) |
| **Team**         | relation     | Links to Teams database (`2d5a4e63-bf23-816b-9f75-000b219f7713`)    |
| **Meetings**     | relation     | Links to Meetings database (`2caa4e63-bf23-815a-8981-000bbdbb7f0b`) |

### Property IDs (for MCP Operations)

```json
{
  "Name": "title",
  "Done": "%3FN%3AC",
  "Task Code": "%3Er%40C",
  "Created time": "N%5D%5Cg",
  "Project": "wgnL",
  "Team": "KP%5Eq",
  "Meetings": "ErfI"
}
```

### Select Option IDs

**Task Code Options**:

| Option | ID      |
| ------ | ------- |
| T01    | `q[<}`  |
| TO2    | `sw{t`  |
| TO3    | `<YYw`  |
| T04    | `BnJw`  |
| T05    | `eR\`r` |

---

## Task Naming Convention

**Format**: `{TaskCode} {Verb} {Object}`

**Examples**:

- `T01 Define company objectives`
- `T01 Core user flows`
- `T01 Market synthesis`
- `T01 Audit workspace & repo state`
- `T02 Tenant & RBAC assumptions`
- `T02 Define key results`
- `T02 Validate PRD & TechReq presence`

### Verb Guidelines (Action-Oriented)

| Category  | Verbs                                  |
| --------- | -------------------------------------- |
| Research  | Analyze, Research, Investigate, Review |
| Create    | Build, Create, Design, Develop, Write  |
| Define    | Define, Document, Outline, Specify     |
| Validate  | Validate, Verify, Test, Audit, Check   |
| Update    | Update, Refactor, Optimize, Improve    |
| Configure | Configure, Setup, Initialize, Deploy   |

---

## Task Lifecycle

```
Created → In Progress (unchecked) → Done (checked)
                │
                └── Linked to Meeting (daily standup)
```

### State Transitions

| State       | Done Checkbox | Trigger                   |
| ----------- | ------------- | ------------------------- |
| Created     | `false`       | Task added to database    |
| In Progress | `false`       | Work has started          |
| Done        | `true`        | Work completed, validated |

---

## Task Code Sequencing

### Within a Project

Tasks are sequenced by code within each project:

| Code | Purpose            | Example                         |
| ---- | ------------------ | ------------------------------- |
| T01  | Foundation/Initial | Define requirements             |
| TO2  | Build on T01       | Implement based on requirements |
| TO3  | Extend/Refine      | Add advanced features           |
| T04  | Polish/Optimize    | Performance tuning              |
| T05  | Extended scope     | Nice-to-haves                   |

### Cross-Project Patterns

Tasks with the same code across projects represent parallel work:

- All `T01` tasks = foundation work across all domains
- All `TO2` tasks = second iteration across all domains

---

## Relation Patterns

### Tasks → Project

- Each task belongs to one project
- Project completion = all tasks Done
- Task inherits project's domain context

### Tasks → Team

- Each task is assigned to one team
- Team should match project's team
- Enables team-level workload queries

### Tasks → Meetings

- Tasks link to meetings where they were discussed
- Daily standups reference active tasks
- Action items from meetings become tasks

---

## MCP Operation Examples

### Create a New Task

```json
{
  "parent": { "database_id": "2d5a4e63-bf23-8137-8277-000b41c867c3" },
  "properties": {
    "Name": {
      "title": [{ "text": { "content": "T01 Implement authentication flow" } }]
    },
    "Done": { "checkbox": false },
    "Task Code": { "select": { "name": "T01" } },
    "Project": { "relation": [{ "id": "PROJECT_PAGE_ID" }] },
    "Team": { "relation": [{ "id": "2d5a4e63-bf23-8034-a68a-f4e24b342def" }] }
  }
}
```

### Query Incomplete Tasks

```json
{
  "filter": {
    "property": "Done",
    "checkbox": { "equals": false }
  },
  "sorts": [{ "property": "Created time", "direction": "ascending" }]
}
```

### Query Tasks by Project

```json
{
  "filter": {
    "property": "Project",
    "relation": { "contains": "PROJECT_PAGE_ID" }
  }
}
```

### Query Tasks by Team

```json
{
  "filter": {
    "property": "Team",
    "relation": { "contains": "2d5a4e63-bf23-8034-a68a-f4e24b342def" }
  }
}
```

### Mark Task as Done

```json
{
  "properties": {
    "Done": { "checkbox": true }
  }
}
```

### Query Today's Tasks (with Meeting)

```json
{
  "filter": {
    "and": [
      { "property": "Done", "checkbox": { "equals": false } },
      { "property": "Meetings", "relation": { "contains": "TODAY_MEETING_ID" } }
    ]
  }
}
```

---

## Context Carryover Rules

### Daily Standup → Task Management

| Action          | Source                    | Target                      |
| --------------- | ------------------------- | --------------------------- |
| Report progress | Task status (Done/Not)    | Meeting "Yesterday" section |
| Assign work     | Meeting action items      | Create new tasks            |
| Mark complete   | Discussion confirmation   | Set Done = true             |
| Carry forward   | Incomplete from yesterday | Today's task list           |

### Meeting Action Items → Task Creation

| Meeting Field    | Task Field   | Mapping                        |
| ---------------- | ------------ | ------------------------------ |
| Action item text | Name         | Prefix with next Task Code     |
| Meeting date     | Created time | Auto-set                       |
| Meeting team     | Team         | Inherit from meeting attendees |
| Meeting project  | Project      | Link to meeting's project      |
| Meeting ID       | Meetings     | Create relation                |

---

## Rollup Calculations

### Project-Level Metrics

**Task Completion** (on Projects database):

- Rollup from Tasks relation
- Property: `Done` (checkbox)
- Calculation: `Percent checked`

### Team-Level Metrics

**Tasks Completed** (on Teams database):

- Rollup from Tasks relation
- Property: `Done` (checkbox)
- Calculation: `Count checked`

---

## Sample Tasks (Current Sprint)

| Task Code | Name                            | Project            | Team        | Done |
| --------- | ------------------------------- | ------------------ | ----------- | ---- |
| T01       | Define company objectives       | OPS-M1-P1.1-OKR    | Operations  | ✓    |
| T01       | Market synthesis                | PROD-M1-P1.1-PRD   | Product     | ✓    |
| T01       | Core user flows                 | DES-M1-P1.1-UXARCH | Design      | ✓    |
| T01       | Audit workspace & repo state    | ENG-M1-P1.1-INIT   | Engineering | ✓    |
| T01       | Positioning statement           | MKT-M1-P1.1-POS    | Marketing   | ✓    |
| T01       | Core concepts & complexity      | RES-M1-P1.1-A&S    | Research    | ✓    |
| TO2       | Define key results              | OPS-M1-P1.1-OKR    | Operations  | ✓    |
| TO2       | Tenant & RBAC assumptions       | PROD-M1-P1.1-PRD   | Product     | ✓    |
| TO2       | Sliding window patterns         | RES-M1-P1.1-A&S    | Research    | ☐    |
| TO2       | Validate PRD & TechReq presence | ENG-M1-P1.1-INIT   | Engineering | ✓    |

---

## Batch Operations

### Create Multiple Tasks for a Project

When creating a new project, generate initial tasks:

```javascript
const projectId = 'NEW_PROJECT_ID';
const teamId = 'TEAM_ID';
const tasks = [
  'T01 Define requirements',
  'T01 Research existing solutions',
  'TO2 Create initial design',
  'TO2 Implement prototype',
];

for (const taskName of tasks) {
  // Create task with MCP post-page
}
```

### Bulk Mark Tasks Done

After sprint review, mark all reviewed tasks as complete:

```javascript
const taskIds = ['task1_id', 'task2_id', 'task3_id'];

for (const taskId of taskIds) {
  // Update each task with Done = true
}
```

---

## Validation Rules

1. **Name Format**: Should start with Task Code followed by verb-object description
2. **Project Link**: Every task must be linked to a project
3. **Team Match**: Task's team should match project's team
4. **Code Sequence**: Task codes should progress (T01 before TO2, etc.)
5. **Meeting Link**: Active tasks should link to relevant meetings

---

## Error Handling

| Error             | Cause                     | Resolution                     |
| ----------------- | ------------------------- | ------------------------------ |
| Orphaned task     | No project relation       | Link to appropriate project    |
| Missing team      | Team relation empty       | Inherit from project's team    |
| Invalid task code | Code not in T01-T05 range | Use valid select option        |
| Duplicate task    | Same name in same project | Rename or merge duplicates     |
| Stale task        | Old task never completed  | Review and archive or complete |

---

## Team IDs Quick Reference

| Team        | ID                                     |
| ----------- | -------------------------------------- |
| Product     | `2d5a4e63-bf23-818d-a26b-c86434571d4a` |
| Marketing   | `2d5a4e63-bf23-80fd-bf70-f6d679ba0d14` |
| Research    | `2d5a4e63-bf23-8081-9ff6-e8ecf118aee6` |
| Operations  | `2d5a4e63-bf23-808e-96c6-e13df82c008b` |
| Design      | `2d5a4e63-bf23-8097-bffe-dd7bde5a3f69` |
| Engineering | `2d5a4e63-bf23-8034-a68a-f4e24b342def` |
