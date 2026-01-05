# JSDoc Guidelines for Notionista SDK

This document provides guidelines for writing JSDoc comments in the Notionista SDK codebase. Consistent documentation is essential for good developer experience.

## Table of Contents

- [Why JSDoc?](#why-jsdoc)
- [General Rules](#general-rules)
- [Class Documentation](#class-documentation)
- [Method Documentation](#method-documentation)
- [Type Documentation](#type-documentation)
- [Example Blocks](#example-blocks)
- [Tags Reference](#tags-reference)
- [Best Practices](#best-practices)

## Why JSDoc?

JSDoc provides:
- **IntelliSense**: IDE autocompletion and hover documentation
- **Type Safety**: Runtime type validation with TypeScript
- **Generated Docs**: Can generate HTML documentation
- **Better DX**: Clear API contracts for developers

## General Rules

1. **All public APIs must have JSDoc comments**
   - Classes, interfaces, types
   - Public methods and properties
   - Exported functions and constants

2. **Use complete sentences**
   - Start with a capital letter
   - End with a period
   - Be concise but clear

3. **Provide examples for complex APIs**
   - Show typical usage
   - Include edge cases when relevant
   - Use TypeScript syntax

4. **Keep comments up to date**
   - Update docs when changing code
   - Remove obsolete comments

## Class Documentation

### Basic Class Documentation

```typescript
/**
 * Repository for managing Team entities in Notion.
 * 
 * Provides type-safe CRUD operations with built-in proposal workflow
 * for all mutations. All write operations return ChangeProposal instances
 * that must be approved before execution.
 * 
 * @example
 * ```typescript
 * const teamRepo = new TeamRepository(mcpClient, DATABASE_IDS.TEAMS);
 * const teams = await teamRepo.findMany();
 * ```
 * 
 * @see {@link BaseRepository} for inherited methods
 * @see {@link ChangeProposal} for the mutation workflow
 */
export class TeamRepository extends BaseRepository<Team> {
  // ...
}
```

### Class with Generic Parameters

```typescript
/**
 * Base repository providing common CRUD operations for Notion databases.
 * 
 * This abstract class implements the repository pattern, abstracting MCP tool
 * calls and enforcing the safety workflow for all mutations.
 * 
 * @template TEntity - The domain entity type this repository manages
 * @template TCreateInput - Input type for creating new entities
 * @template TUpdateInput - Input type for updating existing entities
 * 
 * @example
 * ```typescript
 * class TaskRepository extends BaseRepository<Task, CreateTaskInput, UpdateTaskInput> {
 *   // Implement abstract methods
 * }
 * ```
 */
export abstract class BaseRepository<TEntity, TCreateInput, TUpdateInput> {
  // ...
}
```

## Method Documentation

### Query Methods (Read Operations)

```typescript
/**
 * Find all entities matching the given filter criteria.
 * 
 * This method queries the Notion database and transforms results into
 * domain entities. Results can be filtered, sorted, and paginated.
 * 
 * @param filter - Optional filter criteria for querying entities
 * @param filter.where - Property filters (e.g., `{ done: false }`)
 * @param filter.orderBy - Sort configuration
 * @param filter.limit - Maximum number of results to return
 * @returns Promise resolving to an array of entities
 * @throws {NotionApiError} If the Notion API request fails
 * @throws {RepositoryError} If entity transformation fails
 * 
 * @example
 * ```typescript
 * // Find all incomplete tasks
 * const tasks = await repo.findMany({
 *   where: { done: false },
 *   orderBy: { due: 'asc' },
 *   limit: 10,
 * });
 * ```
 * 
 * @example
 * ```typescript
 * // Find high-priority tasks due this week
 * const urgentTasks = await repo.findMany({
 *   where: {
 *     priority: 'High',
 *     due: { onOrBefore: nextWeek },
 *   },
 * });
 * ```
 */
async findMany(filter?: QueryFilter): Promise<TEntity[]> {
  // Implementation
}
```

### Mutation Methods (Write Operations)

```typescript
/**
 * Create a new entity in the database.
 * 
 * This method generates a ChangeProposal without executing the creation.
 * The proposal must be approved and applied to persist the changes.
 * 
 * @param input - Entity data for creation
 * @returns Promise resolving to a ChangeProposal that requires approval
 * @throws {ValidationError} If input validation fails
 * @throws {RepositoryError} If proposal generation fails
 * 
 * @example
 * ```typescript
 * // Create a new task with approval workflow
 * const proposal = await repo.create({
 *   name: 'Update documentation',
 *   priority: 'High',
 *   due: new Date('2026-01-15'),
 * });
 * 
 * // Review the proposal
 * console.log(proposal.formatForReview());
 * 
 * // Approve and apply
 * await proposal.approve();
 * const task = await proposal.apply();
 * ```
 * 
 * @see {@link ChangeProposal} for the proposal workflow
 */
async create(input: TCreateInput): Promise<ChangeProposal<TEntity>> {
  // Implementation
}
```

## Tags Reference

### Common Tags

| Tag | Purpose | Example |
|-----|---------|---------|
| `@param` | Document parameters | `@param name - The task name` |
| `@returns` | Document return value | `@returns Promise resolving to array of tasks` |
| `@throws` | Document exceptions | `@throws {ValidationError} If input is invalid` |
| `@example` | Provide usage examples | `@example ...code...` |
| `@see` | Reference related items | `@see {@link BaseRepository}` |
| `@deprecated` | Mark as deprecated | `@deprecated Use newMethod instead` |
| `@since` | Version introduced | `@since 1.2.0` |
| `@template` | Generic type parameters | `@template T - The entity type` |

## Documentation Checklist

Before committing code, ensure:

- [ ] All public classes have JSDoc comments
- [ ] All public methods have JSDoc comments
- [ ] All parameters are documented with `@param`
- [ ] Return values are documented with `@returns`
- [ ] Exceptions are documented with `@throws`
- [ ] Complex operations have `@example` blocks
- [ ] Examples use valid TypeScript syntax
- [ ] Examples demonstrate typical usage
- [ ] Related items are linked with `@see`
- [ ] Deprecated APIs are marked with `@deprecated`

## Additional Resources

- [JSDoc Official Documentation](https://jsdoc.app/)
- [TypeDoc Documentation](https://typedoc.org/)
- [TSDoc Standard](https://tsdoc.org/)

---

**Remember**: Good documentation is part of the product. Invest time in clear, helpful JSDoc comments!
