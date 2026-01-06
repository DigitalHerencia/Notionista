/**
 * Query Builder Module
 *
 * Fluent API for constructing type-safe Notion database queries
 * with filters, sorts, and pagination.
 *
 * @example
 * ```typescript
 * import { QueryBuilder, QueryBuilderHelpers } from './query';
 *
 * // Basic query
 * const query = new QueryBuilder()
 *   .where('status', 'select', 'equals', 'Active')
 *   .where('priority', 'select', 'equals', 'High')
 *   .orderBy('due', 'ascending')
 *   .limit(50)
 *   .build();
 *
 * // Using compound filters
 * const complexQuery = new QueryBuilder()
 *   .and(qb => {
 *     qb.where('status', 'select', 'equals', 'Active')
 *       .where('milestone', 'select', 'equals', 'M2')
 *   })
 *   .or(qb => {
 *     qb.where('priority', 'select', 'equals', 'High')
 *       .where('priority', 'select', 'equals', 'Critical')
 *   })
 *   .build();
 *
 * // Using helpers
 * const incompleteTasks = QueryBuilderHelpers.incompleteTasks()
 *   .orderBy('due', 'ascending')
 *   .build();
 * ```
 *
 * @module query
 */

export {
  QueryBuilder,
  QueryBuilderHelpers,
  createQueryBuilder,
  type PropertyType,
  type FilterOperator,
  type FilterValue,
} from './builder';

export type {
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
} from '../core/types/notion-filters';
