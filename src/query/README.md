# Query Builder

Fluent API for constructing type-safe Notion database queries with filters, sorts, and pagination.

## Features

- ✅ Fluent API for building queries
- ✅ All Notion filter operators supported
- ✅ Compound filters (AND/OR) supported
- ✅ Pagination with cursors
- ✅ Convenience methods for common patterns
- ✅ Type-safe where possible
- ✅ Ergonomic API design

## Basic Usage

```typescript
import { QueryBuilder } from './query';

// Create a simple query
const query = new QueryBuilder()
  .where('status', 'select', 'equals', 'Active')
  .where('priority', 'select', 'equals', 'High')
  .orderBy('due', 'ascending')
  .limit(50)
  .build();
```

## API Reference

### QueryBuilder

The main query builder class providing a fluent API for constructing queries.

#### Methods

##### `where(property, type, operator, value?)`

Add a property filter condition.

**Parameters:**
- `property` (string): The property name to filter on
- `type` (PropertyType): The property type (title, select, number, checkbox, etc.)
- `operator` (string): The filter operator (equals, contains, is_empty, etc.)
- `value` (FilterValue, optional): The value to filter by

**Returns:** `this` for chaining

**Examples:**

```typescript
// Select property
builder.where('status', 'select', 'equals', 'Active')

// Checkbox property
builder.where('done', 'checkbox', 'equals', false)

// Title/text property
builder.where('name', 'title', 'contains', 'Project')

// Number property
builder.where('count', 'number', 'greater_than', 5)

// Date property
builder.where('due', 'date', 'after', '2025-01-01')

// Empty check (no value needed)
builder.where('description', 'rich_text', 'is_empty')
```

##### `and(callback)`

Add a compound AND filter. All conditions inside the callback must be true.

**Parameters:**
- `callback` (function): Function that receives a QueryBuilder to build conditions

**Returns:** `this` for chaining

**Example:**

```typescript
builder.and(qb => {
  qb.where('status', 'select', 'equals', 'Active')
    .where('milestone', 'select', 'equals', 'M2')
})
```

##### `or(callback)`

Add a compound OR filter. At least one condition inside the callback must be true.

**Parameters:**
- `callback` (function): Function that receives a QueryBuilder to build conditions

**Returns:** `this` for chaining

**Example:**

```typescript
builder.or(qb => {
  qb.where('priority', 'select', 'equals', 'High')
    .where('priority', 'select', 'equals', 'Critical')
})
```

##### `orderBy(property, direction?)`

Add a sort condition by property.

**Parameters:**
- `property` (string): The property name to sort by
- `direction` (SortDirection, optional): 'ascending' or 'descending', defaults to 'ascending'

**Returns:** `this` for chaining

**Example:**

```typescript
builder.orderBy('due', 'ascending')
builder.orderBy('priority', 'descending')
```

##### `orderByTimestamp(timestamp, direction?)`

Add a sort condition by timestamp.

**Parameters:**
- `timestamp` ('created_time' | 'last_edited_time'): The timestamp type
- `direction` (SortDirection, optional): 'ascending' or 'descending', defaults to 'ascending'

**Returns:** `this` for chaining

**Example:**

```typescript
builder.orderByTimestamp('created_time', 'descending')
builder.orderByTimestamp('last_edited_time', 'ascending')
```

##### `limit(size)`

Set the page size limit (max 100).

**Parameters:**
- `size` (number): Number of results to return

**Returns:** `this` for chaining

**Example:**

```typescript
builder.limit(50)
```

##### `startAfter(cursor)`

Set the pagination cursor.

**Parameters:**
- `cursor` (string): The start cursor from a previous query result

**Returns:** `this` for chaining

**Example:**

```typescript
builder.startAfter('abc123...')
```

##### `build()`

Build the final query parameters object.

**Returns:** `QueryParams` object ready for Notion API

**Example:**

```typescript
const params = builder.build();
// Use with Notion API or MCP client
```

##### `reset()`

Reset the builder to start a new query.

**Returns:** `this` for chaining

## Property Types

The following property types are supported:

- `title` - Title property (text)
- `rich_text` - Rich text property
- `number` - Number property
- `checkbox` - Checkbox property
- `select` - Select property (single select)
- `multi_select` - Multi-select property
- `date` - Date property
- `people` - People property
- `files` - Files property
- `relation` - Relation property
- `status` - Status property

## Filter Operators

### Text Properties (title, rich_text)

