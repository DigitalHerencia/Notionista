# Notionista SDK Examples

This directory contains example scripts demonstrating how to use the Notionista SDK for various automation tasks with your Notion workspace.

## Prerequisites

Before running any examples:

1. **Install dependencies**
   ```bash
   pnpm install
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env and add your NOTION_TOKEN
   ```

3. **Build the SDK**
   ```bash
   pnpm build
   ```

## Running Examples

All examples can be run with TypeScript using ts-node or tsx:

```bash
# Using tsx (recommended)
pnpm tsx examples/query-tasks.ts

# Or using ts-node
npx ts-node examples/query-tasks.ts
```

## Available Examples

### Basic Operations

- **[query-tasks.ts](./query-tasks.ts)** - Query and filter tasks
  ```bash
  pnpm tsx examples/query-tasks.ts
  ```
  Demonstrates:
  - Basic task queries
  - Filtering by status and priority
  - Ordering results
  - Pagination

- **[query-projects.ts](./query-projects.ts)** - Query and filter projects
  ```bash
  pnpm tsx examples/query-projects.ts
  ```
  Demonstrates:
  - Querying active projects
  - Filtering by milestone and phase
  - Working with date ranges
  - Accessing related tasks

### Safety Workflow

- **[safety-layer-demo.ts](./safety-layer-demo.ts)** - Complete safety layer demonstration
  ```bash
  pnpm tsx examples/safety-layer-demo.ts
  ```
  Demonstrates:
  - DiffEngine for computing property changes
  - Validator for pre-change validation
  - BatchLimiter for enforcing size limits
  - ProposalManager lifecycle (Propose → Approve → Apply)
  - All safety layer components in action

- **[safety-workflow.ts](./safety-workflow.ts)** - Demonstrate Propose → Approve → Apply
  ```bash
  pnpm tsx examples/safety-workflow.ts
  ```
  Demonstrates:
  - Creating change proposals
  - Reviewing proposed changes
  - Approving proposals
  - Applying approved changes
  - Handling rejections

### Workflow Orchestration

- **[create-sprint.ts](./create-sprint.ts)** - Complete sprint planning workflow
  ```bash
  pnpm tsx examples/create-sprint.ts
  ```
  Demonstrates:
  - Planning a complete sprint
  - Creating project with tasks and meetings
  - Linking related entities
  - Executing aggregate proposals

- **[daily-standup.ts](./daily-standup.ts)** - Generate daily standup report
  ```bash
  pnpm tsx examples/daily-standup.ts
  ```
  Demonstrates:
  - Querying incomplete tasks
  - Generating team reports
  - Identifying blockers
  - Formatting output

### Batch Operations

- **[bulk-update.ts](./bulk-update.ts)** - Safe bulk operations
  ```bash
  pnpm tsx examples/bulk-update.ts
  ```
  Demonstrates:
  - Updating multiple items safely
  - Batch size limits enforcement
  - Progress tracking
  - Error handling

### Analytics & Reporting

- **[analytics.ts](./analytics.ts)** - Team metrics and analytics
  ```bash
  pnpm tsx examples/analytics.ts
  ```
  Demonstrates:
  - Calculating team metrics
  - Generating completion rates
  - Identifying overdue tasks
  - Creating reports

### Advanced Features

- **[snapshot-diff.ts](./snapshot-diff.ts)** - Compare snapshots
  ```bash
  pnpm tsx examples/snapshot-diff.ts
  ```
  Demonstrates:
  - Capturing database snapshots
  - Comparing to live data
  - Detecting drift
  - Generating diff reports

- **[custom-middleware.ts](./custom-middleware.ts)** - Custom MCP middleware
  ```bash
  pnpm tsx examples/custom-middleware.ts
  ```
  Demonstrates:
  - Creating custom middleware
  - Logging requests/responses
  - Adding request headers
  - Error transformation

## Example Categories

### For Beginners

Start with these examples to learn the basics:

1. [safety-layer-demo.ts](./safety-layer-demo.ts) - Safety layer components
2. [query-tasks.ts](./query-tasks.ts) - Simple queries
3. [safety-workflow.ts](./safety-workflow.ts) - Understanding proposals
4. [create-sprint.ts](./create-sprint.ts) - Basic workflow

### For Intermediate Users

Once comfortable with basics:

1. [bulk-update.ts](./bulk-update.ts) - Batch operations
2. [analytics.ts](./analytics.ts) - Metrics and reporting
3. [daily-standup.ts](./daily-standup.ts) - Workflow automation

### For Advanced Users

Advanced features and customization:

1. [snapshot-diff.ts](./snapshot-diff.ts) - Snapshot management
2. [custom-middleware.ts](./custom-middleware.ts) - Extending the SDK
3. [error-handling.ts](./error-handling.ts) - Robust error handling

## Common Patterns

### Connecting to SDK

All examples follow this pattern:

```typescript
import { NotionistaSdk } from 'notionista';

const sdk = new NotionistaSdk({
  notionToken: process.env.NOTION_TOKEN!,
});

async function main() {
  try {
    await sdk.connect();
    
    // Your code here
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await sdk.disconnect();
  }
}

main();
```

### Error Handling

Recommended error handling pattern:

```typescript
try {
  const result = await sdk.tasks.findMany();
  console.log('Success:', result);
} catch (error) {
  if (error instanceof NotionApiError) {
    console.error('Notion API error:', error.message);
  } else if (error instanceof McpError) {
    console.error('MCP error:', error.message);
  } else {
    console.error('Unexpected error:', error);
  }
}
```

### Using Proposals

Always review proposals before applying:

```typescript
// 1. Create proposal
const proposal = await sdk.tasks.create({
  name: 'New task',
  priority: 'High',
});

// 2. Review
console.log(proposal.formatForReview());

// 3. Approve and apply
await proposal.approve();
const result = await proposal.apply();

console.log('Task created:', result.id);
```

## Environment Variables

All examples expect these environment variables:

```bash
# Required
NOTION_TOKEN=ntn_***  # Your Notion integration token

# Optional
LOG_LEVEL=debug       # Enable debug logging
DRY_RUN=true         # Preview changes without applying
```

## Troubleshooting

### "NOTION_TOKEN is not defined"

Make sure you have a `.env` file with your Notion token:

```bash
echo "NOTION_TOKEN=your_token_here" > .env
```

### "Cannot connect to MCP server"

Ensure `@notionhq/notion-mcp-server` is installed globally or available in PATH:

```bash
npm install -g @notionhq/notion-mcp-server
```

### "Database not found"

Verify that your Notion integration has access to the databases you're trying to query. Share the databases with your integration in Notion.

### Rate Limiting

If you see rate limit errors, the SDK automatically handles retries with exponential backoff. You can adjust the rate limit:

```typescript
const sdk = new NotionistaSdk({
  notionToken: process.env.NOTION_TOKEN!,
  rateLimit: 2, // Reduce to 2 requests per second
});
```

## Contributing Examples

Have a useful example? Contributions are welcome!

1. Create a new `.ts` file in this directory
2. Follow the common patterns above
3. Add comprehensive comments
4. Update this README with your example
5. Submit a pull request

See [CONTRIBUTING.md](../CONTRIBUTING.md) for detailed guidelines.

## Additional Resources

- [SDK Documentation](../README.md)
- [API Reference](../docs/api-reference.md)
- [Design Documents](../.copilot/reports/)
- [GitHub Issues](https://github.com/DigitalHerencia/Notionista/issues)

---

**Need help?** Open an issue or start a discussion on GitHub!
