import type {
  Filter,
  PropertyFilter,
  CompoundFilter,
  Sort,
  SortDirection,
  QueryParams,
  TextFilter,
  NumberFilter,
  CheckboxFilter,
  SelectFilter,
  MultiSelectFilter,
  DateFilter,
  PeopleFilter,
  FilesFilter,
  RelationFilter,
  StatusFilter,
} from "../core/types/notion-filters";

/**
 * Property type discriminator
 */
export type PropertyType =
  | "title"
  | "rich_text"
  | "number"
  | "checkbox"
  | "select"
  | "multi_select"
  | "date"
  | "people"
  | "files"
  | "relation"
  | "status";

/**
 * Operator types for each property type
 */
export type FilterOperator<T extends PropertyType = PropertyType> =
  T extends "title" | "rich_text"
    ? keyof TextFilter
    : T extends "number"
      ? keyof NumberFilter
      : T extends "checkbox"
        ? keyof CheckboxFilter
        : T extends "select" | "status"
          ? keyof SelectFilter
          : T extends "multi_select"
            ? keyof MultiSelectFilter
            : T extends "date"
              ? keyof DateFilter
              : T extends "people"
                ? keyof PeopleFilter
                : T extends "files"
                  ? keyof FilesFilter
                  : T extends "relation"
                    ? keyof RelationFilter
                    : never;

/**
 * Value type for each operator
 */
export type FilterValue = string | number | boolean | Record<string, never>;

/**
 * Fluent query builder for Notion database queries
 * 
 * @example
 * ```typescript
 * const query = new QueryBuilder()
 *   .where('status', 'select', 'equals', 'Active')
 *   .where('priority', 'select', 'equals', 'High')
 *   .orderBy('due', 'ascending')
 *   .limit(50)
 *   .build();
 * ```
 */
export class QueryBuilder {
  private filters: Filter[] = [];
  private sortConditions: Sort[] = [];
  private pageSize?: number;
  private startCursor?: string;

  /**
   * Add a property filter condition
   * 
   * @param property - The property name to filter on
   * @param type - The property type (title, select, number, etc.)
   * @param operator - The filter operator (equals, contains, etc.)
   * @param value - The value to filter by (optional for operators like is_empty)
   * @returns This query builder for chaining
   * 
   * @example
   * ```typescript
   * builder.where('status', 'select', 'equals', 'Active')
   * builder.where('done', 'checkbox', 'equals', false)
   * builder.where('name', 'title', 'contains', 'Project')
   * ```
   */
  where(
    property: string,
    type: PropertyType,
    operator: string,
    value?: FilterValue
  ): this {
    const filter: PropertyFilter = {
      property,
      [type]: {
        [operator]: value ?? true,
      },
    };
    this.filters.push(filter);
    return this;
  }

  /**
   * Add a compound AND filter
   * 
   * @param callback - Function that builds the AND conditions
   * @returns This query builder for chaining
   * 
   * @example
   * ```typescript
   * builder.and(qb => {
   *   qb.where('status', 'select', 'equals', 'Active')
   *     .where('priority', 'select', 'equals', 'High')
   * })
   * ```
   */
  and(callback: (builder: QueryBuilder) => void): this {
    const subBuilder = new QueryBuilder();
    callback(subBuilder);
    const subFilters = subBuilder.getFilters();
    
    if (subFilters.length > 0) {
      const andFilter: CompoundFilter = {
        and: subFilters,
      };
      this.filters.push(andFilter);
    }
    
    return this;
  }

  /**
   * Add a compound OR filter
   * 
   * @param callback - Function that builds the OR conditions
   * @returns This query builder for chaining
   * 
   * @example
   * ```typescript
   * builder.or(qb => {
   *   qb.where('priority', 'select', 'equals', 'High')
   *     .where('priority', 'select', 'equals', 'Critical')
   * })
   * ```
   */
  or(callback: (builder: QueryBuilder) => void): this {
    const subBuilder = new QueryBuilder();
    callback(subBuilder);
    const subFilters = subBuilder.getFilters();
    
    if (subFilters.length > 0) {
      const orFilter: CompoundFilter = {
        or: subFilters,
      };
      this.filters.push(orFilter);
    }
    
    return this;
  }

  /**
   * Add a sort condition by property
   * 
   * @param property - The property name to sort by
   * @param direction - Sort direction (ascending or descending), defaults to ascending
   * @returns This query builder for chaining
   * 
   * @example
   * ```typescript
   * builder.orderBy('due', 'ascending')
   * builder.orderBy('priority', 'descending')
   * ```
   */
  orderBy(property: string, direction: SortDirection = "ascending"): this {
    this.sortConditions.push({
      property,
      direction,
    });
    return this;
  }

