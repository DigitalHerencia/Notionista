# Notion Workspace Reference - Database IDs & Common Operations

**Version**: 2.0  
**Last Updated**: 2026-01-08  
**Dev Cycle**: Competitive Advantage (M1 / P1.1)

This document provides quick reference for Notion MCP operations, database IDs, property schemas, and common query patterns. All agents should reference this document for accurate database operations.

---

## Core Database IDs

**Always use these exact IDs for MCP operations.**

### Primary Databases

| Database  | Data Source ID (for queries)           | Database ID (for create-page parent)   |
| --------- | -------------------------------------- | -------------------------------------- |
| Teams     | `2d5a4e63-bf23-816b-9f75-000b219f7713` | N/A (not a parent for pages)           |
| Projects  | `2d5a4e63-bf23-8115-a70f-000bc1ef9d05` | N/A (not a parent for pages)           |
| Tasks     | `2d5a4e63-bf23-8137-8277-000b41c867c3` | N/A (not a parent for pages)           |
| Meetings  | `2caa4e63-bf23-815a-8981-000bbdbb7f0b` | N/A (not a parent for pages)           |
| Portfolio | `2e2a4e63-bf23-8057-bdc5-000b7407965e` | `2e2a4e63-bf23-806a-b9c7-c532e18aeea7` |

**Note**: Use **data source ID** for queries/retrieves. Use **database ID** for `parent` field when creating pages.

### Team Page IDs

| Team        | Page ID                                |
| ----------- | -------------------------------------- |
| Engineering | `2d5a4e63-bf23-8034-a68a-f4e24b342def` |
| Design      | `2d5a4e63-bf23-8097-bffe-dd7bde5a3f69` |
| Operations  | `2d5a4e63-bf23-808e-96c6-e13df82c008b` |
| Product     | `2d5a4e63-bf23-818d-a26b-c86434571d4a` |
| Marketing   | `2d5a4e63-bf23-8081-9ff6-e8ecf118aee6` |
| Research    | `2d5a4e63-bf23-80fd-bf70-f6d679ba0d14` |

---

## Property Schemas

### Teams Database

```json
{
  "Name": {
    "type": "title"
  },
  "Projects": {
    "type": "relation",
    "target": "Projects database"
  },
  "Tasks": {
    "type": "relation",
    "target": "Tasks database"
  },
  "Tasks Completed": {
    "type": "rollup",
    "computed": true
  },
  "Projects Complete": {
    "type": "rollup",
    "computed": true
  }
}
```

### Projects Database

```json
{
  "Name": {
    "type": "title"
  },
  "Status": {
    "type": "select",
    "options": ["Active", "Completed", "On Hold", "Cancelled"]
  },
  "Milestone": {
    "type": "select",
    "options": ["M1", "M2", "M3"]
  },
  "Phase": {
    "type": "select",
    "options": ["P1.1", "P1.2", "P1.3", "P2.1", "P2.2", "P2.3", "P3.1", "P3.2", "P3.3"]
  },
  "Domain": {
    "type": "select",
    "options": ["OPS", "PROD", "DES", "ENG", "MKT", "RES"]
  },
  "Start Date": {
    "type": "date"
  },
  "End Date": {
    "type": "date"
  },
  "Team": {
    "type": "relation",
    "target": "Teams database"
  },
  "Tasks": {
    "type": "relation",
    "target": "Tasks database"
  }
}
```

### Tasks Database

```json
{
  "Name": {
    "type": "title"
  },
  "Done": {
    "type": "checkbox",
    "property_id": "%3FN%3AC"
  },
  "Task Code": {
    "type": "formula",
    "computed": true
  },
  "Due": {
    "type": "date"
  },
  "Priority": {
    "type": "select",
    "options": ["High", "Medium", "Low"]
  },
  "Project": {
    "type": "relation",
    "target": "Projects database"
  },
  "Team": {
    "type": "relation",
    "target": "Teams database"
  },
  "Archived": {
    "type": "checkbox"
  }
}
```

