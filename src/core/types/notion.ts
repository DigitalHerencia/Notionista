/**
 * Notion page object structure
 */
export interface NotionPage {
  id: string;
  created_time: string;
  last_edited_time: string;
  parent: {
    type: string;
    database_id?: string;
  };
  properties: Record<string, NotionProperty>;
  url: string;
}

/**
 * Notion property types
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

export interface TitleProperty {
  type: 'title';
  title: Array<{ plain_text: string }>;
}

export interface RichTextProperty {
  type: 'rich_text';
  rich_text: Array<{ plain_text: string }>;
}

export interface NumberProperty {
  type: 'number';
  number: number | null;
}

export interface SelectProperty {
  type: 'select';
  select: { name: string } | null;
}

export interface MultiSelectProperty {
  type: 'multi_select';
  multi_select: Array<{ name: string }>;
}

export interface DateProperty {
  type: 'date';
  date: { start: string; end?: string } | null;
}

export interface CheckboxProperty {
  type: 'checkbox';
  checkbox: boolean;
}

export interface RelationProperty {
  type: 'relation';
  relation: Array<{ id: string }>;
}

export interface RollupProperty {
  type: 'rollup';
  rollup: {
    type: string;
    number?: number;
    array?: unknown[];
  };
}

export interface FormulaProperty {
  type: 'formula';
  formula: {
    type: 'string' | 'number' | 'boolean' | 'date';
    string?: string;
    number?: number;
    boolean?: boolean;
    date?: { start: string };
  };
}

/**
 * Properties for creating/updating pages
 */
export type PageProperties = Record<string, PropertyValue>;

export type PropertyValue =
  | { title: Array<{ text: { content: string } }> }
  | { rich_text: Array<{ text: { content: string } }> }
  | { number: number | null }
  | { select: { name: string } | null }
  | { multi_select: Array<{ name: string }> }
  | { date: { start: string; end?: string } | null }
  | { checkbox: boolean }
  | { relation: Array<{ id: string }> };

/**
 * Query filter structure
 */
export interface QueryFilter {
  and?: QueryFilter[];
  or?: QueryFilter[];
  property?: string;
  [key: string]: unknown;
}

/**
 * Query sort structure
 */
export interface QuerySort {
  property?: string;
  timestamp?: 'created_time' | 'last_edited_time';
  direction: 'ascending' | 'descending';
}

/**
 * Query parameters for database queries
 */
export interface QueryParams {
  database_id: string;
  filter?: QueryFilter;
  sorts?: QuerySort[];
  page_size?: number;
  start_cursor?: string;
}

/**
 * Query result with pagination
 */
export interface QueryResult {
  results: NotionPage[];
  has_more: boolean;
  next_cursor: string | null;
}