- `equals` - Exact match
- `does_not_equal` - Not equal
- `contains` - Contains substring
- `does_not_contain` - Does not contain substring
- `starts_with` - Starts with substring
- `ends_with` - Ends with substring
- `is_empty` - Is empty (no value needed)
- `is_not_empty` - Is not empty (no value needed)

### Number Properties

- `equals` - Equal to
- `does_not_equal` - Not equal to
- `greater_than` - Greater than
- `less_than` - Less than
- `greater_than_or_equal_to` - Greater than or equal to
- `less_than_or_equal_to` - Less than or equal to
- `is_empty` - Is empty (no value needed)
- `is_not_empty` - Is not empty (no value needed)

### Checkbox Properties

- `equals` - Equal to (true/false)
- `does_not_equal` - Not equal to (true/false)

### Select/Status Properties

- `equals` - Equal to option
- `does_not_equal` - Not equal to option
- `is_empty` - Is empty (no value needed)
- `is_not_empty` - Is not empty (no value needed)

### Multi-select Properties

- `contains` - Contains option
- `does_not_contain` - Does not contain option
- `is_empty` - Is empty (no value needed)
- `is_not_empty` - Is not empty (no value needed)

### Date Properties

- `equals` - Equal to date (ISO 8601)
- `before` - Before date
- `after` - After date
- `on_or_before` - On or before date
- `on_or_after` - On or after date
- `is_empty` - Is empty (no value needed)
- `is_not_empty` - Is not empty (no value needed)
- `past_week` - In the past week (no value needed)
- `past_month` - In the past month (no value needed)
- `past_year` - In the past year (no value needed)
- `next_week` - In the next week (no value needed)
- `next_month` - In the next month (no value needed)
- `next_year` - In the next year (no value needed)

### People/Relation Properties

- `contains` - Contains ID
- `does_not_contain` - Does not contain ID
- `is_empty` - Is empty (no value needed)
- `is_not_empty` - Is not empty (no value needed)

### Files Properties

- `is_empty` - Is empty (no value needed)
- `is_not_empty` - Is not empty (no value needed)

## Complex Query Examples

### Multiple Filters (AND)

```typescript
// Find active, high-priority tasks in M2
const query = new QueryBuilder()
  .where('status', 'select', 'equals', 'Active')
  .where('priority', 'select', 'equals', 'High')
  .where('milestone', 'select', 'equals', 'M2')
  .build();

// Multiple filters are automatically combined with AND
```

### Compound Filters (Nested AND/OR)

```typescript
// Find items that are (Active AND in M2) OR (High Priority)
const query = new QueryBuilder()
  .or(qb => {
    qb.and(inner => {
      inner.where('status', 'select', 'equals', 'Active')
           .where('milestone', 'select', 'equals', 'M2')
    })
    .where('priority', 'select', 'equals', 'High')
  })
  .build();
```

### Date Filtering

```typescript
// Find tasks due this week
const query = new QueryBuilder()
  .where('done', 'checkbox', 'equals', false)
  .where('due', 'date', 'next_week')
  .orderBy('due', 'ascending')
  .build();

// Find tasks created in the past month
const query2 = new QueryBuilder()
  .orderByTimestamp('created_time', 'descending')
  .where('created_time', 'date', 'past_month')
  .build();
```

### Relation Filtering

```typescript
// Find tasks for a specific team
const query = new QueryBuilder()
  .where('team', 'relation', 'contains', 'team-id-123')
  .where('done', 'checkbox', 'equals', false)
  .build();
```

### Pagination

```typescript
// First page
const page1Query = new QueryBuilder()
  .where('status', 'select', 'equals', 'Active')
  .limit(50)
  .build();

// Next page (using cursor from previous result)
const page2Query = new QueryBuilder()
  .where('status', 'select', 'equals', 'Active')
  .limit(50)
  .startAfter(previousResult.next_cursor)
  .build();
```

### Sorting

```typescript
// Sort by multiple properties
const query = new QueryBuilder()
  .where('status', 'select', 'equals', 'Active')
  .orderBy('priority', 'descending')  // First by priority
  .orderBy('due', 'ascending')        // Then by due date
  .orderByTimestamp('created_time', 'descending')  // Then by creation time
  .build();
```

## QueryBuilderHelpers

Convenience methods for common query patterns.

### `incompleteTasks()`

Create a query for incomplete tasks.

```typescript
import { QueryBuilderHelpers } from './query';

const query = QueryBuilderHelpers.incompleteTasks()
  .orderBy('due', 'ascending')
  .build();
```

