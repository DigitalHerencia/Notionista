/**
 * Notion API types (simplified for MCP usage)
 */

export interface NotionPage {
  object: "page";
  id: string;
  created_time: string;
  last_edited_time: string;
  parent: {
    type: "database_id";
    database_id: string;
  };
  properties: Record<string, NotionProperty>;
}

export type NotionProperty =
  | TitleProperty
  | RichTextProperty
  | NumberProperty
  | SelectProperty
  | MultiSelectProperty
  | DateProperty
  | CheckboxProperty
  | RelationProperty
  | FormulaProperty
  | RollupProperty;

export interface TitleProperty {
  type: "title";
  title: RichText[];
}

export interface RichTextProperty {
  type: "rich_text";
  rich_text: RichText[];
}

export interface RichText {
  type: "text";
  text: {
    content: string;
  };
  plain_text: string;
}

export interface NumberProperty {
  type: "number";
  number: number | null;
}

export interface SelectProperty {
  type: "select";
  select: {
    name: string;
    color?: string;
  } | null;
}

export interface MultiSelectProperty {
  type: "multi_select";
  multi_select: Array<{
    name: string;
    color?: string;
  }>;
}

export interface DateProperty {
  type: "date";
  date: {
    start: string;
    end?: string | null;
  } | null;
}

export interface CheckboxProperty {
  type: "checkbox";
  checkbox: boolean;
}

export interface RelationProperty {
  type: "relation";
  relation: Array<{
    id: string;
  }>;
}

export interface FormulaProperty {
  type: "formula";
  formula:
    | { type: "string"; string: string | null }
    | { type: "number"; number: number | null }
    | { type: "boolean"; boolean: boolean | null }
    | { type: "date"; date: { start: string; end?: string | null } | null };
}

export interface RollupProperty {
  type: "rollup";
  rollup:
    | { type: "number"; number: number | null }
    | { type: "array"; array: NotionProperty[] };
}

/**
 * Query filter types
 */

export interface QueryFilter {
  and?: QueryFilter[];
  or?: QueryFilter[];
  property?: string;
  [key: string]: unknown;
}

export interface QuerySort {
  property?: string;
  timestamp?: "created_time" | "last_edited_time";
  direction: "ascending" | "descending";
}

export interface QueryParams {
  database_id: string;
  filter?: QueryFilter;
  sorts?: QuerySort[];
  page_size?: number;
  start_cursor?: string;
}

export interface QueryResult {
  object: "list";
  results: NotionPage[];
  next_cursor: string | null;
  has_more: boolean;
}
