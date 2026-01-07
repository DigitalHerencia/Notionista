import { z } from 'zod';

/**
 * A record parsed from a Notion CSV export snapshot
 */
export interface SnapshotRecord {
  /** Extracted Notion page ID */
  id: string;
  /** Normalized property values */
  properties: Record<string, unknown>;
  /** Source of the snapshot data */
  source: 'csv' | 'markdown';
  /** Path to the source file */
  filePath: string;
}

/**
 * A complete snapshot of a Notion database at a point in time
 */
export interface Snapshot {
  /** Unique snapshot identifier */
  id: string;
  /** Notion database ID */
  databaseId: string;
  /** When the snapshot was captured */
  capturedAt: Date;
  /** Number of pages in snapshot */
  pageCount: number;
  /** All records in the snapshot */
  records: SnapshotRecord[];
}

/**
 * Comparison result between a snapshot and current state
 */
export interface SnapshotDiff {
  /** Records added since snapshot */
  added: SnapshotRecord[];
  /** Records removed since snapshot */
  removed: SnapshotRecord[];
  /** Records with changed properties */
  modified: Array<{
    id: string;
    oldRecord: SnapshotRecord;
    newRecord: SnapshotRecord;
    changedProperties: string[];
  }>;
}

/**
 * Options for CSV parsing
 */
export interface CsvParserOptions {
  /** Whether to trim whitespace from values */
  trim?: boolean;
  /** Whether to skip empty lines */
  skipEmptyLines?: boolean;
  /** Custom property normalizers */
  normalizers?: Record<string, (value: string) => unknown>;
}

/**
 * Zod schema for validating snapshot records
 */
export const SnapshotRecordSchema = z.object({
  id: z.string(),
  properties: z.record(z.string(), z.unknown()),
  source: z.enum(['csv', 'markdown']),
  filePath: z.string(),
});

/**
 * Zod schema for validating snapshots
 */
export const SnapshotSchema = z.object({
  id: z.string(),
  databaseId: z.string(),
  capturedAt: z.date(),
  pageCount: z.number(),
  records: z.array(SnapshotRecordSchema),
});
