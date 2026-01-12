# Notion Automation - Three-Agent Architecture

**Version**: 2.0  
**Last Updated**: 2026-01-08  
**Status**: Active

---

## Overview

The Digital Herencia Notion automation system uses a **three-tier agent architecture** that separates concerns for clarity, maintainability, and safety:

1. **Notion Dashboard Automation** (Orchestrator): User interaction and delegation
2. **Notion Planner** (Strategist): Analysis and execution plan creation
3. **Notion Executor** (Implementer): Safe operation execution and verification

This architecture follows the **Separation of Concerns** principle, ensuring each agent has a clear, focused responsibility.

---

## Architecture Diagram

```plaintext
┌─────────────────────────────────────────────────────────────┐
│                          User                               │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│        Notion Dashboard Automation (Orchestrator)           │
│  • Understand user intent                                   │
│  • Gather context (team, date, scope)                       │
│  • Handle simple read-only queries                          │
│  • Delegate complex operations to specialists              │
│  • Communicate results back to user                         │
└────────────┬────────────────────────────┬───────────────────┘
             │                            │
             │ Complex workflow?          │ Approved plan?
             │                            │
             ▼                            ▼
┌──────────────────────────┐   ┌──────────────────────────────┐
│   Notion Planner         │   │   Notion Executor            │
│   (Strategist)           │   │   (Implementer)              │
│  • Query current state   │   │  • Execute MCP operations    │
│  • Analyze requirements  │───│  • Follow plans precisely    │
│  • Create execution plan │   │  • Verify outcomes           │
│  • Validate safety       │   │  • Report results            │
│  • Propose changes       │   │  • Handle errors             │
└──────────────────────────┘   └──────────────────────────────┘
             │                            │
             │ Hand back plan             │ Hand back results
             │                            │
             ▼                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  User (Approval/Feedback)                   │
└─────────────────────────────────────────────────────────────┘
```

---

## Agent Responsibilities

### 1. Notion Dashboard Automation (Orchestrator)

**File**: `.github/agents/notion-dashboard-automation.agent.md`

**Role**: User-facing coordinator

**Responsibilities**:

- ✅ Understand and clarify user intent
- ✅ Gather essential context (team, date, scope)
- ✅ Handle simple read-only queries directly
- ✅ Delegate complex workflows to Notion Planner
- ✅ Delegate execution to Notion Executor
- ✅ Communicate results clearly to user

**Tools**: `built-in`, `notionapi` (read-only), `memory`, `sequential-thinking`

**Handoffs**:

- → Notion Planner: For planning and strategy
- → Notion Executor: For implementing approved plans

**Example Interactions**:

- "What tasks are incomplete for Engineering?" → Handle directly (query + report)
- "Run daily workflow for Engineering" → Delegate to Planner → Present plan → Get approval → Delegate to Executor → Report results
- "Check sprint status for Product team" → Clarify scope → Query → Report

---

### 2. Notion Planner (Strategist)

**File**: `.github/agents/notion-planner.agent.md`

**Role**: Strategic planning specialist

**Responsibilities**:

- ✅ Parse user requests into actionable requirements
- ✅ Query current workspace state (read-only)
- ✅ Analyze data and identify patterns
- ✅ Create detailed step-by-step execution plans
- ✅ Specify exact MCP tool calls with parameters
- ✅ Include verification steps and rollback procedures
- ✅ Flag risks and validate safety

**Tools**: `built-in`, `notionapi` (read-only), `memory`, `sequential-thinking`

**Handoffs**:

- → Notion Executor: "Execute This Plan" (hands off generated plan)

**Example Outputs**:

- Daily workflow plan with steps to assign next task
- Sprint planning strategy with project assignments
- Portfolio creation plan with relation setup
- Task completion workflow with verification steps

**Plan Structure**:

```markdown
# Plan: <Title>

## Summary

<1-2 sentence overview>

## Current State Analysis

<Query results and findings>

## Execution Plan

### Prerequisites

- <Item>

### Steps

1. <Detailed step with tool call>
2. <Detailed step with tool call>

### Verification

- [ ] <Condition to verify>

## Safety Assessment

**Risk Level**: Low/Medium/High
**Rollback**: <How to undo if needed>

## Ready for Execution

[Hand off to Notion Executor]
```

---

### 3. Notion Executor (Implementer)

**File**: `.github/agents/notion-executor.agent.md`

**Role**: Precise execution specialist

**Responsibilities**:

- ✅ Receive and parse execution plans
- ✅ Validate prerequisites before executing
- ✅ Execute MCP operations step-by-step
- ✅ Verify each operation's outcome
- ✅ Handle errors and attempt automatic remediation
- ✅ Report results with before/after comparisons
- ✅ Invoke workflow skills when appropriate

