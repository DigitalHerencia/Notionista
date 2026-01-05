# Testing Guide for Notionista SDK

This guide explains the testing approach, infrastructure, and best practices for the Notionista SDK.

## Table of Contents

- [Overview](#overview)
- [Test Infrastructure](#test-infrastructure)
- [Testing Strategy](#testing-strategy)
- [Writing Tests](#writing-tests)
- [Running Tests](#running-tests)
- [Coverage Requirements](#coverage-requirements)
- [Best Practices](#best-practices)

## Overview

The Notionista SDK uses **Vitest** as its test framework, providing:
- Fast execution with ES modules support
- TypeScript support out of the box
- Compatible with Jest API
- Built-in coverage reporting
- Watch mode for development

### Test Goals

- **80%+ code coverage** across the codebase
- **All public APIs** have unit tests
- **Critical workflows** have integration tests
- **Error paths** are tested
- **Edge cases** are covered

## Test Infrastructure

### Directory Structure

```
tests/
├── unit/                     # Unit tests (mirror src structure)
│   ├── core/
│   │   ├── types/
│   │   └── errors/
│   ├── mcp/
│   │   ├── client.test.ts
│   │   ├── transport.test.ts
│   │   └── middleware/
│   ├── domain/
│   │   ├── repositories/
│   │   └── entities/
│   ├── safety/
│   │   ├── proposal.test.ts
│   │   └── validator.test.ts
│   └── workflows/
│       └── sprint-cycle.test.ts
├── integration/              # Integration tests
│   ├── end-to-end/
│   │   ├── sprint-workflow.test.ts
│   │   └── task-management.test.ts
│   └── mcp-server/
│       └── real-server.test.ts
├── fixtures/                 # Test data and mocks
│   ├── notion-responses/
│   │   ├── tasks.json
│   │   ├── projects.json
│   │   └── teams.json
│   ├── mcp-responses/
│   │   ├── query-success.json
│   │   └── create-success.json
│   └── mocks/
│       ├── mcp-client.mock.ts
│       └── notion-pages.mock.ts
└── helpers/                  # Test utilities
    ├── setup.ts
    ├── teardown.ts
    └── test-sdk.ts
```

### Vitest Configuration

Create `vitest.config.ts` in the project root:

```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./tests/helpers/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.test.ts',
        '**/*.spec.ts',
        '**/index.ts',
        'examples/',
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 75,
        statements: 80,
      },
    },
    testTimeout: 10000,
    hookTimeout: 10000,
  },
});
```

## Testing Strategy

### Unit Tests

Test individual components in isolation:

- **MCP Client**: Mock the stdio transport
- **Repositories**: Mock the MCP client
- **Safety Layer**: Mock repositories
- **Workflows**: Mock domain services

### Integration Tests

Test components working together:

- **Repository + MCP Client**: Use real MCP server (or mock server)
- **Workflow + Repositories**: Test full workflow execution
- **End-to-End**: Test complete user scenarios

### Test Doubles

Use appropriate test doubles:

- **Mocks**: For MCP client, repositories
- **Stubs**: For date/time, random IDs
- **Fakes**: For in-memory storage
- **Spies**: For verifying method calls

## Writing Tests

### Basic Test Structure

```typescript
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TaskRepository } from '../../../src/domain/repositories/task.repository';
import { mockMcpClient } from '../../fixtures/mocks/mcp-client.mock';
import { DATABASE_IDS } from '../../../src/core/constants';

describe('TaskRepository', () => {
  let taskRepo: TaskRepository;
  let mockClient: ReturnType<typeof mockMcpClient>;

  beforeEach(() => {
    mockClient = mockMcpClient();
    taskRepo = new TaskRepository(mockClient, DATABASE_IDS.TASKS);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('findMany', () => {
    it('should return all tasks when no filter provided', async () => {
      // Arrange
      const mockTasks = [
        { id: '1', name: 'Task 1', done: false },
        { id: '2', name: 'Task 2', done: true },
      ];
      mockClient.queryDataSource.mockResolvedValue({ results: mockTasks });

      // Act
      const tasks = await taskRepo.findMany();

      // Assert
      expect(tasks).toHaveLength(2);
      expect(mockClient.queryDataSource).toHaveBeenCalledWith({
        database_id: DATABASE_IDS.TASKS,
      });
    });

    it('should filter incomplete tasks', async () => {
      // Arrange
      const mockTasks = [
        { id: '1', name: 'Task 1', done: false },
      ];
      mockClient.queryDataSource.mockResolvedValue({ results: mockTasks });

      // Act
      const tasks = await taskRepo.findMany({ where: { done: false } });

      // Assert
      expect(tasks).toHaveLength(1);
      expect(tasks[0].done).toBe(false);
      expect(mockClient.queryDataSource).toHaveBeenCalledWith(
        expect.objectContaining({
          filter: expect.objectContaining({
            property: 'done',
            checkbox: { equals: false },
          }),
        })
      );
    });

    it('should throw RepositoryError on MCP client failure', async () => {
      // Arrange
      mockClient.queryDataSource.mockRejectedValue(new Error('API error'));

      // Act & Assert
      await expect(taskRepo.findMany()).rejects.toThrow(RepositoryError);
    });
  });

  describe('create', () => {
    it('should return a ChangeProposal without executing', async () => {
      // Arrange
      const input = { name: 'New task', priority: 'High' };

      // Act
      const proposal = await taskRepo.create(input);

      // Assert
      expect(proposal.status).toBe('pending');
      expect(proposal.proposedState.name).toBe('New task');
      expect(mockClient.createPage).not.toHaveBeenCalled();
    });

    it('should validate input before creating proposal', async () => {
      // Arrange
      const invalidInput = { name: '' }; // Empty name

      // Act & Assert
      await expect(taskRepo.create(invalidInput)).rejects.toThrow(ValidationError);
    });
  });
});
```

### Mocking the MCP Client

Create `tests/fixtures/mocks/mcp-client.mock.ts`:

```typescript
import { vi } from 'vitest';
import type { McpClient } from '../../../src/mcp/client';

export function mockMcpClient(): jest.Mocked<McpClient> {
  return {
    connect: vi.fn().mockResolvedValue(undefined),
    disconnect: vi.fn().mockResolvedValue(undefined),
    callTool: vi.fn(),
    
    // Tool wrappers
    queryDataSource: vi.fn(),
    retrieveDataSource: vi.fn(),
    createPage: vi.fn(),
    updatePage: vi.fn(),
    retrievePage: vi.fn(),
    searchPages: vi.fn(),
    getBlockChildren: vi.fn(),
    appendBlocks: vi.fn(),
    
    // State
    isConnected: true,
  } as any;
}
```

### Testing Async Operations

```typescript
it('should handle async operations correctly', async () => {
  // Using async/await
  const result = await taskRepo.findById('task-1');
  expect(result).toBeDefined();
});

it('should handle promise rejection', async () => {
  mockClient.retrievePage.mockRejectedValue(new NotionApiError('Not found'));
  
  await expect(taskRepo.findById('invalid-id')).rejects.toThrow(NotionApiError);
});
```

### Testing Timeouts

```typescript
it('should timeout after 5 seconds', async () => {
  mockClient.queryDataSource.mockImplementation(
    () => new Promise((resolve) => setTimeout(resolve, 10000))
  );

  await expect(taskRepo.findMany()).rejects.toThrow(TimeoutError);
}, 6000); // Test timeout of 6 seconds
```

### Snapshot Testing

```typescript
it('should format proposal correctly', () => {
  const proposal = createTestProposal({
    type: 'create',
    proposedState: { name: 'Test task', priority: 'High' },
  });

  const formatted = proposal.formatForReview();
  expect(formatted).toMatchSnapshot();
});
```

### Parameterized Tests

```typescript
describe.each([
  { priority: 'High', expected: 1 },
  { priority: 'Medium', expected: 2 },
  { priority: 'Low', expected: 3 },
])('priority filtering', ({ priority, expected }) => {
  it(`should filter ${priority} priority tasks`, async () => {
    const tasks = await taskRepo.findMany({ where: { priority } });
    expect(tasks).toHaveLength(expected);
  });
});
```

## Running Tests

### Commands

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage

# Run only unit tests
pnpm test:unit

# Run only integration tests
pnpm test:integration

# Run a specific test file
pnpm test task.repository.test.ts

# Run tests matching a pattern
pnpm test --grep "TaskRepository"
```

### CI/CD Integration

Tests run automatically on:
- Every push to feature branches
- Pull requests
- Main branch commits

See `.github/workflows/test.yml` for CI configuration.

## Coverage Requirements

### Thresholds

- **Lines**: 80%
- **Branches**: 75%
- **Functions**: 80%
- **Statements**: 80%

### What to Test

**Must Test:**
- All public methods
- Error handling paths
- Edge cases
- Boundary conditions
- Async operations

**Can Skip:**
- Private helper methods (test via public methods)
- Type definitions
- Simple getters/setters
- Third-party library wrappers

### Viewing Coverage

```bash
# Generate coverage report
pnpm test:coverage

# Open HTML report in browser
open coverage/index.html
```

## Best Practices

### Test Organization

1. **One describe per class/module**
2. **Nested describes for methods**
3. **Group related tests**
4. **Use clear test names**

```typescript
describe('TaskRepository', () => {
  describe('findMany', () => {
    it('should return all tasks when no filter provided', () => {});
    it('should filter by done status', () => {});
    it('should filter by priority', () => {});
  });

  describe('create', () => {
    it('should create a valid proposal', () => {});
    it('should validate input', () => {});
  });
});
```

### Test Naming

Use descriptive names that explain:
- **What** is being tested
- **Under what conditions**
- **What the expected outcome is**

```typescript
// ✅ Good
it('should return null when task ID does not exist', () => {});
it('should throw ValidationError when name is empty', () => {});
it('should create proposal without executing when input is valid', () => {});

// ❌ Bad
it('works', () => {});
it('test findById', () => {});
it('should not fail', () => {});
```

### Setup and Teardown

```typescript
describe('TaskRepository', () => {
  let taskRepo: TaskRepository;
  let mockClient: MockedMcpClient;

  // Run before each test
  beforeEach(() => {
    mockClient = mockMcpClient();
    taskRepo = new TaskRepository(mockClient, DATABASE_IDS.TASKS);
  });

  // Run after each test
  afterEach(() => {
    vi.clearAllMocks();
  });

  // Run once before all tests
  beforeAll(() => {
    // Set up test database
  });

  // Run once after all tests
  afterAll(() => {
    // Clean up test database
  });
});
```

### Assertions

```typescript
// Use specific assertions
expect(result).toBeDefined();
expect(result).not.toBeNull();
expect(result).toHaveLength(5);
expect(result).toEqual({ name: 'Task' });
expect(result).toMatchObject({ name: 'Task' });
expect(mockClient.createPage).toHaveBeenCalledTimes(1);
expect(mockClient.createPage).toHaveBeenCalledWith(expect.objectContaining({
  database_id: DATABASE_IDS.TASKS,
}));

// Async assertions
await expect(promise).resolves.toBe(value);
await expect(promise).rejects.toThrow(Error);
```

### Test Independence

Each test should be independent:

```typescript
// ✅ Good - tests are independent
it('test 1', () => {
  const data = createTestData();
  const result = process(data);
  expect(result).toBe(expected);
});

it('test 2', () => {
  const data = createTestData();
  const result = process(data);
  expect(result).toBe(expected);
});

// ❌ Bad - tests share state
let sharedData;

it('test 1', () => {
  sharedData = createTestData();
  expect(sharedData).toBeDefined();
});

it('test 2', () => {
  // Relies on test 1 running first
  expect(sharedData).toBeDefined();
});
```

## Troubleshooting

### Tests Hanging

```typescript
// Ensure all promises resolve
it('should complete', async () => {
  await taskRepo.findMany(); // Don't forget await!
});

// Set test timeout
it('should complete quickly', async () => {
  // test code
}, 5000); // 5 second timeout
```

### Mock Not Working

```typescript
// Clear mocks between tests
afterEach(() => {
  vi.clearAllMocks();
});

// Verify mock was called
expect(mockClient.queryDataSource).toHaveBeenCalled();

// Check mock implementation
console.log(mockClient.queryDataSource.mock.calls);
```

### Coverage Not Meeting Threshold

```bash
# See which files have low coverage
pnpm test:coverage

# Add tests for uncovered lines
# View HTML report to see specific lines
```

## Additional Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Best Practices](https://testingjavascript.com/)
- [Jest API Reference](https://jestjs.io/docs/api)

---

**Remember**: Good tests are as important as good code. Invest in comprehensive test coverage!
