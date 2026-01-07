# Contributing to Notionista

Thank you for your interest in contributing to Notionista! This document provides guidelines and instructions for contributing to the control plane.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Documentation](#documentation)
- [Pull Request Process](#pull-request-process)
- [Release Process](#release-process)

## Code of Conduct

We are committed to providing a welcoming and inclusive environment. Please:

- Be respectful and constructive in discussions
- Welcome newcomers and help them get started
- Focus on what is best for the community
- Show empathy towards other community members

## Quick CI Check Before Submitting

Before pushing your branch, ensure your code passes all checks:

```bash
# This command runs all checks locally (same as CI)
pnpm lint && pnpm format && pnpm typecheck && pnpm test:coverage && pnpm build
```

✅ **All checks must pass** or your PR will fail CI and require fixes.

## Getting Started

### Prerequisites

- Node.js 20 or higher
- pnpm 8.x (recommended) or npm
- Git
- VS Code with GitHub Copilot (for testing Copilot integration)
- Notion account with MCP integration configured (for testing)

### Initial Setup

1. **Fork the repository**

   Click the "Fork" button on the [Notionista repository](https://github.com/DigitalHerencia/Notionista) to create your own fork.

2. **Clone your fork**

   ```bash
   git clone https://github.com/YOUR-USERNAME/Notionista.git
   cd Notionista
   ```

3. **Add upstream remote**

   ```bash
   git remote add upstream https://github.com/DigitalHerencia/Notionista.git
   ```

4. **Install dependencies**

   ```bash
   pnpm install
   ```

5. **Set up environment variables** (for testing with MCP)

   ```bash
   cp .env.example .env
   # Edit .env and add your NOTION_TOKEN for VS Code MCP testing
   ```

6. **Build type definitions**

   ```bash
   pnpm build
   ```

7. **Run tests**

   ```bash
   pnpm test
   ```

## Development Workflow

### Understanding the Control Plane Model

Notionista is a **control plane** that provides:
- Type definitions for Copilot reasoning
- Validation rules and constraints
- Declarative proposal schemas

**What Notionista does NOT do:**
- Execute MCP requests (handled by VS Code)
- Manage connections or retry logic
- Run servers or background processes

When contributing, focus on:
- Type safety and schema definitions
- Validation logic and constraint metadata
- Documentation for Copilot consumption

### Creating a Feature Branch

Always create a new branch for your work:

```bash
# Update your develop branch (main development branch)
git checkout develop
git pull upstream develop

# Create and switch to a new feature branch
git checkout -b feature/your-feature-name
```

**Note**: When creating a PR, target the `develop` branch for features,
or `main` for hotfixes. Only maintainers merge `develop` → `main`.

### Branch Naming Convention

Use descriptive branch names with prefixes:

- `feature/` - New features (e.g., `feature/add-snapshot-manager`)
- `fix/` - Bug fixes (e.g., `fix/rate-limiter-timing`)
- `docs/` - Documentation updates (e.g., `docs/improve-readme`)
- `test/` - Test additions or updates (e.g., `test/add-repository-tests`)
- `refactor/` - Code refactoring (e.g., `refactor/simplify-query-builder`)
- `chore/` - Tooling and configuration (e.g., `chore/update-dependencies`)

### Making Changes

1. **Write your code**

   Follow the [Coding Standards](#coding-standards) below.

2. **Add tests**

   All new features and bug fixes should include tests.

3. **Update documentation**

   Update relevant documentation including:
   - JSDoc comments in code
   - README.md (if adding new features)
   - API documentation
   - Examples (if applicable)

4. **Run quality checks** (in this order)

   ```bash
   # Auto-fix linting issues
   pnpm lint -- --fix

   # Auto-format code
   pnpm format

   # Type checking
   pnpm typecheck

   # Run tests with coverage
   pnpm test:coverage

   # Or run all at once
   pnpm lint && pnpm format && pnpm typecheck && pnpm test:coverage
   ```

   ⚠️ **Important**: Your code must pass all checks to be accepted in CI.
   If any checks fail, the PR will be blocked. Use `--fix` flags liberally
   during development to catch issues early.

5. **Commit your changes**

   Follow the [Commit Convention](#commit-convention) below.

### Commit Convention

We use [Conventional Commits](https://www.conventionalcommits.org/) for clear commit history:

#### Format

```text
<type>(<scope>): <subject>

<body>

<footer>
```

#### Types

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, semicolons, etc.)
- `refactor:` - Code refactoring (no functional changes)
- `perf:` - Performance improvements
- `test:` - Adding or updating tests
- `build:` - Build system changes
- `ci:` - CI/CD configuration changes
- `chore:` - Other changes that don't modify src or test files

#### Scope (optional)

The scope specifies the area of the codebase:

- `mcp` - MCP client layer
- `domain` - Domain entities and repositories
- `safety` - Safety layer (proposals, validation)
- `workflows` - Workflow orchestration
- `query` - Query builder
- `docs` - Documentation
- `tests` - Test infrastructure

#### Examples

```bash
feat(domain): add Meeting repository with relation support

Add MeetingRepository implementation with support for:
- Querying meetings by type and date
- Creating meetings with team and project relations
- Linking action item tasks

Closes #42
```

```bash
fix(mcp): correct rate limiter timing calculation

The rate limiter was not properly calculating the delay between
requests, leading to API throttling. This fix ensures requests
are properly spaced at 3 per second.

Fixes #56
```

```bash
docs(readme): add quick start guide and examples

Add comprehensive quick start section to README with:
- Installation instructions
- Basic usage examples
- Links to example scripts

No code changes.
```

## Coding Standards

### TypeScript Style

- Use TypeScript strict mode
- Prefer `const` over `let`, avoid `var`
- Use meaningful variable and function names
- Prefer explicit types over `any`
- Use interfaces for object shapes
- Use type aliases for unions and complex types

### Code Organization

```typescript
// 1. Imports (grouped by external, internal, types)
import { EventEmitter } from 'events';

import { McpClient } from '../mcp/client';
import { QueryBuilder } from '../query/builder';

import type { Repository } from '../core/types';

// 2. Constants
const MAX_BATCH_SIZE = 50;
const DEFAULT_TIMEOUT = 30000;

// 3. Types and interfaces
interface RepositoryOptions {
  cacheEnabled?: boolean;
  timeout?: number;
}

// 4. Class/function implementation
export class BaseRepository<T> implements Repository<T> {
  // ...
}
```

### Naming Conventions

- **Classes**: PascalCase (e.g., `TeamRepository`, `ProposalManager`)
- **Functions**: camelCase (e.g., `findMany`, `createProposal`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_BATCH_SIZE`, `DATABASE_IDS`)
- **Interfaces**: PascalCase with descriptive names (e.g., `ChangeProposal`, `QueryFilter`)
- **Type aliases**: PascalCase (e.g., `ProjectStatus`, `DatabaseId`)
- **Private members**: prefix with underscore (e.g., `_pendingRequests`)

### Comments and Documentation

#### JSDoc for Public APIs

All exported classes, functions, and types must have JSDoc:

````typescript
/**
 * Repository for managing Team entities in Notion.
 *
 * Provides type-safe CRUD operations with built-in proposal workflow
 * for all mutations. All write operations return ChangeProposal instances
 * that must be approved before execution.
 *
 * @example
 * ```typescript
 * const teams = await teamRepo.findMany();
 * const proposal = await teamRepo.create({ name: 'Engineering Team' });
 * await proposal.approve();
 * await proposal.apply();
 * ```
 */
export class TeamRepository extends BaseRepository<Team> {
  /**
   * Find all teams matching the given filter.
   *
   * @param filter - Optional filter criteria for querying teams
   * @returns Promise resolving to array of Team entities
   * @throws {NotionApiError} If the Notion API request fails
   *
   * @example
   * ```typescript
   * // Find teams with completed projects
   * const teams = await repo.findMany({
   *   where: { projectsComplete: { greaterThan: 0 } }
   * });
   * ```
   */
  async findMany(filter?: QueryFilter): Promise<Team[]> {
    // Implementation
  }
}
````

#### Inline Comments

Use inline comments sparingly and only for complex logic:

```typescript
// Calculate exponential backoff with jitter to avoid thundering herd
const delay = Math.min(baseDelay * Math.pow(2, attempt) + Math.random() * 1000, maxDelay);
```

### Error Handling

- Use custom error classes from `src/core/errors/`
- Always provide meaningful error messages
- Include context in error messages (e.g., IDs, operation type)
- Re-throw errors after logging when appropriate

```typescript
try {
  const result = await this.mcp.callTool('query-data-source', params);
  return this.transformResults(result);
} catch (error) {
  if (error instanceof McpError) {
    throw new RepositoryError(`Failed to query ${this.databaseId}: ${error.message}`, {
      cause: error,
      databaseId: this.databaseId,
    });
  }
  throw error;
}
```

### Async/Await

- Prefer `async/await` over raw Promises
- Always handle promise rejections
- Use `Promise.all()` for parallel operations
- Add timeouts for external calls

```typescript
// Good
async function loadAllData() {
  const [teams, projects, tasks] = await Promise.all([
    teamRepo.findMany(),
    projectRepo.findMany(),
    taskRepo.findMany(),
  ]);
  return { teams, projects, tasks };
}

// Avoid
function loadAllData() {
  return teamRepo.findMany().then((teams) => {
    return projectRepo.findMany().then((projects) => {
      return taskRepo.findMany().then((tasks) => {
        return { teams, projects, tasks };
      });
    });
  });
}
```

## Testing

### Test Structure

- Place unit tests in `tests/unit/`
- Place integration tests in `tests/integration/`
- Place test fixtures in `tests/fixtures/`
- Mirror the `src/` directory structure

### Writing Tests

Use Vitest with descriptive test names:

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TaskRepository } from '../../../src/domain/repositories/task.repository';
import { mockMcpClient } from '../../fixtures/mcp-mock';

describe('TaskRepository', () => {
  let taskRepo: TaskRepository;
  let mockClient: ReturnType<typeof mockMcpClient>;

  beforeEach(() => {
    mockClient = mockMcpClient();
    taskRepo = new TaskRepository(mockClient, DATABASE_IDS.TASKS);
  });

  describe('findMany', () => {
    it('should return all tasks when no filter provided', async () => {
      mockClient.queryDataSource.mockResolvedValue(mockTaskPages);

      const tasks = await taskRepo.findMany();

      expect(tasks).toHaveLength(5);
      expect(mockClient.queryDataSource).toHaveBeenCalledWith({
        database_id: DATABASE_IDS.TASKS,
      });
    });

    it('should filter incomplete tasks', async () => {
      mockClient.queryDataSource.mockResolvedValue(mockIncompleteTaskPages);

      const tasks = await taskRepo.findMany({ where: { done: false } });

      expect(tasks).toHaveLength(3);
      expect(tasks.every((t) => !t.done)).toBe(true);
    });

    it('should throw RepositoryError on MCP client failure', async () => {
      mockClient.queryDataSource.mockRejectedValue(new McpError('API error'));

      await expect(taskRepo.findMany()).rejects.toThrow(RepositoryError);
    });
  });

  describe('create', () => {
    it('should return a ChangeProposal without executing', async () => {
      const proposal = await taskRepo.create({
        name: 'New task',
        priority: 'High',
      });

      expect(proposal.status).toBe('pending');
      expect(proposal.proposedState.name).toBe('New task');
      expect(mockClient.createPage).not.toHaveBeenCalled();
    });
  });
});
```

### Test Coverage

- Aim for 80%+ code coverage
- All public APIs must have tests
- All error paths should be tested
- Complex logic should have comprehensive tests

Run coverage report:

```bash
pnpm test:coverage
```

### Integration Tests

Integration tests should:

- Use a real or mock MCP server
- Test end-to-end workflows
- Verify safety workflow enforcement
- Test error recovery

```typescript
describe('Sprint Cycle Workflow (Integration)', () => {
  it('should create complete sprint with proposals', async () => {
    const sdk = await createTestSdk();
    const workflow = new SprintCycleWorkflow(sdk);

    const proposal = await workflow.planSprint({
      teamId: 'test-team',
      name: 'Sprint 2026-W02',
      startDate: new Date('2026-01-06'),
      endDate: new Date('2026-01-20'),
      milestone: 'M1',
      tasks: [
        { name: 'Task 1', priority: 'High' },
        { name: 'Task 2', priority: 'Medium' },
      ],
    });

    expect(proposal.project).toBeDefined();
    expect(proposal.tasks).toHaveLength(2);
    expect(proposal.meetings).toHaveLength(3);
  });
});
```

## Documentation

### API Documentation

- All public APIs must have JSDoc comments
- Include `@param`, `@returns`, `@throws` tags
- Provide code examples in JSDoc
- Document edge cases and limitations

### README Updates

When adding new features:

1. Update the relevant section in README.md
2. Add example code
3. Update the API Reference section
4. Add to the Quick Start if it's a core feature

### Example Scripts

Add example scripts to `examples/` directory:

- Use descriptive filenames (e.g., `create-sprint.ts`)
- Include comments explaining each step
- Show error handling
- Demonstrate best practices

## Pull Request Process

### Before Submitting

1. ✅ All tests pass (`pnpm test`)
2. ✅ No linting errors (`pnpm lint`)
3. ✅ Code is formatted (`pnpm format`)
4. ✅ All commits follow convention
5. ✅ Documentation is updated
6. ✅ Branch is up to date with main

### Creating the PR

1. **Push your branch**

   ```bash
   git push origin feature/your-feature-name
   ```

2. **Open a Pull Request**

   Go to the repository and click "New Pull Request"

3. **Fill in the PR template**
   - Clear title following commit convention
   - Description of changes
   - Related issues
   - Testing performed
   - Screenshots (if UI changes)

4. **Request review**

   Tag maintainers for review

### PR Template

```markdown
## Description

Brief description of the changes in this PR.

## Related Issues

Closes #123
Related to #456

## Type of Change

- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Testing

Describe the testing you've performed:

- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing performed

## Checklist

- [ ] My code follows the project's coding standards
- [ ] I have performed a self-review of my own code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes
- [ ] Any dependent changes have been merged and published
```

### Review Process

- Maintainers will review within 1-3 business days
- Address feedback in new commits (don't force push)
- Squash commits before merge if requested
- Ensure CI checks pass

## Release Process

Releases are managed by maintainers:

1. Version bump following [Semantic Versioning](https://semver.org/)
2. Update CHANGELOG.md
3. Create git tag
4. Publish to npm
5. Create GitHub release

### Version Numbers

- **Major (X.0.0)**: Breaking changes
- **Minor (0.X.0)**: New features, backwards compatible
- **Patch (0.0.X)**: Bug fixes, backwards compatible

## Questions?

If you have questions:

- 💬 [GitHub Discussions](https://github.com/DigitalHerencia/Notionista/discussions)
- 🐛 [GitHub Issues](https://github.com/DigitalHerencia/Notionista/issues)

Thank you for contributing to Notionista SDK! 🎉
