# Notion Automation Agents

This directory contains the three-agent system for automating Digital Herencia Notion workspace operations.

---

## Agent System Overview

The Notion automation system uses a **three-tier architecture**:

1. **Notion Dashboard Automation** (`notion-dashboard-automation.agent.md`) - Orchestrator
2. **Notion Planner** (`notion-planner.agent.md`) - Strategist
3. **Notion Executor** (`notion-executor.agent.md`) - Implementer

**Full architecture documentation**: [../../.copilot/docs/notion-agent-architecture.md](../../.copilot/docs/notion-agent-architecture.md)

---

## Quick Start

### Run Daily Workflow

```
@notion-dashboard-automation Run daily workflow for Engineering
```

The orchestrator will:

1. Delegate to Planner to create execution plan
2. Present plan for your approval
3. Delegate to Executor to implement approved plan
4. Report results

### Check Task Status

```
@notion-dashboard-automation What tasks are incomplete for Engineering?
```

The orchestrator handles simple queries directly without delegation.

### Create Portfolio Page

```
@notion-dashboard-automation Create Portfolio page for task T03
```

The orchestrator will delegate to Planner, get approval, delegate to Executor, and report completion.

---

## Agent Files

### notion-dashboard-automation.agent.md

**Role**: User-facing coordinator

**Use When**: You want to interact with Notion workspace (any operation)

**Capabilities**:

- Handle simple read-only queries
- Gather context and clarify user intent
- Delegate complex operations to specialists
- Communicate results clearly

**Tools**: `built-in`, `notionapi` (read-only), `memory`, `sequential-thinking`

**Handoffs**: → Notion Planner (for planning), → Notion Executor (for execution)

---

### notion-planner.agent.md

**Role**: Strategic planning specialist

**Use When**: You need a detailed execution plan before taking action

**Capabilities**:

- Analyze current workspace state
- Parse requirements and constraints
- Create step-by-step execution plans
- Validate safety and flag risks
- Specify exact MCP operations

**Tools**: `built-in`, `notionapi` (read-only), `memory`, `sequential-thinking`

**Handoffs**: → Notion Executor (with generated plan)

---

### notion-executor.agent.md

**Role**: Precise execution specialist

**Use When**: You have an approved plan and want immediate implementation

**Capabilities**:

- Execute MCP operations safely
- Follow plans step-by-step
- Verify outcomes after each operation
- Handle errors with automatic remediation
- Invoke workflow skills

**Tools**: `built-in`, `notionapi` (read/write), `memory`, `sequential-thinking`

**Handoffs**: → Notion Planner (when replanning needed)

---

## Workflow Skills

Agents are integrated with existing workflow skills:

- **Daily Workflow**: `.github/skills/notion-daily/` - Assign next task to today's meeting
- **Portfolio Creation**: `.github/skills/notion-portfolio/` - Create Portfolio pages for completed tasks
- **Sprint Planning**: `.github/skills/notion-sprint/` - Set up sprint meetings with project assignments

**Skills documentation**: [../../.copilot/docs/README.skills.md](../../.copilot/docs/README.skills.md)

---

## Safety Workflow

All agents follow **Propose → Approve → Apply → Verify**:

1. **Propose**: Planner creates detailed plan with steps and verification
2. **Approve**: User reviews plan and replies "Approved"
3. **Apply**: Executor implements operations precisely
4. **Verify**: Executor confirms outcomes and reports results

**No write operations occur without explicit user approval.**

---

## Reference Documentation

### Database Information

- **MCP Reference**: [../../.copilot/docs/notion-mcp-reference.md](../../.copilot/docs/notion-mcp-reference.md) - Database IDs, property schemas, common operations
- **Database Config**: [../../config/databases.json](../../config/databases.json) - Authoritative source for database IDs

### Database Schemas

