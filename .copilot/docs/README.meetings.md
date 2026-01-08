# Copilot Meeting Reference Guide

> **Purpose**: This document is the authoritative reference for Copilot to query, fill out, and manage meeting pages in the Digital Herencia Notion workspace. Use this guide when populating daily meetings with context from previous days and foresight for upcoming work.

---

## Quick Reference

| Meeting Type        | Cadence  | Template ID                            | Primary Focus                                    |
| ------------------- | -------- | -------------------------------------- | ------------------------------------------------ |
| Daily Standup       | Daily    | `2cca4e63-bf23-80ae-b4fd-cadcb3b758ea` | Yesterday → Today → Blockers → Action Items      |
| Operations Meeting  | Daily    | `2cda4e63-bf23-80b3-8f48-ff21914fe6a4` | Progress → Metrics → Topics → Actions            |
| Design Meeting      | Daily    | `2cca4e63-bf23-80f5-a6bd-cac3b18ae084` | Goals → Discussion → Actions                     |
| Engineering Meeting | Daily    | `2cda4e63-bf23-80ef-95cd-fa71d8657c94` | Stretch → Tasks → Questions → Notes              |
| Weekly Sync         | Weekly   | `2cca4e63-bf23-8031-94b0-e172297e0443` | Last Week → This Week → Blockers → Actions       |
| Sprint Planning     | Biweekly | `2cca4e63-bf23-80a6-991b-f31186c099cb` | Sprint Goal → Backlog → Team/Roles → Notes       |
| Post-mortem         | Biweekly | `2cca4e63-bf23-80a6-991b-f31186c099cb` | Impact → Timeline → Cause → Resolution → Actions |

---

## Meetings Database Schema

**Database ID**: `2caa4e63-bf23-815a-8981-000bbdbb7f0b`

### Properties

| Property     | Type     | Values/Notes                                                                                      |
| ------------ | -------- | ------------------------------------------------------------------------------------------------- |
| **Name**     | title    | Format: `{Meeting Type} @{YYYY-MM-DD}`                                                            |
| **Type**     | select   | `Operations`, `Standup`, `Weekly Sync`, `Post-mortem`, `Sprint Planning`, `Design`, `Engineering` |
| **Cadence**  | select   | `Daily`, `Weekly`, `Biweekly`, `Ad Hoc`                                                           |
| **Created**  | date     | Auto-set on page creation                                                                         |
| **Archived** | checkbox | Mark true when meeting notes are archived                                                         |
| **Team**     | relation | Links to Teams database (`2d5a4e63-bf23-816b-9f75-000b219f7713`)                                  |
| **Projects** | relation | Links to Projects database (`2d5a4e63-bf23-8115-a70f-000bc1ef9d05`)                               |

### Property IDs (for MCP Operations)

```json
{
  "Name": "title",
  "Type": "8474a1c8-6640-4224-baef-67613eefd9ff",
  "Cadence": "lQap",
  "Created": "Lo%3Bz",
  "Archived": "Y%7CY~",
  "Team": "kpFu",
  "Projects": "txuq"
}
```

### Select Option IDs

**Type Options**:

- `a530d641-29e6-43df-87a4-5cb7601fd852` → Operations (green)
- `28b68013-20d5-4824-b810-45cde8784581` → Standup (blue)
- `8ee247a9-cb60-430a-9ea6-d5c053253334` → Weekly Sync (blue)
- `3a8fd64c-899d-4c39-ba97-ac4f565d6e94` → Post-mortem (blue)
- `5fb57c36-999f-49e2-b153-96531d086862` → Sprint Planning (blue)
- `1747fcca-8207-42c8-802f-fd43965c016a` → Design (pink)
- `Kfkf` → Engineering (gray)

**Cadence Options**:

- `AOwK` → Daily
- `_eHf` → Weekly
- `qq]q` → Biweekly
- `[CYw` → Ad Hoc

---

## Meeting Templates & Block Structures

### 1. Daily Standup

**Cadence**: Daily | **Attendees**: Product, Marketing, Research Teams | **Projects**: Multiple

**Block Structure**:

```
heading_1: "What did we do yesterday?"
  └─ bulleted_list_item: [Yesterday's accomplishments by team]

heading_1: "What are we doing today?"
  └─ bulleted_list_item: [Today's planned work by team]

heading_1: "Potential blockers?"
  └─ bulleted_list_item: [Current blockers or risks]

heading_1: "Action items"
  └─ to_do: [Actionable items with checkboxes]
```

**Context Carryover Rules**:

| Section      | Source                                    | Instructions                                          |
| ------------ | ----------------------------------------- | ----------------------------------------------------- |
| Yesterday    | Previous day's "What are we doing today?" | Copy completed items with ✓ prefix                    |
| Today        | Tasks DB (due today) + Project phase      | List tasks assigned for today + project continuations |
| Blockers     | Previous day's blockers + new             | Carry forward unresolved, add newly identified        |
| Action Items | Tasks DB (high priority)                  | Create to-dos linked to task IDs                      |

**Content Format**:

```markdown
- {Team}: ✓ {Completed task description}
- {Team}: {In-progress task} ({Phase info through {date}})
- All {N} projects on track – no blockers reported
```

---

### 2. Operations Meeting

**Cadence**: Daily | **Attendees**: Operations Team | **Projects**: OPS projects

**Block Structure**:

```
heading_1: "Progress Updates"
  └─ paragraph: [Description placeholder]
  └─ bulleted_list_item: [Progress items]

heading_2: "Metrics Dashboard Review"
  └─ paragraph: [Instructions]
  └─ embed: [KPI Dashboard link]
  └─ embed: [Financials link]

heading_1: "Topics to discuss"
  └─ bulleted_list_item: [Discussion topics]

heading_1: "Other actions"
  └─ table: [Action items table]

heading_1: "Notes"
  └─ bulleted_list_item: [Meeting notes]

heading_1: "Follow-up Actions"
  └─ bulleted_list_item: [Follow-ups with owners]
```

**Context Carryover Rules**:

| Section    | Source                                 | Instructions                         |
| ---------- | -------------------------------------- | ------------------------------------ |
| Progress   | Previous meeting's "Follow-up Actions" | Report status of previous follow-ups |
| Metrics    | Live dashboards                        | Reference current KPI state          |
| Topics     | Backlog + new issues                   | Prioritized discussion items         |
| Actions    | Meeting decisions                      | New commitments from this meeting    |
| Follow-ups | Actions assigned                       | Owner + due date for each            |

---

### 3. Design Meeting

**Cadence**: Daily | **Attendees**: Design Team | **Projects**: DES projects

**Block Structure**:

```
heading_1: "Goals / agenda"
  └─ bulleted_list_item: [Today's goals]

heading_1: "Discussion notes"
  └─ bulleted_list_item: [Discussion points]

heading_1: "Action items"
  └─ to_do: [Actionable items]
```

**Context Carryover Rules**:

| Section    | Source                                      | Instructions                                      |
| ---------- | ------------------------------------------- | ------------------------------------------------- |
| Goals      | Previous day's action items + project phase | Carry forward incomplete, add phase-aligned goals |
| Discussion | Meeting content                             | Capture design decisions and rationale            |
| Actions    | New commitments                             | Specific, assignable tasks                        |

---

### 4. Engineering Meeting

**Cadence**: Daily | **Attendees**: Engineering Team | **Projects**: ENG projects

**Block Structure**:

```
heading_1: "Stretch"
  └─ paragraph: "Nice-to-haves if we get ahead."

heading_1: "Tasks"
  └─ paragraph: "Assigned work for today."
  └─ numbered_list_item: {Task definition block}
    - Owner:
    - Definition:
    - Why:
    - Testing Plan:
    - Success Criteria:

heading_1: "Questions"
  └─ paragraph: [Open questions for the team]

heading_1: "Notes"
  └─ paragraph: [Meeting notes]
```

**Task Definition Template**:

```markdown
1. **{Task Name}**
   - **Owner**: {Team/Person}
   - **Definition**: {What needs to be built/done}
   - **Why**: {Business rationale}
   - **Testing Plan**: {How to verify}
   - **Success Criteria**: {Definition of done}
```

**Context Carryover Rules**:

| Section   | Source                               | Instructions                          |
| --------- | ------------------------------------ | ------------------------------------- |
| Stretch   | Previous stretch items not completed | Carry forward, deprioritize if needed |
| Tasks     | Tasks DB (ENG team, due today)       | Full task definition block for each   |
| Questions | Previous unanswered                  | Carry forward until resolved          |
| Notes     | Meeting content                      | Technical decisions, discoveries      |

---

### 5. Weekly Sync

**Cadence**: Weekly | **Attendees**: All Teams | **Projects**: All active

**Block Structure**:

```
heading_1: "What happened last week?"
  └─ bulleted_list_item: [Week summary by team]

heading_1: "What are we doing this week?"
  └─ bulleted_list_item: [Upcoming work by team]

heading_1: "Potential blockers?"
  └─ bulleted_list_item: [Cross-team risks]

heading_1: "Action Items"
  └─ to_do: [Weekly commitments]
```

**Context Carryover Rules**:

