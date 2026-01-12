# Notion Sprint Planning Skill

This skill bundle provides automated sprint planning workflows for the Digital Herencia Notion workspace.

## Purpose

Execute the biweekly sprint planning pattern:

1. Query active projects for a team
2. Review phase and milestone alignment
3. Assign projects to Sprint Planning meeting
4. Track sprint scope and metrics

## Files

- `skill.md` - This documentation
- `sprint-workflow.md` - Step-by-step execution guide

## Usage

Invoke via the Notion Dashboard Automation agent:

```text
@Notion Dashboard Automation Run sprint planning for Product Team, Jan 15-29
```

## Sprint Cycle Structure

- **Duration:** 2 weeks
- **Planning Meeting:** Biweekly (sprint start)
- **Post-mortem:** Biweekly (sprint end)

## Phase & Milestone Reference

| Milestone | Description                       |
| --------- | --------------------------------- |
| M1        | Foundation & Core Infrastructure  |
| M2        | Feature Development & Integration |
| M3        | Polish, Launch & Optimization     |

| Phase     | Description                       |
| --------- | --------------------------------- |
| P1.1      | Requirements Gathering & Planning |
| P1.2      | Architecture & Technical Design   |
| P1.3      | Core Infrastructure Setup         |
| P2.1-P2.3 | Feature Development & Testing     |
| P3.1-P3.3 | Optimization, UAT, Launch         |

## MCP Tools Used

- `mcp_notionapi_API-query-data-source` - Query projects and meetings
- `mcp_notionapi_API-patch-page` - Update meeting relations
- `mcp_notionapi_API-retrieve-a-data-source` - Get database schema

## Safety Notes

- Never create Sprint Planning meetings (they auto-generate)
- Projects are predefined with "Add Project" buttons in team pages
- Only add relations to existing meetings