### Meetings Database

```json
{
  "Name": {
    "type": "title"
  },
  "Type": {
    "type": "select",
    "options": ["Standup", "Sprint Planning", "Post-mortem", "Team Sync", "Ad Hoc"]
  },
  "Cadence": {
    "type": "select",
    "options": ["Daily", "Weekly", "Biweekly", "Monthly", "Ad Hoc"]
  },
  "Date": {
    "type": "date"
  },
  "Attendees": {
    "type": "relation",
    "target": "Teams database"
  },
  "Action Items": {
    "type": "relation",
    "target": "Tasks database"
  },
  "Projects": {
    "type": "relation",
    "target": "Projects database"
  },
  "Teams": {
    "type": "relation",
    "target": "Teams database"
  }
}
```

### Portfolio Database

```json
{
  "Name": {
    "type": "title"
  },
  "Tasks": {
    "type": "relation",
    "target": "Tasks database"
  },
  "Meetings": {
    "type": "relation",
    "target": "Meetings database"
  },
  "Teams": {
    "type": "relation",
    "target": "Teams database"
  },
  "Projects": {
    "type": "relation",
    "target": "Projects database"
  }
}
```

---

## Common MCP Operations

### 1. Query Database with Filters

**Use Case**: Find incomplete tasks for a specific team

```typescript
mcp_notionapi_API -
  query -
  data -
  source({
    data_source_id: '2d5a4e63-bf23-8137-8277-000b41c867c3', // Tasks database
    filter: {
      and: [
        {
          property: 'Done',
          checkbox: {
            equals: false,
          },
        },
        {
          property: 'Team',
          relation: {
            contains: '2d5a4e63-bf23-8034-a68a-f4e24b342def', // Engineering team ID
          },
        },
      ],
    },
    sorts: [
      {
        property: 'Task Code',
        direction: 'ascending',
      },
    ],
    page_size: 20,
  });
```

### 2. Create Page in Database

**Use Case**: Create a Portfolio page

```typescript
mcp_notionapi_API -
  post -
  page({
    parent: {
      database_id: '2e2a4e63-bf23-806a-b9c7-c532e18aeea7', // Portfolio database ID (for create)
    },
    properties: {
      Name: {
        title: [
          {
            text: {
              content: 'TO2 Sliding window patterns',
            },
          },
        ],
      },
      Tasks: {
        relation: [{ id: 'task-page-id-here' }],
      },
      Projects: {
        relation: [{ id: 'project-page-id-here' }],
      },
      Teams: {
        relation: [{ id: '2d5a4e63-bf23-8034-a68a-f4e24b342def' }],
      },
    },
  });
```

### 3. Update Page Properties

**Use Case**: Mark task as Done and update due date

```typescript
mcp_notionapi_API -
  patch -
  page({
    page_id: 'task-page-id-here',
    properties: {
      Done: {
        checkbox: true,
      },
      Due: {
        date: {
          start: '2026-01-08',
        },
      },
    },
  });
```

### 4. Add Relation to Existing Property

**Use Case**: Add task to meeting Action Items

```typescript
// First, retrieve current relations
mcp_notionapi_API - retrieve - a - page({ page_id: 'meeting-page-id' });

// Then update with new relation added
mcp_notionapi_API -
  patch -
  page({
    page_id: 'meeting-page-id',
    properties: {
      'Action Items': {
        relation: [
          { id: 'existing-task-id-1' },
          { id: 'existing-task-id-2' },
          { id: 'new-task-id' }, // Add this one
        ],
      },
    },
  });
```

### 5. Append Blocks to Page

**Use Case**: Add content to Portfolio page