### `tasksDueSoon(days?)`

Create a query for tasks due within the specified number of days (default: 7).

```typescript
const query = QueryBuilderHelpers.tasksDueSoon(3)
  .orderBy('due', 'ascending')
  .build();
```

### `activeProjects()`

Create a query for active projects.

```typescript
const query = QueryBuilderHelpers.activeProjects()
  .orderBy('startDate', 'descending')
  .build();
```

### `highPriority()`

Create a query for high priority items.

```typescript
const query = QueryBuilderHelpers.highPriority()
  .where('done', 'checkbox', 'equals', false)
  .build();
```

### `byTeam(teamId)`

Create a query for items by team.

```typescript
const query = QueryBuilderHelpers.byTeam('team-id-123')
  .where('status', 'select', 'equals', 'Active')
  .build();
```

### `byMilestone(milestone)`

Create a query for items by milestone.

```typescript
const query = QueryBuilderHelpers.byMilestone('M2')
  .where('status', 'select', 'equals', 'Active')
  .build();
```

## Extending Helpers

You can chain additional conditions to helper queries:

```typescript
// Start with a helper and add more conditions
const query = QueryBuilderHelpers.incompleteTasks()
  .where('priority', 'select', 'equals', 'High')
  .where('milestone', 'select', 'equals', 'M2')
  .orderBy('due', 'ascending')
  .limit(25)
  .build();
```

## Factory Function

Use the `createQueryBuilder()` factory function as an alternative to `new QueryBuilder()`:

```typescript
import { createQueryBuilder } from './query';

const query = createQueryBuilder()
  .where('status', 'select', 'equals', 'Active')
  .build();
```

## Type Safety

The query builder is designed with TypeScript type safety in mind:

- `PropertyType` - Enumeration of supported property types
- `FilterOperator<T>` - Type-safe operators for each property type
- `FilterValue` - Union type for filter values
- `QueryParams` - Complete type definition for Notion API query parameters

## Integration with Notion API

The query builder produces `QueryParams` objects that match the Notion API's database query format:

```typescript
const params = new QueryBuilder()
  .where('status', 'select', 'equals', 'Active')
  .orderBy('due', 'ascending')
  .limit(50)
  .build();

// Result shape:
// {
//   filter: {
//     property: 'status',
//     select: { equals: 'Active' }
//   },
//   sorts: [
//     { property: 'due', direction: 'ascending' }
//   ],
//   page_size: 50
// }
```

## Error Handling

The query builder validates inputs at build time:

- Page size is automatically clamped to 1-100 range
- Multiple filters are automatically wrapped in AND
- Empty compound filters are ignored

## Best Practices

1. **Use helpers for common patterns** - Start with `QueryBuilderHelpers` for frequently used queries
2. **Chain methods** - Take advantage of the fluent API for readable query construction
3. **Reset and reuse** - Use `.reset()` to reuse a builder instance for multiple queries
4. **Type safety** - Always specify the correct property type to avoid runtime errors
5. **Pagination** - Use `limit()` and `startAfter()` for efficient pagination through large result sets

## Examples from Digital Herencia Workspace

### Find Active Projects in Milestone M2

```typescript
const query = new QueryBuilder()
  .where('status', 'select', 'equals', 'Active')
  .where('milestone', 'select', 'equals', 'M2')
  .orderBy('startDate', 'descending')
  .build();
```

### Find High Priority Incomplete Tasks Due This Week

```typescript
const query = new QueryBuilder()
  .where('done', 'checkbox', 'equals', false)
  .where('priority', 'select', 'equals', 'High')
  .where('due', 'date', 'next_week')
  .orderBy('due', 'ascending')
  .build();
```

### Find All Items for Engineering Team in Phase P2.1

```typescript
const query = new QueryBuilder()
  .where('domain', 'select', 'equals', 'ENG')
  .where('phase', 'select', 'equals', 'P2.1')
  .orderByTimestamp('created_time', 'descending')
  .build();
```

### Find Tasks Without Team Assignment

```typescript
const query = new QueryBuilder()
  .where('team', 'relation', 'is_empty')
  .where('done', 'checkbox', 'equals', false)
  .orderBy('priority', 'descending')
  .build();
```

## Related Documentation

- [SPEC.md](../../SPEC.md) - Full architecture documentation
- [Notion API - Database Queries](https://developers.notion.com/reference/post-database-query)
- [Notion API - Filters](https://developers.notion.com/reference/post-database-query-filter)