| Section   | Source                               | Instructions                         |
| --------- | ------------------------------------ | ------------------------------------ |
| Last Week | All Daily Standups from past week    | Aggregate accomplishments by team    |
| This Week | Project phases + upcoming milestones | Plan work aligned to sprint timeline |
| Blockers  | Accumulated from dailies             | Surface cross-team dependencies      |
| Actions   | Sprint-level commitments             | Larger scope than daily items        |

---

### 6. Sprint Planning

**Cadence**: Biweekly | **Attendees**: All Teams | **Projects**: All M1/M2/M3

**Block Structure**:

```
heading_1: "Sprint Goal"
  └─ paragraph: "What will we accomplish over the course of the sprint?"
  └─ bulleted_list_item: [Sprint goal statement]

heading_1: "Sprint Backlog"
  └─ paragraph: "List of backlog items that we're committed to work on during the sprint."
  └─ bulleted_list_item: [{PROJECT-CODE} – {Description} ({Team}, {Date Range})]

heading_1: "Team & Roles"
  └─ bulleted_list_item: [{Team} – {Responsibilities}]

heading_1: "Notes"
  └─ bulleted_list_item: [Planning decisions and risks]
```

**Sprint Backlog Item Format**:

```markdown
- {DOMAIN}-M{milestone}-P{phase}-{CODE} – {Description} ({Team} Team, {Start}–{End})
```

Example:

```markdown
- PROD-M1-P1.1-PRD – Problem Definition (Product Team, Jan 1–15)
```

**Context Carryover Rules**:

| Section     | Source                                          | Instructions                                       |
| ----------- | ----------------------------------------------- | -------------------------------------------------- |
| Sprint Goal | Previous sprint post-mortem + OKRs              | Set goal based on learnings + quarterly objectives |
| Backlog     | Projects DB (current milestone, upcoming phase) | List all committed project phases                  |
| Team/Roles  | Teams DB                                        | Document each team's focus for sprint              |
| Notes       | Post-mortem learnings                           | Risk mitigation strategies                         |

---

### 7. Post-mortem

**Cadence**: Biweekly (end of sprint) | **Attendees**: All Teams | **Projects**: Sprint projects

**Block Structure**:

```
heading_1: "User Facing Impact"
  └─ paragraph: [Impact description]
  └─ bulleted_list_item: [Specific impacts]

heading_1: "Timeline"
  └─ paragraph: [Chronological sequence]
  └─ bulleted_list_item: [Key events with timestamps]

heading_1: "Relevant Metrics"
  └─ paragraph: [Quantitative measures]

heading_2: "Cause Analysis"
  └─ paragraph: [Root cause investigation]

heading_2: "Resolution"
  └─ paragraph: [How it was resolved]

heading_2: "Future Work"
  └─ paragraph: [Preventive measures]

heading_1: "Action Items"
  └─ paragraph: [Commitments]
  └─ to_do: [Specific follow-ups]
```

**Context Carryover Rules**:

| Section        | Source                                | Instructions                           |
| -------------- | ------------------------------------- | -------------------------------------- |
| Impact         | Sprint outcomes vs goals              | Document what was delivered vs planned |
| Timeline       | Sprint Planning + Daily Standups      | Key milestones and deviations          |
| Metrics        | Project completion %, task completion | Quantitative sprint health             |
| Cause Analysis | Blockers from dailies                 | Why gaps occurred                      |
| Resolution     | How blockers were resolved            | Document solutions                     |
| Future Work    | Learnings → next sprint               | Carry forward to next Sprint Planning  |
| Actions        | Improvement commitments               | Concrete steps to improve              |

---

## Workflow Patterns

### Daily Context Flow

```
┌─────────────────────┐
│  Previous Day       │
│  Meeting Pages      │
├─────────────────────┤
│ • "Today" section   │───▶ Becomes "Yesterday" in new meeting
│ • Unresolved blocks │───▶ Carry forward to "Blockers"
│ • Open action items │───▶ Check status or carry forward
└─────────────────────┘
         │
         ▼
┌─────────────────────┐
│  Tasks Database     │
├─────────────────────┤
│ • Due today         │───▶ Populate "Today" section
│ • High priority     │───▶ Add to "Action items"
│ • Overdue           │───▶ Flag in "Blockers"
└─────────────────────┘
         │
         ▼
┌─────────────────────┐
│  Projects Database  │
├─────────────────────┤
│ • Current phase     │───▶ Context for task priority
│ • Sprint timeline   │───▶ Deadline awareness
│ • Team assignment   │───▶ Ownership clarity
└─────────────────────┘
```

### Biweekly Sprint Cycle

```
Day 1-2: Sprint Planning
  └─ Set sprint goal
  └─ Commit backlog items
  └─ Assign team roles

Days 3-12: Daily Execution
  └─ Daily Standups (cross-team)
  └─ Domain meetings (per-team)
  └─ Weekly Sync (mid-sprint)

Day 13-14: Sprint Close
  └─ Post-mortem
  └─ Carry learnings → Next Sprint Planning
```

