# Run 05: Natural Language Workflows

**Date**: 2026-01-07  
**Issue**: [#21 - Natural Language Workflows](https://github.com/DigitalHerencia/Notionista/issues/21)  
**PR**: `feat/nl-workflows`  
**Status**: ✅ Completed

## Objective

Define explicit workflow definitions that map common natural-language intents into structured query → proposal → verification steps. These are pure data structures that do NOT execute MCP calls.

## What Was Done

### 1. Created Workflow Definitions Directory

Created `src/workflows/definitions/` to house all declarative workflow definitions.

### 2. Defined Core Types (`types.ts`)

Implemented the foundational interfaces:

- `WorkflowStep` - Represents a single step in a workflow with phases (query, analysis, proposal)
- `WorkflowVerification` - Defines verification requirements and checks
- `WorkflowDefinition` - Complete workflow definition with ID, name, triggers, steps, and metadata

Key design decisions:
- Steps are pure data structures with references to MCP tools and functions
- Phases clearly separate query, analysis (pure functions), and proposal generation
- Output variables allow step results to be referenced in subsequent steps
- Metadata enables categorization and discovery

### 3. Implemented Four Workflow Definitions

#### Daily Audit Workflow (`daily-audit.ts`)

Maps natural language triggers like "audit progress" or "daily audit" to:
- Query all teams, tasks updated today, active tasks, and overdue tasks
- Calculate team metrics using pure functions
- Generate comprehensive audit report

**Triggers**: audit progress, daily audit, check team status, show team progress, generate daily report, audit today

**Steps**: 6 steps (4 query, 2 analysis)

#### Task Completion Verification Workflow (`task-completion-verification.ts`)

Maps triggers like "verify task completion" to:
- Query recently completed tasks, active projects, and teams
- Verify task-project and task-team relationships
- Validate data integrity
- Generate verification report highlighting issues

**Triggers**: verify task completion, check completed tasks, validate task status, audit completed tasks, verify task done status, check task completion

**Steps**: 7 steps (3 query, 4 analysis)

#### Meeting Notes Update Workflow (`meeting-notes-update.ts`)

Maps triggers like "update meeting notes" to:
- Query meeting and related tasks
- Extract and match action items
- Generate proposals to update meeting page
- Link tasks to meeting bidirectionally

**Triggers**: update meeting notes, add action items, record meeting outcomes, update meeting, add meeting action items, link tasks to meeting

**Steps**: 7 steps (2 query, 2 analysis, 3 proposal)

#### Project Progress Review Workflow (`project-progress-review.ts`)

Maps triggers like "review project progress" to:
- Query active projects, tasks, and teams
- Calculate completion rates and time metrics
- Identify at-risk projects
- Generate comprehensive progress report

**Triggers**: review project progress, check sprint status, milestone progress, sprint progress, project status report, check project health

**Steps**: 9 steps (3 query, 6 analysis)

### 4. Created Workflow Registry (`index.ts`)

Implemented utility functions for workflow discovery:

- `workflowRegistry` - Central registry of all workflows
- `getWorkflowById()` - Retrieve workflow by ID
- `findWorkflowByTrigger()` - Match natural language to workflows
- `getAllWorkflows()` - Get complete list
- `getWorkflowsByCategory()` - Filter by category
- `getWorkflowsByTag()` - Filter by tags

### 5. Comprehensive Test Suite (`__tests__/definitions.test.ts`)

Created 37 test cases covering:
- Structure validation for all workflows
- Step validation (phase, description, tool references)
- Metadata validation
- Individual workflow verification
- Registry functionality
- Trigger matching (case-insensitive, partial matching)
- Category and tag filtering
- Pure data structure verification (JSON serializable, no executable code)

**Test Results**: ✅ All 37 tests passing

### 6. Updated Exports

Modified `src/workflows/index.ts` to export all workflow definitions.

## Key Features

### Pure Data Structures

All workflows are declarative data structures with:
- No executable code
- Only references to MCP tools and pure functions
- Fully JSON serializable
- Can be inspected, validated, and transformed

### Natural Language Triggers

Each workflow defines multiple natural language patterns:
- Case-insensitive matching
- Partial phrase matching
- Multiple trigger variations for user flexibility

### Three-Phase Pattern

Workflows follow Query → Analysis → Proposal pattern:
- **Query**: Fetch data using MCP tools (`query-data-source`)
- **Analysis**: Process data with pure functions
- **Proposal**: Generate change proposals for user approval

### Verification Requirements

Each workflow defines:
- Description of what should be verified
- Specific checks to perform
- Clear success criteria

### Rich Metadata

Workflows include:
- Category classification (reporting, validation, meeting-management, project-management)
- Tags for discovery
- Version tracking
- Author attribution

## Files Created

- `src/workflows/definitions/types.ts` - Core type definitions
- `src/workflows/definitions/daily-audit.ts` - Daily audit workflow
- `src/workflows/definitions/task-completion-verification.ts` - Task verification workflow
- `src/workflows/definitions/meeting-notes-update.ts` - Meeting notes workflow
- `src/workflows/definitions/project-progress-review.ts` - Project progress workflow
- `src/workflows/definitions/index.ts` - Registry and utilities
- `src/workflows/__tests__/definitions.test.ts` - Comprehensive test suite
- `docs/runs/05-nl-workflows.md` - This documentation

## Files Modified

- `src/workflows/index.ts` - Added export for workflow definitions

## Testing

```bash
npm run test -- src/workflows/__tests__/definitions.test.ts
```

Results: ✅ 37 tests passing in 19ms

## Validation

- [x] Daily audit workflow defined
- [x] Task completion verification workflow defined
- [x] Meeting notes update workflow defined
- [x] Project progress review workflow defined
- [x] All workflows are pure data structures
- [x] No MCP calls executed
- [x] Comprehensive test coverage
- [x] All tests passing
- [x] No linting errors in new files
- [x] TypeScript compilation successful

## Usage Example

```typescript
import { 
  findWorkflowByTrigger, 
  getWorkflowById 
} from 'notionista/workflows';

// Find workflow by natural language
const workflow = findWorkflowByTrigger('audit progress');

if (workflow) {
  console.log(`Found workflow: ${workflow.name}`);
  console.log(`Steps: ${workflow.steps.length}`);
  
  // Inspect steps
  for (const step of workflow.steps) {
    console.log(`${step.phase}: ${step.description}`);
  }
  
  // Check verification requirements
  console.log('Verification:', workflow.verification.description);
}

// Get specific workflow
const dailyAudit = getWorkflowById('daily-audit');
```

## Architecture Integration

These workflow definitions integrate with the existing architecture:

```
┌─────────────────────────────────────────┐
│      Natural Language Interface          │
│   (Copilot, CLI, User Input)            │
└─────────────┬───────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│      Workflow Registry                   │
│   (Match triggers, select workflow)     │
└─────────────┬───────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│      Workflow Definition                 │
│   (Pure data: steps, verification)      │
└─────────────┬───────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│      Execution Engine (Future)           │
│   (Execute steps via MCP)               │
└─────────────────────────────────────────┘
```

## Design Principles Followed

1. **Declarative over Imperative** - Workflows describe WHAT to do, not HOW
2. **Separation of Concerns** - Definition separate from execution
3. **Pure Data Structures** - No side effects, fully serializable
4. **Extensibility** - Easy to add new workflows
5. **Discoverability** - Natural language triggers and metadata
6. **Testability** - Pure data is easy to test
7. **Documentation** - Rich metadata and clear descriptions

## Next Steps (Future Work)

1. **Execution Engine** - Build runtime that executes workflow definitions
2. **Parameter Binding** - Dynamic parameter injection from context
3. **Workflow Composition** - Combine workflows into higher-level flows
4. **Validation** - Runtime validation of workflow structure
5. **VS Code Integration** - Copilot integration for natural language workflow invocation
6. **Workflow Versioning** - Support for multiple versions of same workflow
7. **Workflow Debugging** - Tools to inspect and debug workflow execution

## Dependencies

- Issue #20 (Declarative Proposals) - ✅ Completed
- Existing domain repositories and schemas
- MCP client interface definitions

## Related Documentation

- [Core Concepts](../core-concepts.md)
- [API Reference](../api-reference.md)
- [Run 04: Declarative Proposals](./04-declarative-proposals.md)
- [Issue #21: Natural Language Workflows](https://github.com/DigitalHerencia/Notionista/issues/21)

## Conclusion

Successfully implemented natural language workflow definitions as pure data structures. All four required workflows are defined, tested, and ready for integration with future execution engines. The declarative approach ensures these definitions can be:

- Analyzed and validated without execution
- Transformed and composed
- Serialized for storage or transmission
- Used by multiple execution engines
- Easily extended with new workflows

The implementation follows best practices for type safety, testability, and maintainability.
