---
post_title: Getting Started with Notionista SDK
author1: Digital Herencia
post_slug: getting-started
microsoft_alias: digitalherencia
featured_image: /assets/getting-started.png
categories: SDK, Documentation, Tutorial
tags: notion, mcp, automation, typescript, quickstart
ai_note: Documentation generated with AI assistance
summary: Get up and running with Notionista SDK in under 5 minutes
post_date: 2026-01-05
---

# Getting Started

Get up and running with Notionista SDK in under 5 minutes.

## Prerequisites

Before you begin, ensure you have the following installed:

| Requirement        | Version | Notes                                            |
| ------------------ | ------- | ------------------------------------------------ |
| **Node.js**        | 20+     | Required for ES modules support                  |
| **pnpm**           | Latest  | Recommended package manager (npm/yarn also work) |
| **Notion Account** | -       | With MCP integration configured                  |
| **TypeScript**     | 5.9+    | For full type safety                             |

## Installation

Install the Notionista SDK using your preferred package manager:

```bash
# Using pnpm (recommended)
pnpm add notionista

# Using npm
npm install notionista

# Using yarn
yarn add notionista
```

## Environment Setup

Create a `.env` file in your project root with your Notion integration token:

```bash
# Required - Your Notion integration token
NOTION_TOKEN=ntn_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Optional configuration
MCP_SERVER_PATH=/path/to/notion-mcp-server
LOG_LEVEL=info
CACHE_TTL=300
RATE_LIMIT=3
```

### Obtaining a Notion Token

1. Visit [Notion Integrations](https://www.notion.so/my-integrations)
2. Click **"New integration"**
3. Configure the integration:
   - **Name**: `Notionista SDK`
   - **Associated workspace**: Select your target workspace
   - **Capabilities**: Enable Read, Update, and Insert content
4. Copy the **Internal Integration Token**
5. Share your databases with the integration in Notion

## Basic Usage

Here's a complete example to get you started:

```typescript
import { NotionistaSdk } from 'notionista';

// Initialize the SDK
const sdk = new NotionistaSdk({
  notionToken: process.env.NOTION_TOKEN!,
  logLevel: 'info',
});

async function main() {
  // Connect to MCP server
  await sdk.connect();

  try {
    // Query incomplete tasks
    const tasks = await sdk.tasks.findMany({
      where: { done: false },
      orderBy: { due: 'asc' },
    });

    console.log(`Found ${tasks.length} incomplete tasks`);

    // Display task list
    for (const task of tasks) {
      console.log(`- [${task.priority || 'No Priority'}] ${task.name}`);
      if (task.due) {
        console.log(`  Due: ${new Date(task.due).toLocaleDateString()}`);
      }
    }

    // Create a new task (returns a proposal)
    const proposal = await sdk.tasks.create({
      name: 'Review documentation',
      priority: 'High',
      due: new Date('2026-01-15').toISOString(),
    });

    // Review the proposal before applying
    console.log('\n--- Change Proposal ---');
    console.log(proposal.formatForReview());

    // Approve and apply the change
    await proposal.approve();
    const result = await proposal.apply();
    console.log(`Created task: ${result.entityId}`);
  } finally {
    // Always disconnect when done
    await sdk.disconnect();
  }
}

main().catch(console.error);
```

## Understanding the Output

When you run the example above, you'll see output similar to:

```bash
Found 15 incomplete tasks
- [High] Complete API documentation
  Due: 1/10/2026
- [Medium] Update README examples
  Due: 1/12/2026
- [Low] Add unit tests for QueryBuilder

--- Change Proposal ---
## Change Proposal: proposal-1704499200-abc123

**Type**: create
**Target Database**: See config/databases.json for current database ID
**Status**: pending
**Created**: 2026-01-05T12:00:00.000Z

### Property Changes

- **name** (low impact)
  - Old: `null`
  - New: `"Review documentation"`
- **priority** (medium impact)
  - Old: `null`
  - New: `"High"`
- **due** (medium impact)
  - Old: `null`
  - New: `"2026-01-15T00:00:00.000Z"`

Created task: abc123-def456-ghi789
```

## Project Structure

A typical Notionista project structure looks like:

```bash
my-project/
├── src/
│   ├── index.ts          # Main entry point
│   ├── workflows/        # Custom workflows
│   └── scripts/          # Automation scripts
├── .env                  # Environment variables
├── package.json
└── tsconfig.json
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
    "declaration": true,
    "outDir": "./dist"
  },
  "include": ["src/**/*"]
}
```

## Next Steps

Now that you have Notionista set up, explore these topics:

| Topic                               | Description                                      |
| ----------------------------------- | ------------------------------------------------ |
| [Core Concepts](./core-concepts.md) | Learn about the safety workflow and architecture |
| [Query Builder](./query-builder.md) | Build complex queries with a fluent API          |
| [Workflows](./workflows.md)         | Orchestrate sprints and team operations          |
| [Examples](./examples.md)           | Complete working examples                        |

## Common Issues

### Connection Errors

If you encounter connection errors:

1. Verify your `NOTION_TOKEN` is correct
2. Ensure your integration has access to the target databases
3. Check that databases are shared with your integration in Notion

### Type Errors

If TypeScript shows type errors:

1. Ensure you're using TypeScript 5.9+
2. Run `pnpm install` to ensure all dependencies are installed
3. Check that `esModuleInterop` is enabled in your tsconfig

For more troubleshooting help, see the [Troubleshooting Guide](./troubleshooting.md).
