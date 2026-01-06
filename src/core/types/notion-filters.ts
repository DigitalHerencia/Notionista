/**
 * Type definitions for Notion API filter objects
 * Based on: https://developers.notion.com/reference/post-database-query-filter
 */

/**
 * Property filter operators for different property types
 */

// Text property filters
export interface TextFilter {
  equals?: string;
  does_not_equal?: string;
  contains?: string;
  does_not_contain?: string;
  starts_with?: string;
  ends_with?: string;
  is_empty?: true;
  is_not_empty?: true;
}

// Number property filters
export interface NumberFilter {
  equals?: number;
  does_not_equal?: number;
  greater_than?: number;
  less_than?: number;
  greater_than_or_equal_to?: number;
  less_than_or_equal_to?: number;
  is_empty?: true;
  is_not_empty?: true;
}

// Checkbox property filters
export interface CheckboxFilter {
  equals?: boolean;
  does_not_equal?: boolean;
}

// Select property filters
export interface SelectFilter {
  equals?: string;
  does_not_equal?: string;
  is_empty?: true;
  is_not_empty?: true;
}

// Multi-select property filters
export interface MultiSelectFilter {
  contains?: string;
  does_not_contain?: string;
  is_empty?: true;
  is_not_empty?: true;
}

// Date property filters
export interface DateFilter {
  equals?: string;
  before?: string;
  after?: string;
  on_or_before?: string;
  on_or_after?: string;
  is_empty?: true;
  is_not_empty?: true;
  past_week?: Record<string, never>;
  past_month?: Record<string, never>;
  past_year?: Record<string, never>;
  next_week?: Record<string, never>;
  next_month?: Record<string, never>;
  next_year?: Record<string, never>;
}

// People property filters
export interface PeopleFilter {
  contains?: string;
  does_not_contain?: string;
  is_empty?: true;
  is_not_empty?: true;
}

// Files property filters
export interface FilesFilter {
  is_empty?: true;
  is_not_empty?: true;
}

// Relation property filters
export interface RelationFilter {
  contains?: string;
  does_not_contain?: string;
  is_empty?: true;
  is_not_empty?: true;
}

// Status property filters
export interface StatusFilter {
  equals?: string;
  does_not_equal?: string;
  is_empty?: true;
  is_not_empty?: true;
}

/**
 * Property filter condition
 */
export interface PropertyFilter {
  property: string;
  title?: TextFilter;
  rich_text?: TextFilter;
  number?: NumberFilter;
  checkbox?: CheckboxFilter;
  select?: SelectFilter;
  multi_select?: MultiSelectFilter;
  date?: DateFilter;
  people?: PeopleFilter;
  files?: FilesFilter;
  relation?: RelationFilter;
  status?: StatusFilter;
}

/**
 * Compound filter conditions
 */
export interface CompoundFilter {
  and?: Filter[];
  or?: Filter[];
}

/**
 * Combined filter type
 */
export type Filter = PropertyFilter | CompoundFilter;

/**
 * Sort direction
 */
export type SortDirection = 'ascending' | 'descending';

/**
 * Sort condition
 */
export interface Sort {
  property?: string;
  timestamp?: 'created_time' | 'last_edited_time';
  direction: SortDirection;
}

/**
 * Query parameters for database queries
 */
export interface QueryParams {
  filter?: Filter;
  sorts?: Sort[];
  start_cursor?: string;
  page_size?: number;
}