**Tools**: `built-in`, `notionapi` (read/write), `memory`, `sequential-thinking`

**Handoffs**:

- → Notion Planner: "Create New Plan" (when execution fails or plan needs revision)

**Example Operations**:

- Create Portfolio page with relations
- Update task Done status and due date
- Add task to meeting Action Items
- Append content blocks to pages
- Post comments for traceability

**Execution Summary Structure**:

```markdown
## Execution Summary: <Plan Title>

### Operations Completed

- ✅ Step 1: <Brief description> (ID: `...`)
- ✅ Step 2: <Brief description> (ID: `...`)

### Changes Made

**Created**: <Entity> (ID: `...`)
**Updated**: <Entity> - <Property>: old → new

### Verification Results

- [x] <Verification item>

### Metrics

- Operations: 3/3 successful
- Execution time: ~30 seconds

**Next Steps**: <Recommendations>
```

---

## Workflow Skills Integration

All agents are aware of existing workflow skills:

### Daily Workflow Skill

**Location**: `.github/skills/notion-daily/`

**Purpose**: Automate daily task assignment for team meetings

**Workflow**:

1. Planner: Create plan to assign next task to today's meeting
2. Executor: Implement plan by updating meeting Action Items and task due date
3. Orchestrator: Report completion to user

### Portfolio Creation Skill

**Location**: `.github/skills/notion-portfolio/`

**Purpose**: Create Portfolio pages for completed tasks with deliverables

**Workflow**:

1. Planner: Create plan to build Portfolio page with relations
2. Executor: Create page, set relations, append content blocks
3. Orchestrator: Confirm Portfolio page created and linked

### Sprint Planning Skill

**Location**: `.github/skills/notion-sprint/`

**Purpose**: Set up biweekly sprint planning meetings with project assignments

**Workflow**:

1. Planner: Analyze active projects and create sprint setup plan
2. Executor: Assign projects to sprint meeting via relations
3. Orchestrator: Report sprint scope and metrics

---

## Safety Workflow

All agents follow the **Propose → Approve → Apply → Verify** workflow:

### 1. Propose (Planner)

- Query current state
- Analyze requirements
- Create detailed execution plan
- Flag risks and side effects
- Present plan to user (via Orchestrator)

### 2. Approve (User via Orchestrator)

- User reviews plan
- User replies "Approved" or requests revisions
- Orchestrator confirms approval before delegating to Executor

### 3. Apply (Executor)

- Validate prerequisites
- Execute MCP operations step-by-step
- Track progress and capture results

### 4. Verify (Executor)

- Re-query affected entities
- Compare actual state to expected state
- Confirm all success criteria met
- Report results (via Orchestrator) to user

---

## Communication Flow Examples

### Example 1: Daily Workflow

**User → Orchestrator**:  
"Run daily workflow for Engineering"

**Orchestrator → Planner**:  
"Create execution plan for Engineering Team daily workflow on 2026-01-08"