```typescript
mcp_notionapi_API -
  patch -
  block -
  children({
    block_id: 'portfolio-page-id',
    children: [
      {
        type: 'heading_2',
        heading_2: {
          rich_text: [
            {
              text: {
                content: 'Deliverables',
              },
            },
          ],
        },
      },
      {
        type: 'paragraph',
        paragraph: {
          rich_text: [
            {
              text: {
                content: 'Implemented sliding window algorithm for array processing.',
              },
            },
          ],
        },
      },
      {
        type: 'bulleted_list_item',
        bulleted_list_item: {
          rich_text: [
            {
              text: {
                content: 'Time complexity: O(n)',
              },
            },
          ],
        },
      },
    ],
  });
```

### 6. Search for Page by Title

**Use Case**: Find today's Engineering Meeting

```typescript
mcp_notionapi_API -
  post -
  search({
    query: 'Engineering Meeting @2026-01-08',
    filter: {
      property: 'object',
      value: 'page',
    },
  });
```

### 7. Query Today's Meeting

**Use Case**: Get today's meeting for a specific team

```typescript
mcp_notionapi_API -
  query -
  data -
  source({
    data_source_id: '2caa4e63-bf23-815a-8981-000bbdbb7f0b', // Meetings database
    filter: {
      and: [
        {
          property: 'Date',
          date: {
            equals: '2026-01-08',
          },
        },
        {
          property: 'Attendees',
          relation: {
            contains: '2d5a4e63-bf23-8034-a68a-f4e24b342def', // Engineering team
          },
        },
      ],
    },
  });
```

---

## Common Query Patterns

### Get Next Incomplete Task for a Team

**Purpose**: Daily workflow automation

**Steps**:

1. Query Tasks database
2. Filter: `Done=false`, `Team=<team-id>`
3. Sort: `Task Code` ascending
4. Take: First result

**Example**:

```typescript
mcp_notionapi_API -
  query -
  data -
  source({
    data_source_id: '2d5a4e63-bf23-8137-8277-000b41c867c3',
    filter: {
      and: [
        { property: 'Done', checkbox: { equals: false } },
        { property: 'Team', relation: { contains: '2d5a4e63-bf23-8034-a68a-f4e24b342def' } },
      ],
    },
    sorts: [{ property: 'Task Code', direction: 'ascending' }],
    page_size: 1,
  });
```

### Get Active Projects for a Team

**Purpose**: Sprint planning, status checks

**Steps**:

1. Query Projects database
2. Filter: `Status=Active`, `Team=<team-id>`
3. Sort: `Milestone` ascending, then `Phase` ascending

**Example**:

```typescript
mcp_notionapi_API -
  query -
  data -
  source({
    data_source_id: '2d5a4e63-bf23-8115-a70f-000bc1ef9d05',
    filter: {
      and: [
        { property: 'Status', select: { equals: 'Active' } },
        { property: 'Team', relation: { contains: '2d5a4e63-bf23-8034-a68a-f4e24b342def' } },
      ],
    },
    sorts: [
      { property: 'Milestone', direction: 'ascending' },
      { property: 'Phase', direction: 'ascending' },
    ],
  });
```

### Check if Task is Already in Meeting Action Items

**Purpose**: Avoid duplicate assignments

**Steps**:

1. Retrieve meeting page
2. Check `Action Items` relation property
3. Look for task ID in the relation array

**Example**:

```typescript
// First, get meeting details
const meeting = (await mcp_notionapi_API) - retrieve - a - page({ page_id: 'meeting-id' });

// Then check if task ID is in Action Items
const taskId = 'task-id-to-check';
const actionItems = meeting.properties['Action Items'].relation;
const alreadyAssigned = actionItems.some((item) => item.id === taskId);
```

---

## Naming Conventions

### Projects

**Format**: `<Descriptive Name>`

**Examples**:

- "Architecture Planning"
- "User Authentication System"
- "Q1 Marketing Campaign"
- "Performance Optimization"

### Tasks

**Format**: `<Verb> <Object>`

**Examples**:

- "Implement OAuth flow"
- "Design landing page wireframe"
- "Write unit tests for API"
- "Review security architecture"
- "Validate MCP & tooling availability"

### Meetings

**Format**: `<Type> <YYYY-MM-DD>` or `<Type> @YYYY-MM-DD`

**Examples**:

- "Engineering Meeting 2026-01-08"
- "Sprint Planning 2026-01-15"
- "Daily Standup @2026-01-05"
- "Post-mortem Meeting 2026-01-20"

### Teams

**Format**: `<Domain> Team`

**Examples**:

- "Engineering Team"
- "Design Team"
- "Product Team"
- "Operations Team"
- "Marketing Team"
- "Research Team"

---

## Task Sequencing Rules

### Task Code Pattern

Each project has exactly **5 sequential tasks**:

- **T01**: Initial task / Setup
- **T02**: Development / Implementation
- **T03**: Review / Refinement
- **T04**: Testing / Validation
- **T05**: Completion / Handoff

### Workflow

1. Tasks are assigned daily via "Add Task" buttons
2. Tasks are completed same-day
3. When T01 is `Done=true`, T02 becomes the next task
4. Task coloring: **Green** = due today, **Red** = overdue
5. Archive via `Archived=true` (views filter `Archived != true`)

---

## Meeting-Team Mapping

### Shared Daily Standup

**Teams**: Product, Marketing, Research

**Meeting Name**: "Daily Standup @YYYY-MM-DD"

**Cadence**: Daily

### Individual Daily Meetings

| Team        | Meeting Name                      | Cadence |
| ----------- | --------------------------------- | ------- |
| Operations  | "Operations Meeting @YYYY-MM-DD"  | Daily   |
| Design      | "Design Meeting @YYYY-MM-DD"      | Daily   |
| Engineering | "Engineering Meeting @YYYY-MM-DD" | Daily   |

### Special Meetings

- **Sprint Planning**: Biweekly, all teams
- **Post-mortem**: End of sprint, team-specific
- **Team Sync**: Weekly, team-specific

---

## Critical Rules

### ❌ Never Create Meetings

Meetings are recurring templates that auto-generate in Notion. Always:

- Query existing meetings for a given team/date
- Add task relations to meeting Action Items
- Update meeting properties via relations

**Do NOT** use `mcp_notionapi_API-post-page` to create meeting pages.

### ✅ Always Verify Relations

Before adding a relation:

1. Query target database to confirm item exists
2. Retrieve current relations (if updating)
3. Append new relation to existing array
4. Verify bidirectional relationship after update

### ✅ Respect Formula Fields

- Do not manually override formula fields
- Let Notion compute: Task Code, rollups, completion percentages
- Only update editable properties (Done, Due, Priority, etc.)

### ✅ Maintain Data Integrity

- Always link tasks to projects
- Always link projects to teams
- Always link Portfolio pages to originating task
- Verify relationships are bidirectional

---

## Error Handling Reference

### Common Errors

| Error Message        | Cause                           | Solution                                                           |
| -------------------- | ------------------------------- | ------------------------------------------------------------------ |
| "database not found" | Wrong database ID or not shared | Use data source ID for queries, database ID for create-page parent |
| "property not found" | Incorrect property name         | Check schema; names are case-sensitive                             |
| "invalid relation"   | Relation ID doesn't exist       | Query target database first to verify ID                           |
| "title is required"  | Missing title property          | Always include title in properties object                          |
| "validation error"   | Property type mismatch          | Verify value matches property type                                 |

### Automatic Remediation

For known issues, attempt fixes:

**Issue**: Create-page fails with "database not found"  
**Fix**: Switch from data source ID to database ID in parent

**Issue**: Update-page rejects property update  
**Fix**: Re-query page to get current schema and property IDs

**Issue**: Relation update fails  
**Fix**: Query target entity to confirm ID exists

---

## Safety Limits