  /**
   * Add a sort condition by timestamp
   * 
   * @param timestamp - The timestamp type (created_time or last_edited_time)
   * @param direction - Sort direction (ascending or descending), defaults to ascending
   * @returns This query builder for chaining
   * 
   * @example
   * ```typescript
   * builder.orderByTimestamp('created_time', 'descending')
   * builder.orderByTimestamp('last_edited_time', 'ascending')
   * ```
   */
  orderByTimestamp(
    timestamp: "created_time" | "last_edited_time",
    direction: SortDirection = "ascending"
  ): this {
    this.sortConditions.push({
      timestamp,
      direction,
    });
    return this;
  }

  /**
   * Set the page size limit
   * 
   * @param size - Number of results to return (max 100)
   * @returns This query builder for chaining
   * 
   * @example
   * ```typescript
   * builder.limit(50)
   * ```
   */
  limit(size: number): this {
    this.pageSize = Math.min(Math.max(1, size), 100);
    return this;
  }

  /**
   * Set the pagination cursor
   * 
   * @param cursor - The start cursor for pagination
   * @returns This query builder for chaining
   * 
   * @example
   * ```typescript
   * builder.startAfter('abc123...')
   * ```
   */
  startAfter(cursor: string): this {
    this.startCursor = cursor;
    return this;
  }

  /**
   * Get the current filters (internal use)
   */
  private getFilters(): Filter[] {
    return this.filters;
  }

  /**
   * Build the final query parameters object
   * 
   * @returns QueryParams object ready for Notion API
   * 
   * @example
   * ```typescript
   * const params = builder.build();
   * // Use with Notion API or MCP client
   * ```
   */
  build(): QueryParams {
    const params: QueryParams = {};

    // Build filter - wrap multiple filters in AND
    if (this.filters.length === 1) {
      params.filter = this.filters[0];
    } else if (this.filters.length > 1) {
      params.filter = {
        and: this.filters,
      };
    }

    // Add sorts if present
    if (this.sortConditions.length > 0) {
      params.sorts = this.sortConditions;
    }

    // Add pagination
    if (this.pageSize !== undefined) {
      params.page_size = this.pageSize;
    }
    if (this.startCursor !== undefined) {
      params.start_cursor = this.startCursor;
    }

    return params;
  }

  /**
   * Reset the builder to start a new query
   * 
   * @returns This query builder for chaining
   */
  reset(): this {
    this.filters = [];
    this.sortConditions = [];
    this.pageSize = undefined;
    this.startCursor = undefined;
    return this;
  }
}

/**
 * Convenience methods for common query patterns
 */
export class QueryBuilderHelpers {
  /**
   * Create a query for incomplete tasks
   * 
   * @example
   * ```typescript
   * const query = QueryBuilderHelpers.incompleteTasks();
   * ```
   */
  static incompleteTasks(): QueryBuilder {
    return new QueryBuilder()
      .where("done", "checkbox", "equals", false);
  }

  /**
   * Create a query for tasks due soon (within specified days)
   * 
   * @param days - Number of days from now, defaults to 7
   * 
   * @example
   * ```typescript
   * const query = QueryBuilderHelpers.tasksDueSoon(3);
   * ```
   */
  static tasksDueSoon(days = 7): QueryBuilder {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);
    
    return new QueryBuilder()
      .where("done", "checkbox", "equals", false)
      .where("due", "date", "on_or_before", futureDate.toISOString());
  }

  /**
   * Create a query for active projects
   * 
   * @example
   * ```typescript
   * const query = QueryBuilderHelpers.activeProjects();
   * ```
   */
  static activeProjects(): QueryBuilder {
    return new QueryBuilder()
      .where("status", "select", "equals", "Active");
  }

  /**
   * Create a query for high priority items
   * 
   * @example
   * ```typescript
   * const query = QueryBuilderHelpers.highPriority();
   * ```
   */
  static highPriority(): QueryBuilder {
    return new QueryBuilder()
      .where("priority", "select", "equals", "High");
  }

  /**
   * Create a query for items by team
   * 
   * @param teamId - The team relation ID
   * 
   * @example
   * ```typescript
   * const query = QueryBuilderHelpers.byTeam('team-id-123');
   * ```
   */
  static byTeam(teamId: string): QueryBuilder {
    return new QueryBuilder()
      .where("team", "relation", "contains", teamId);
  }

  /**
   * Create a query for items by milestone
   * 
   * @param milestone - The milestone value (M1, M2, M3)
   * 
   * @example
   * ```typescript
   * const query = QueryBuilderHelpers.byMilestone('M2');
   * ```
   */
  static byMilestone(milestone: string): QueryBuilder {
    return new QueryBuilder()
      .where("milestone", "select", "equals", milestone);
  }
}

/**
 * Create a new query builder instance
 * 
 * @returns New QueryBuilder instance
 * 
 * @example
 * ```typescript
 * import { createQueryBuilder } from './query';
 * 
 * const query = createQueryBuilder()
 *   .where('status', 'select', 'equals', 'Active')
 *   .build();
 * ```
 */
export function createQueryBuilder(): QueryBuilder {
  return new QueryBuilder();
}