---

## Copilot Execution Instructions

### When Filling Out Today's Daily Standup

```python
# Pseudocode for Copilot context gathering

1. QUERY yesterday's Daily Standup page
   - Extract "What are we doing today?" items
   - Mark completed items with ✓
   - Carry incomplete items forward

2. QUERY Tasks database
   - Filter: due = today AND done = false
   - Group by team relation
   - Format as bullet list

3. QUERY Projects database
   - Filter: team in today's attendees AND status = "Active"
   - Include phase and timeline context

4. COMPOSE meeting content
   - Yesterday: {completed items from step 1}
   - Today: {tasks from step 2 + project continuations}
   - Blockers: {unresolved from yesterday + new}
   - Actions: {high-priority tasks as to-dos}

5. UPDATE meeting page via MCP
   - Use patch-block-children to append content
   - Link action items to Tasks DB if possible
```

### When Filling Out Sprint Planning

```python
1. QUERY previous Post-mortem
   - Extract "Future Work" and "Action Items"
   - Use learnings to inform sprint goal

2. QUERY Projects database
   - Filter: status = "Active" AND phase upcoming
   - List all committed project phases

3. QUERY Teams database
   - Get all active teams
   - Document roles for each

4. COMPOSE Sprint Planning content
   - Goal: {derived from OKRs + post-mortem}
   - Backlog: {projects from step 2 in standard format}
   - Teams: {from step 3}
   - Notes: {risks, dependencies, constraints}
```

---

## MCP Tool Usage for Meetings

### Querying Today's Meetings

```
Tool: query-data-source
Data Source ID: 2caa4e63-bf23-815a-8981-000bbdbb7f0b
Filter: { "property": "Created", "date": { "equals": "{today}" } }
```

### Getting Meeting Content

```
Tool: get-block-children
Block ID: {meeting page ID}
```

### Updating Meeting Content

```
Tool: patch-block-children
Block ID: {meeting page ID}
Children: [
  { "type": "bulleted_list_item", "bulleted_list_item": { "rich_text": [...] } }
]
```

---

## Related Databases

| Database | ID                                     | Relationship                  |
| -------- | -------------------------------------- | ----------------------------- |
| Teams    | `2d5a4e63-bf23-816b-9f75-000b219f7713` | Meeting → Team (relation)     |
| Projects | `2d5a4e63-bf23-8115-a70f-000bc1ef9d05` | Meeting → Projects (relation) |
| Tasks    | `2d5a4e63-bf23-8137-8277-000b41c867c3` | Referenced in action items    |

### Team IDs (for Filters)

| Team             | ID                                     |
| ---------------- | -------------------------------------- |
| Product Team     | `2d5a4e63-bf23-818d-a26b-c86434571d4a` |
| Marketing Team   | `2d5a4e63-bf23-80fd-bf70-f6d679ba0d14` |
| Research Team    | `2d5a4e63-bf23-8081-9ff6-e8ecf118aee6` |
| Operations Team  | `2d5a4e63-bf23-808e-96c6-e13df82c008b` |
| Design Team      | `2d5a4e63-bf23-8097-bffe-dd7bde5a3f69` |
| Engineering Team | `2d5a4e63-bf23-8034-a68a-f4e24b342def` |

---

## Example Filled Meeting

### Daily Standup 2026-01-05

**Properties**:

- Type: Standup
- Cadence: Daily
- Teams: Product, Marketing, Research
- Projects: PROD-M1-P1.1-PRD, MKT-M1-P1.1-POS, RES-M1-P1.1-A&S

**Content**:

```markdown
## What did we do yesterday?

- Product: ✓ Market synthesis & Tenant/RBAC assumptions completed
- Marketing: ✓ Positioning statement & Messaging framework finalized
- Research: ✓ Core concepts & complexity analysis delivered

## What are we doing today?

- Product: Continue PROD-M1-P1.1-PRD problem definition (Phase 1.1 through Jan 15)
- Marketing: Advance MKT-M1-P1.1-POS positioning work with team feedback
- Research: Continue RES-M1-P1.1-A&S arrays & strings research block

## Potential blockers?

- All 3 projects (PROD, MKT, RES) on track – no blockers reported
- Coordinate between teams on cross-functional dependencies in Phase 1.1

## Action items

- [ ] Review Product v1 outline for dependencies
- [ ] Sync Marketing messaging with Product positioning
```

---

## Version History

| Date       | Change                                | Author  |
| ---------- | ------------------------------------- | ------- |
| 2026-01-08 | Initial creation with all 7 templates | Copilot |
