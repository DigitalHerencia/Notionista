---
post_title: Getting Started with Notionista
author1: Digital Herencia
post_slug: getting-started
microsoft_alias: digitalherencia
featured_image: /assets/getting-started.png
categories: Control Plane, Documentation, Tutorial
tags: notion, mcp, automation, typescript, copilot, quickstart
ai_note: Documentation generated with AI assistance
summary: Get up and running with Notionista control plane and Copilot-driven automation
post_date: 2026-01-07
---

# Getting Started

Get up and running with Notionista and Copilot-driven Notion automation.

## Prerequisites

Before you begin, ensure you have the following:

| Requirement            | Version | Notes                                                    |
| ---------------------- | ------- | -------------------------------------------------------- |
| **VS Code**            | Latest  | Required for GitHub Copilot and MCP integration          |
| **GitHub Copilot**     | Latest  | Copilot extension for VS Code                            |
| **Notion MCP**         | -       | Configured in VS Code (managed by VS Code, not this repo)|
| **Node.js**            | 20+     | Required for type definitions and local development      |
| **TypeScript**         | 5.9+    | For full type safety and IntelliSense                    |

## Installation

Install Notionista for type definitions and schemas:

```bash
# Using pnpm (recommended)
pnpm add notionista

# Using npm
npm install notionista

# Using yarn
yarn add notionista
```

## MCP Setup (In VS Code)

Configure Notion MCP in VS Code (this is managed by VS Code, not Notionista):

1. Open VS Code Settings (JSON)
2. Configure MCP server:

```json
{
  "github.copilot.chat.mcpServers": {
    "notion": {
      "command": "npx",
      "args": ["-y", "@notionhq/notion-mcp-server"],
      "env": {
        "NOTION_API_KEY": "your-notion-token"
      }
    }
  }
}
```

3. Restart VS Code
4. MCP connection is now managed by VS Code

**Note:** The MCP server runs inside VS Code and handles all execution. Notionista provides types and governance.

## Usage with Copilot

Notionista provides the governance layer - you interact through natural language in Copilot Chat.

### Example Conversation

**Natural language request:**
```
@workspace Show me all incomplete high-priority tasks due this week
```

**Copilot's response:**
```
I'll query the tasks using Notionista's type definitions:

Found 3 incomplete high-priority tasks:
1. Update API documentation (due 2026-01-10)
2. Fix authentication flow (due 2026-01-12)
3. Add unit tests (due 2026-01-15)
```

**Natural language request:**
```
@workspace Create a new task to review these items, high priority, due tomorrow
```

**Copilot's response:**
```
I'll create a task proposal using Notionista's ChangeProposal type:

## Change Proposal
**Type**: create
**Target Database**: Tasks

### Proposed Changes
- name: "Review high-priority tasks"
- priority: "High"
- due: "2026-01-08"
- done: false

Approve to proceed?
```

**Your response:**
```
Approved
```

**Copilot executes via MCP:**
```
✅ Task created successfully (task-abc123)
```

### How It Works

1. **You speak naturally** to Copilot in VS Code
2. **Copilot reasons** using Notionista's types and constraints
3. **Copilot proposes** changes using declarative schemas
4. **You approve** the proposal
5. **VS Code MCP client executes** the approved changes
6. **Notionista never executes** - it only provides the governance layer

## Programmatic Usage (Optional)

If you need direct programmatic access, import types and create declarative proposals:

```typescript
import type { Task, ChangeProposal, QueryFilter } from 'notionista';

// Define query intent (not executed)
const filter: QueryFilter = {
  and: [
    { property: 'Done', checkbox: { equals: false } },
    { property: 'Priority', select: { equals: 'High' } }
  ]
};

// Create a declarative proposal (no execution)
const proposal: ChangeProposal<Task> = {
  id: 'proposal-123',
  type: 'create',
  target: { database: 'tasks' },
  currentState: null,
  proposedState: {
    id: 'task-new',
    name: 'Review tasks',
    done: false,
    priority: 'High',
    due: '2026-01-08'
  },
  diff: [
    { property: 'name', oldValue: null, newValue: 'Review tasks', impact: 'low' },
    { property: 'priority', oldValue: null, newValue: 'High', impact: 'medium' }
  ],
  validation: { valid: true, errors: [], warnings: [] },
  status: 'pending'
};

// Copilot reviews and executes via VS Code MCP client
// This code describes intent - execution is delegated
```

## TypeScript Configuration

Ensure your `tsconfig.json` includes these settings for optimal type safety:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "declaration": true
  },
  "include": ["src/**/*"]
}
```

## Next Steps

Now that you understand the Copilot-first model, explore these topics:

| Topic                               | Description                                         |
| ----------------------------------- | --------------------------------------------------- |
| [Core Concepts](./core-concepts.md) | Learn about the control plane and governance model  |
| [Query Builder](./query-builder.md) | Declarative query schemas for expressing intent     |
| [Workflows](./workflows.md)         | Workflow type definitions and patterns              |
| [Examples](./examples.md)           | Complete usage examples for Copilot                 |

## Common Questions

### Who executes the MCP requests?

**VS Code's MCP client** handles all execution. Notionista provides types and governance, Copilot reasons and proposes, VS Code executes.

### Can I use this without Copilot?

Yes, but programmatically. Import types and create proposals directly. However, the primary design is for Copilot consumption.

### Where is retry logic handled?

**VS Code MCP client** handles retries. Notionista provides constraint metadata documenting retry behavior (3 retries, exponential backoff).

### Where is rate limiting enforced?

**VS Code MCP client** enforces rate limits (3 requests/second). Notionista provides constraint metadata for Copilot planning.
