# Copilot Projects Reference Guide

> **Purpose**: This document is the authoritative reference for Copilot to query, create, update, and manage project pages in the Digital Herencia Notion workspace. Use this guide when managing sprint-based projects, tracking milestones, and coordinating team workflows.

---

## Quick Reference

| Domain | Description                     | Team             | Color  |
| ------ | ------------------------------- | ---------------- | ------ |
| OPS    | Operations & Process Management | Operations Team  | Green  |
| PROD   | Product Strategy & Roadmap      | Product Team     | Blue   |
| DES    | UI/UX & Visual Design           | Design Team      | Pink   |
| ENG    | Technical Development           | Engineering Team | Gray   |
| MKT    | Marketing & Communications      | Marketing Team   | Purple |
| RES    | Research & Analysis             | Research Team    | Yellow |

---

## Projects Database Schema

**Database ID**: `2d5a4e63-bf23-8115-a70f-000bc1ef9d05`

### Properties

| Property       | Type     | Values/Notes                                                           |
| -------------- | -------- | ---------------------------------------------------------------------- |
| **Name**       | title    | Format: `{DOMAIN}-{MILESTONE}-{PHASE}-{CODE} – {Description}`          |
| **Status**     | status   | `Backlog`, `Ready`, `In progress`, `Review`, `Done`                    |
| **Milestone**  | select   | `M1`, `M2`, `M3`                                                       |
| **Phase**      | select   | `P1.1`, `P1.2`, `P1.3`, `P2.1`, `P2.2`, `P2.3`, `P3.1`, `P3.2`, `P3.3` |
| **Domain**     | select   | `OPS`, `PROD`, `DES`, `ENG`, `MKT`, `RES`                              |
| **Work dates** | date     | Sprint date range (start → end)                                        |
| **Archive**    | checkbox | Mark true when project is archived                                     |
| **Team**       | relation | Links to Teams database (`2d5a4e63-bf23-816b-9f75-000b219f7713`)       |
| **Tasks**      | relation | Links to Tasks database (`2d5a4e63-bf23-8137-8277-000b41c867c3`)       |
| **Meetings**   | relation | Links to Meetings database (`2caa4e63-bf23-815a-8981-000bbdbb7f0b`)    |

### Property IDs (for MCP Operations)

```json
{
  "Name": "title",
  "Status": "U%60u%3D",
  "Milestone": "%3Blbz",
  "Phase": "TX%5Dp",
  "Domain": "jNvx",
  "Work dates": "f%3B%3D%3C",
  "Archive": "NlVx",
  "Team": "S%5B%3C%5B",
  "Tasks": "FBbf",
  "Meetings": "uS%3ES"
}
```

### Select Option IDs

**Status Options** (Status property with groups):

| Option      | ID                                     | Color   | Group       |
| ----------- | -------------------------------------- | ------- | ----------- |
| Backlog     | `^@\|F`                                | gray    | To-do       |
| Ready       | `3e4e2dad-4877-4648-9371-d50747a021f6` | default | To-do       |
| In progress | `65129a19-c75a-4935-a0c5-ddd6a6379198` | blue    | In progress |
| Review      | `YcC}`                                 | blue    | In progress |
| Done        | `82db6eff-0336-4a26-bfcc-f02939ec031c` | green   | Complete    |

**Milestone Options**:

| Option | ID      |
| ------ | ------- |
| M1     | `asdJ`  |
| M2     | `o:Xc`  |
| M3     | `R\`VE` |

**Phase Options**:

| Option | ID      |
| ------ | ------- |
| P1.1   | `~u\|e` |
| P1.2   | `tP~d`  |
| P1.3   | `gMyg`  |
| P2.1   | `Pc:r`  |
| P2.2   | `vUdM`  |
| P2.3   | `T]Ak`  |
| P3.1   | `]YHK`  |
| P3.2   | `:N_@`  |
| P3.3   | `@QUf`  |

**Domain Options**:

| Option | ID     | Color  |
| ------ | ------ | ------ |
| OPS    | `IcNW` | green  |
| PROD   | `]IFq` | blue   |
| DES    | `:NNb` | pink   |
| ENG    | `tJ\H` | gray   |
| MKT    | `YSYJ` | purple |
| RES    | `GEaC` | yellow |

---

## Project Naming Convention

**Format**: `{DOMAIN}-{MILESTONE}-{PHASE}-{CODE} – {Description}`

**Examples**:

- `OPS-M1-P1.1-OKR – OKRs & Constraints`
- `PROD-M1-P1.1-PRD – Problem Definition`
- `DES-M1-P1.1-UXARCH – UX Architecture`
- `ENG-M1-P1.1-INIT – Environment Initialization`
- `MKT-M1-P1.1-POS – Positioning`
- `RES-M1-P1.1-A&S – Arrays & Strings`

**Parsing Pattern**:

```regex
^([A-Z]{2,4})-M(\d)-P(\d)\.(\d)-([A-Z0-9&]+)\s*[–-]\s*(.+)$
```

---

## Sprint Lifecycle

### Milestones (M1, M2, M3)

Each milestone represents a major product increment:

| Milestone | Focus Area      | Duration |
| --------- | --------------- | -------- |
| M1        | Foundation      | 6 weeks  |
| M2        | Core Features   | 6 weeks  |
| M3        | Polish & Launch | 6 weeks  |

### Phases (P1.1 – P3.3)

Each milestone contains 3 phases, each with 3 sub-phases:

| Phase Group | Focus            |
| ----------- | ---------------- |
| P\_.1       | Planning & Setup |
| P\_.2       | Implementation   |
| P\_.3       | Testing & Review |

### Sprint Structure

- **Duration**: 2 weeks (configurable via Work dates)
- **Start Date**: Sprint kickoff
- **End Date**: Sprint review/demo
- **Tasks**: All related tasks must be completed for project to be marked Done