**Planner → Orchestrator**:  
[Returns detailed plan with steps to assign T03 to today's meeting]

**Orchestrator → User**:  
"Here's the plan. Task T03 will be assigned to today's Engineering Meeting. Ready to execute? (Reply 'Approved')"

**User → Orchestrator**:  
"Approved"

**Orchestrator → Executor**:  
"Execute this plan (user approved): [paste plan]"

**Executor → Orchestrator**:  
"✅ Execution complete. Task T03 assigned to Engineering Meeting @2026-01-08. Due date updated to today."

**Orchestrator → User**:  
"✅ Daily workflow complete. Task T03 is ready to work on today."

---

### Example 2: Simple Query (No Delegation)

**User → Orchestrator**:  
"What tasks are incomplete for Engineering?"

**Orchestrator** (queries directly):  
[Query Tasks database with filters]

**Orchestrator → User**:

```markdown
**Engineering Team - Incomplete Tasks (3):**

| Task Code | Task Name               | Due Date   | Priority |
| --------- | ----------------------- | ---------- | -------- |
| T03       | Validate MCP & tooling  | 2026-01-08 | High     |
| T04       | Test integration points | 2026-01-10 | Medium   |
| T05       | Document API contracts  | 2026-01-12 | Low      |

**Summary**: 3 tasks pending, 1 due today (T03).
```

---

### Example 3: Error Handling with Replanning

**User → Orchestrator**:  
"Create Portfolio page for task T03"

**Orchestrator → Planner**:  
"Create execution plan to build Portfolio page for task T03"

**Planner → Orchestrator**:  
[Returns plan to create Portfolio page with relations]

**Orchestrator → User**:  
"Plan ready. Portfolio page will be created with links to task, project, team. Approve?"

**User → Orchestrator**:  
"Approved"

**Orchestrator → Executor**:  
"Execute this plan: [paste plan]"

**Executor** (encounters error):  
"⚠️ Error: Task T03 is not marked Done=true. Portfolio pages should only be created for completed tasks."

**Executor → Planner**:  
"Execution blocked. Please create a revised plan that marks task Done first, then creates Portfolio page."

**Planner → Orchestrator**:  
[Returns revised plan with step to mark Done first]

**Orchestrator → User**:  
"The plan needs adjustment. Task must be marked Done before creating Portfolio. Updated plan ready. Approve?"

---

## Agent Decision Matrix

| Scenario                 | Handler      | Action                                     |
| ------------------------ | ------------ | ------------------------------------------ |
| Simple read-only query   | Orchestrator | Query directly and report                  |
| Complex workflow request | Planner      | Create execution plan                      |
| Approved plan ready      | Executor     | Execute operations                         |
| Missing context          | Orchestrator | Ask user for clarification                 |
| High-risk operation      | Planner      | Flag risks, require explicit approval      |
| Execution error          | Executor     | Attempt remediation or escalate to Planner |
| Unexpected state         | Planner      | Analyze and create revised plan            |

---

## Benefits of This Architecture

### 1. Separation of Concerns

- **Orchestrator**: User interaction only
- **Planner**: Strategy and analysis only
- **Executor**: Implementation only

### 2. Safety by Design

- All write operations go through planning review
- User approval required before execution
- Verification built into every operation

### 3. Maintainability

- Each agent has clear, focused responsibilities
- Easy to update one agent without affecting others
- Skills and resources are modular and reusable

### 4. Error Handling

- Automatic remediation for known issues
- Graceful escalation and replanning for complex failures
- User always informed of status and options

### 5. Extensibility

- Easy to add new workflow skills
- New operation types can be added to Planner/Executor
- Orchestrator remains stable as workflows evolve

---

## File Structure

```plaintext
.github/
  agents/
    notion-dashboard-automation.agent.md  # Orchestrator
    notion-planner.agent.md               # Planner
    notion-executor.agent.md              # Executor
  skills/
    notion-daily/                          # Daily workflow skill
      skill.md
      daily-workflow.md
    notion-portfolio/                      # Portfolio creation skill
      skill.md
      portfolio-workflow.md
    notion-sprint/                         # Sprint planning skill
      skill.md
      sprint-workflow.md
.copilot/
  docs/
    notion-mcp-reference.md                # Database IDs and MCP operations
    README.teams.md                        # Teams database schema
    README.tasks.md                        # Tasks database schema
    README.projects.md                     # Projects database schema
    README.meetings.md                     # Meetings database schema
    README.portfolio.md                    # Portfolio database schema
    README.skills.md                       # Skills overview
  reports/
    project-task-reference.md              # Complete project/task inventory
config/
  databases.json                           # Authoritative database configuration
```

---

## Getting Started

### Using the Orchestrator

In Copilot Chat, invoke the orchestrator agent:

```plaintext
@notion-dashboard-automation What tasks are incomplete for Engineering?
```

The orchestrator will:

1. Determine if it can handle the query directly
2. Query and report results, OR
3. Delegate to Planner for complex operations

### Using the Planner Directly

If you want to create a plan without executing:

```plaintext
@notion-planner Create a plan to run daily workflow for Engineering on 2026-01-08
```

The planner will generate a detailed execution plan that you can review before approving.

### Using the Executor Directly

If you have a plan ready and want immediate execution:

```plaintext
@notion-executor Execute this plan: [paste plan from Planner]
```

The executor will validate prerequisites, execute operations, verify outcomes, and report results.

---

## Future Enhancements

**Potential additions**:

- **Notion Auditor Agent**: Monitor data integrity, flag inconsistencies, generate health reports
- **Notion Reporter Agent**: Generate analytics, completion metrics, team performance dashboards
- **Notion Scheduler Agent**: Automate recurring workflows (daily standups, sprint planning reminders)

**Workflow skill expansion**:

- **Task archival workflow**: Bulk archive completed tasks with audit trail
- **Team capacity workflow**: Calculate team velocity and recommend task distribution
- **Milestone tracking workflow**: Monitor milestone progress and generate status reports

---

## Support & Documentation

**Primary References**:

- **Orchestrator**: `.github/agents/notion-dashboard-automation.agent.md`
- **Planner**: `.github/agents/notion-planner.agent.md`
- **Executor**: `.github/agents/notion-executor.agent.md`
- **MCP Reference**: `.copilot/docs/notion-mcp-reference.md`
- **Database Config**: `config/databases.json`

**Workflow Skills**:

- **Daily**: `.github/skills/notion-daily/daily-workflow.md`
- **Portfolio**: `.github/skills/notion-portfolio/portfolio-workflow.md`
- **Sprint**: `.github/skills/notion-sprint/sprint-workflow.md`

---

End of Architecture Document