- **Batch operations**: Max 50 items per operation
- **Rate limiting**: 3 operations per second
- **Relation depth**: Limit to 2-3 levels
- **Query page size**: Default 20, max 100

---

## Quick Reference Links

### SOPs Database

**Data Source ID**: `2d8a4e63-bf23-80d1-8167-000bb402c275`
**Created**: 2025-12-29
**Purpose**: Standard Operating Procedures and process documentation

**Schema**:

```json
{
  "Name": {
    "type": "title"
  }
}
```

**Common Operations**:

```typescript
// Query all SOPs
mcp_notionapi_API -
  query -
  data -
  source({
    data_source_id: '2d8a4e63-bf23-80d1-8167-000bb402c275',
    page_size: 50,
  });

// Create new SOP
mcp_notionapi_API -
  post -
  page({
    parent: {
      database_id: '2d8a4e63-bf23-80de-8bcae-875ad74a446',
    },
    properties: {
      Name: {
        title: [{ text: { content: 'SOP Name' } }],
      },
    },
  });
```

**Reference**: See [README.sops.md](README.sops.md) for detailed documentation

---

### Tech Stack Database

**Data Source ID**: `276a4e63-bf23-80e2-bbae-000b2fa9662a`
**Created**: 2025-09-22
**Purpose**: Technology inventory with categories, languages, types, and tags

**Schema**:

```json
{
  "Name": {
    "type": "title"
  },
  "Category": {
    "type": "select",
    "options": [
      "Framework",
      "Runtime",
      "Language",
      "Database",
      "ORM",
      "Auth",
      "UI / Styling",
      "Data Visualization",
      "File Handling",
      "Testing",
      "Forms & Validation",
      "State / Cache",
      "Mobile / Responsive",
      "Security",
      "Dev Tools",
      "Build & Deploy",
      "Date / Time",
      "Utilities",
      "Monitoring / Logging",
      "Payments / Billing"
    ]
  },
  "Programming Languages": {
    "type": "multi_select",
    "options": ["TypeScript", "JavaScript", "Python"]
  },
  "Type": {
    "type": "select",
    "options": ["UI Component", "Infra", "Tooling", "Core", "Integration", "Utility", "Library"]
  },
  "Tags": {
    "type": "multi_select",
    "options": [
      "React",
      "Next.js",
      "TypeScript",
      "Tailwind",
      "Prisma",
      "PostgreSQL",
      "Clerk",
      "ShadCN UI",
      "Vitest",
      "Playwright",
      "Stripe",
      "Frontend",
      "Backend",
      "DevOps",
      "Testing",
      "Database",
      "Auth",
      "UI",
      "API",
      "and more..."
    ]
  },
  "Docs Link": {
    "type": "url"
  },
  "Edited": {
    "type": "last_edited_time",
    "computed": true
  }
}
```

**Common Operations**:

```typescript
// Query all technologies
mcp_notionapi_API -
  query -
  data -
  source({
    data_source_id: '276a4e63-bf23-80e2-bbae-000b2fa9662a',
    page_size: 50,
  });

// Query by category
mcp_notionapi_API -
  query -
  data -
  source({
    data_source_id: '276a4e63-bf23-80e2-bbae-000b2fa9662a',
    filter: {
      property: 'Category',
      select: { equals: 'Framework' },
    },
  });

// Query by language
mcp_notionapi_API -
  query -
  data -
  source({
    data_source_id: '276a4e63-bf23-80e2-bbae-000b2fa9662a',
    filter: {
      property: 'Programming Languages',
      multi_select: { contains: 'TypeScript' },
    },
  });

// Create new technology entry
mcp_notionapi_API -
  post -
  page({
    parent: {
      database_id: '276a4e63-bf23-80de-8bca-e875ad74a446',
    },
    properties: {
      Name: {
        title: [{ text: { content: 'Next.js' } }],
      },
      Category: {
        select: { name: 'Framework' },
      },
      'Programming Languages': {
        multi_select: [{ name: 'TypeScript' }, { name: 'JavaScript' }],
      },
      Type: {
        select: { name: 'Core' },
      },
      Tags: {
        multi_select: [{ name: 'Frontend' }, { name: 'React' }],
      },
      'Docs Link': {
        url: 'https://nextjs.org',
      },
    },
  });
```