---

## Status Workflow

```text
Backlog → Ready → In progress → Review → Done
   │                              │
   └──────── Archive ◄────────────┘
```

### Status Transitions

| From        | To          | Trigger                             |
| ----------- | ----------- | ----------------------------------- |
| Backlog     | Ready       | Sprint planning assigns project     |
| Ready       | In progress | Work begins                         |
| In progress | Review      | All tasks complete, awaiting review |
| Review      | Done        | Stakeholder approval                |
| Done        | Archive     | Sprint retrospective complete       |

---

## Domain-Team Mapping

| Domain | Team             | Primary Focus                         |
| ------ | ---------------- | ------------------------------------- |
| OPS    | Operations Team  | Process, OKRs, constraints            |
| PROD   | Product Team     | PRD, requirements, roadmap            |
| DES    | Design Team      | UX architecture, wireframes, UI       |
| ENG    | Engineering Team | Implementation, testing, deployment   |
| MKT    | Marketing Team   | Positioning, messaging, campaigns     |
| RES    | Research Team    | Market research, competitive analysis |

---

## Relation Patterns

### Projects → Tasks

- One project has many tasks
- All tasks must be Done for project completion
- Tasks inherit project's Team relation

### Projects → Meetings

- Projects link to relevant meetings (standups, syncs)
- Daily meetings reference active projects
- Sprint planning creates/assigns projects

### Projects → Team

- Each project belongs to one team
- Team determines domain expertise
- Rollups calculate team completion metrics

---

## MCP Operation Examples

### Create a New Project

```json
{
  "parent": { "database_id": "2d5a4e63-bf23-8115-a70f-000bc1ef9d05" },
  "properties": {
    "Name": {
      "title": [{ "text": { "content": "ENG-M1-P1.2-AUTH – Authentication System" } }]
    },
    "Status": { "status": { "name": "Ready" } },
    "Milestone": { "select": { "name": "M1" } },
    "Phase": { "select": { "name": "P1.2" } },
    "Domain": { "select": { "name": "ENG" } },
    "Work dates": { "date": { "start": "2026-01-15", "end": "2026-01-29" } },
    "Team": { "relation": [{ "id": "2d5a4e63-bf23-8034-a68a-f4e24b342def" }] }
  }
}
```

### Query Projects by Status

```json
{
  "filter": {
    "property": "Status",
    "status": { "equals": "In progress" }
  },
  "sorts": [{ "property": "Work dates", "direction": "ascending" }]
}
```

### Query Projects by Team

```json
{
  "filter": {
    "property": "Team",
    "relation": { "contains": "2d5a4e63-bf23-8034-a68a-f4e24b342def" }
  }
}
```

### Update Project Status

```json
{
  "properties": {
    "Status": { "status": { "name": "Done" } }
  }
}
```

---

## Rollup Calculations

### Team-Level Metrics

**Projects Complete** (on Teams database):

- Counts projects where Status = Done
- Formula: `count(filter(Projects, Status = "Done"))`

### Progress Tracking

**Task Completion**:

- Rollup from Tasks relation
- Formula: `% checked` on Done property

---

## Context Carryover Rules

### Sprint Planning → Project Creation

| Field      | Source          | Logic                             |
| ---------- | --------------- | --------------------------------- |
| Name       | Sprint goal     | Generate code from domain + focus |
| Milestone  | Current cycle   | Inherit from sprint context       |
| Phase      | Next phase      | Increment from last completed     |
| Work dates | Sprint calendar | 2-week window from planning date  |
| Team       | Domain mapping  | Auto-assign based on domain       |

### Daily Standup → Project Updates

| Action          | Source             | Target                 |
| --------------- | ------------------ | ---------------------- |
| Status check    | Meeting discussion | Update Status property |
| Blocker report  | Standup blockers   | Add to Notes/Comments  |
| Task completion | Checkbox updates   | Recalculate progress   |

---

## Sample Projects (Current Sprint)

| Project Code       | Description        | Team        | Status      | Dates              |
| ------------------ | ------------------ | ----------- | ----------- | ------------------ |
| OPS-M1-P1.1-OKR    | OKRs & Constraints | Operations  | In progress | 2026-01-01 → 01-15 |
| PROD-M1-P1.1-PRD   | Problem Definition | Product     | In progress | 2026-01-01 → 01-15 |
| DES-M1-P1.1-UXARCH | UX Architecture    | Design      | In progress | 2026-01-01 → 01-15 |
| ENG-M1-P1.1-INIT   | Environment Init   | Engineering | In progress | 2026-01-01 → 01-15 |
| MKT-M1-P1.1-POS    | Positioning        | Marketing   | In progress | 2026-01-01 → 01-15 |
| RES-M1-P1.1-A&S    | Arrays & Strings   | Research    | In progress | 2026-01-01 → 01-15 |

---

## Validation Rules

1. **Name Format**: Must follow `{DOMAIN}-M{n}-P{n}.{n}-{CODE} – {Description}` pattern
2. **Domain-Team Match**: Domain must correspond to correct Team relation
3. **Date Range**: End date must be ≥ Start date
4. **Phase Sequence**: Phases should progress logically within milestone
5. **Task Completion**: Project cannot be Done if any linked tasks are incomplete

---

## Error Handling

| Error                | Cause                            | Resolution                      |
| -------------------- | -------------------------------- | ------------------------------- |
| Invalid project code | Name doesn't match format        | Regenerate with correct pattern |
| Missing team         | Team not linked                  | Add team based on domain        |
| Orphaned project     | No tasks linked                  | Create initial tasks or archive |
| Date overlap         | Concurrent sprints for same team | Adjust dates or priorities      |

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