- **Teams**: [../../.copilot/docs/README.teams.md](../../.copilot/docs/README.teams.md)
- **Projects**: [../../.copilot/docs/README.projects.md](../../.copilot/docs/README.projects.md)
- **Tasks**: [../../.copilot/docs/README.tasks.md](../../.copilot/docs/README.tasks.md)
- **Meetings**: [../../.copilot/docs/README.meetings.md](../../.copilot/docs/README.meetings.md)
- **Portfolio**: [../../.copilot/docs/README.portfolio.md](../../.copilot/docs/README.portfolio.md)
- **SOPs**: [../../.copilot/docs/README.sops.md](../../.copilot/docs/README.sops.md)
- **Tech Stack**: [../../.copilot/docs/README.tech-stack.md](../../.copilot/docs/README.tech-stack.md)
- **Blog**: [../../.copilot/docs/README.blog.md](../../.copilot/docs/README.blog.md)

### Project & Task Inventory

- **Complete Reference**: [../../.copilot/reports/project-task-reference.md](../../.copilot/reports/project-task-reference.md) - All 89 projects and 433 tasks across 6 teams

---

## Examples

### Example 1: Daily Workflow (Full Delegation)

**User**:
`@notion-dashboard-automation Run daily workflow for Engineering`

**Flow**:

1. Orchestrator gathers context (team=Engineering, date=today)
2. Orchestrator delegates to Planner
3. Planner queries current state, creates execution plan
4. Orchestrator presents plan to user
5. User approves
6. Orchestrator delegates to Executor
7. Executor implements plan (assign task, update due date)
8. Executor verifies and reports
9. Orchestrator communicates success to user

---

### Example 2: Simple Query (No Delegation)

**User**:
`@notion-dashboard-automation Show incomplete tasks for Engineering`

**Flow**:

1. Orchestrator recognizes simple query
2. Orchestrator queries Tasks database directly
3. Orchestrator formats and reports results
4. Done (no delegation needed)

---

### Example 3: Portfolio Creation (Full Delegation with Verification)

**User**:
`@notion-dashboard-automation Create Portfolio page for task T03`

**Flow**:

1. Orchestrator delegates to Planner
2. Planner queries task T03, checks if Done=true
3. Planner creates plan to build Portfolio page with relations
4. Orchestrator presents plan to user
5. User approves
6. Orchestrator delegates to Executor
7. Executor creates Portfolio page, sets relations, appends content
8. Executor verifies all relations established
9. Orchestrator reports Portfolio page URL and confirmation

---

## Critical Rules

### ❌ Never Create Meetings

Meetings are recurring templates that auto-generate in Notion. Agents will:

- Query existing meetings for a given team/date
- Add task relations to meeting Action Items
- Update meeting properties via relations

**Do NOT** create meeting pages manually.

### ✅ Always Verify Relations

Before adding relations:

1. Query target database to confirm item exists
2. Retrieve current relations (if updating)
3. Append new relation to existing array
4. Verify bidirectional relationship after update

### ✅ Respect Formula Fields

- Do not manually override formula fields
- Let Notion compute: Task Code, rollups, completion percentages
- Only update editable properties

---

## Troubleshooting

### Agent Not Responding

**Possible Causes**:

- Agent name misspelled in mention
- MCP server not connected

**Solution**:

- Use exact agent name: `@notion-dashboard-automation`, `@notion-planner`, or `@notion-executor`
- Check MCP connection status in VS Code

### Query Returns No Results

**Possible Causes**:

- Database not shared with MCP integration
- Wrong database ID
- Filter criteria too restrictive

**Solution**:

- Verify database IDs in `config/databases.json`
- Check that databases are shared with Notion MCP integration
- Simplify filters and retry

### Write Operation Fails

**Possible Causes**:

- Missing required property (e.g., title)
- Property type mismatch
- Relation ID doesn't exist

**Solution**:

- Review plan carefully before approving
- Executor will attempt automatic remediation
- If repeated failures, escalate to Planner for replanning

---

## Support

**Architecture Docs**: [../../.copilot/docs/notion-agent-architecture.md](../../.copilot/docs/notion-agent-architecture.md)
**MCP Reference**: [../../.copilot/docs/notion-mcp-reference.md](../../.copilot/docs/notion-mcp-reference.md)
**Skills Overview**: [../../.copilot/docs/README.skills.md](../../.copilot/docs/README.skills.md)

---

**End of README**