**Reference**: See [README.tech-stack.md](README.tech-stack.md) for detailed documentation, category options, and type classifications

---

### Blog Database

**Data Source ID**: `2cda4e63-bf23-81b2-90ed-000b622c6dfc`
**Title**: "Regrets, Cigarettes, & Neural Nets"
**Created**: 2025-12-18
**Purpose**: Personal blog and curated resource library

**Schema**:

```json
{
  "Name": {
    "type": "title"
  },
  "Type": {
    "type": "multi_select",
    "options": ["Book", "Youtube", "Article", "Podcast", "Document", "Blog Post"]
  },
  "Tags": {
    "type": "multi_select",
    "options": [
      "Mindfulness",
      "Development",
      "Psychology",
      "Mental Health",
      "Learning",
      "Humor",
      "Tech",
      "Lifestyle",
      "Hobbies"
    ]
  },
  "Published": {
    "type": "date"
  },
  "Status": {
    "type": "select",
    "options": ["Active", "Inactive [ Archive ]"]
  }
}
```

**Common Operations**:

```typescript
// Query all blog entries
mcp_notionapi_API -
  query -
  data -
  source({
    data_source_id: '2cda4e63-bf23-81b2-90ed-000b622c6dfc',
    page_size: 50,
  });

// Query by type
mcp_notionapi_API -
  query -
  data -
  source({
    data_source_id: '2cda4e63-bf23-81b2-90ed-000b622c6dfc',
    filter: {
      property: 'Type',
      multi_select: { contains: 'Article' },
    },
  });

// Query by tag
mcp_notionapi_API -
  query -
  data -
  source({
    data_source_id: '2cda4e63-bf23-81b2-90ed-000b622c6dfc',
    filter: {
      property: 'Tags',
      multi_select: { contains: 'Mindfulness' },
    },
  });

// Query active entries only
mcp_notionapi_API -
  query -
  data -
  source({
    data_source_id: '2cda4e63-bf23-81b2-90ed-000b622c6dfc',
    filter: {
      property: 'Status',
      select: { equals: 'Active' },
    },
  });

// Create new blog entry
mcp_notionapi_API -
  post -
  page({
    parent: {
      database_id: '2cda4e63-bf23-806f-8d9f-c46e6e0cf7bd',
    },
    properties: {
      Name: {
        title: [{ text: { content: 'Article Title' } }],
      },
      Type: {
        multi_select: [{ name: 'Article' }, { name: 'Blog Post' }],
      },
      Tags: {
        multi_select: [{ name: 'Mindfulness' }, { name: 'Psychology' }],
      },
      Published: {
        date: { start: '2025-12-15' },
      },
      Status: {
        select: { name: 'Active' },
      },
    },
  });
```

**Reference**: See [README.blog.md](README.blog.md) for detailed documentation, content types, and tagging strategy

---

## Additional References

- **Database Configuration**: [../../config/databases.json](../../config/databases.json)
- **Project & Task Inventory**: [../../.copilot/reports/project-task-reference.md](../../.copilot/reports/project-task-reference.md)
- **Daily Workflow Skill**: [../../.github/skills/notion-daily/daily-workflow.md](../../.github/skills/notion-daily/daily-workflow.md)
- **Portfolio Workflow Skill**: [../../.github/skills/notion-portfolio/portfolio-workflow.md](../../.github/skills/notion-portfolio/portfolio-workflow.md)
- **Sprint Planning Skill**: [../../.github/skills/notion-sprint/sprint-workflow.md](../../.github/skills/notion-sprint/sprint-workflow.md)

---

End of Reference Document
