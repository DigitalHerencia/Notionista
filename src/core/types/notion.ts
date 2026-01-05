/**
 * Notion API type definitions
 *
 * @module core/types/notion
 */

/**
 * Notion page object
 */
export interface NotionPage {
  id: string;
  object: 'page';
  created_time: string;
  last_edited_time: string;
  archived: boolean;
  properties: Record<string, NotionProperty>;
  parent:
    | { type: 'database_id'; database_id: string }
    | { type: 'page_id'; page_id: string }
    | { type: 'workspace'; workspace: true };
  url: string;
}

/**
 * Base property type
 */
export interface BaseProperty {
  id: string;
  type: string;
}

/**
 * Title property
 */
export interface TitleProperty extends BaseProperty {
  type: 'title';
  title: Array<{
    type: 'text';
    text: { content: string; link: null | { url: string } };
    plain_text: string;
  }>;
}

/**
 * Rich text property
 */
export interface RichTextProperty extends BaseProperty {
  type: 'rich_text';
  rich_text: Array<{
    type: 'text';
    text: { content: string; link: null | { url: string } };
    plain_text: string;
  }>;
}

/**
 * Number property
 */
export interface NumberProperty extends BaseProperty {
  type: 'number';
  number: number | null;
}

/**
 * Select property
 */
export interface SelectProperty extends BaseProperty {
  type: 'select';
  select: { id: string; name: string; color: string } | null;
}

/**
 * Multi-select property
 */
export interface MultiSelectProperty extends BaseProperty {
  type: 'multi_select';
  multi_select: Array<{ id: string; name: string; color: string }>;
}

/**
 * Date property
 */
export interface DateProperty extends BaseProperty {
  type: 'date';
  date: {
    start: string;
    end: string | null;
    time_zone: string | null;
  } | null;
}

/**
 * Checkbox property
 */
export interface CheckboxProperty extends BaseProperty {
  type: 'checkbox';
  checkbox: boolean;
}

/**
 * Relation property
 */
export interface RelationProperty extends BaseProperty {
  type: 'relation';
  relation: Array<{ id: string }>;
}

/**
 * Rollup property
 */
export interface RollupProperty extends BaseProperty {
  type: 'rollup';
  rollup: {
    type: 'number' | 'date' | 'array';
    number?: number | null;
    date?: { start: string; end: string | null } | null;
    array?: NotionProperty[];
    function: string;
  };
}

/**
 * Formula property
 */
export interface FormulaProperty extends BaseProperty {
  type: 'formula';
  formula: {
    type: 'string' | 'number' | 'boolean' | 'date';
    string?: string | null;
    number?: number | null;
    boolean?: boolean | null;
    date?: { start: string; end: string | null } | null;
  };
}

/**
 * Union of all property types
 */
export type NotionProperty =
  | TitleProperty
  | RichTextProperty
  | NumberProperty
  | SelectProperty
  | MultiSelectProperty
  | DateProperty
  | CheckboxProperty
  | RelationProperty
  | RollupProperty
  | FormulaProperty;

/**
 * Page properties for create/update operations
 */
export type PageProperties = Record<string, Partial<NotionProperty>>;

/**
 * Query filter condition
 */
export interface QueryFilter {
  property: string;
  [key: string]: unknown;
}

/**
 * Query sort condition
 */
export interface QuerySort {
  property?: string;
  timestamp?: 'created_time' | 'last_edited_time';
  direction: 'ascending' | 'descending';
}

/**
 * Database query parameters
 */
export interface QueryDatabaseParams {
  database_id: string;
  filter?: QueryFilter | { and: QueryFilter[] } | { or: QueryFilter[] };
  sorts?: QuerySort[];
  start_cursor?: string;
  page_size?: number;
}

/**
 * Query response
 */
export interface QueryDatabaseResponse {
  object: 'list';
  results: NotionPage[];
  next_cursor: string | null;
  has_more: boolean;
}
