import { parse } from 'csv-parse/sync';
import { readFileSync } from 'fs';
import { join } from 'path';
import type { SnapshotRecord, CsvParserOptions } from '../../core/types/snapshot.js';

/**
 * Regular expression patterns for extracting Notion page IDs from URLs
 */
const UUID_WITH_HYPHENS_PATTERN =
  /notion\.so\/([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/i;
const UUID_COMPACT_PATTERN = /notion\.so\/([a-f0-9]{32})/i;

/**
 * Parser for Notion CSV export files
 *
 * Handles Notion-specific CSV formats including:
 * - Page IDs embedded in URLs
 * - Relation references as URLs
 * - Date formats like "January 5, 2026 10:40 AM"
 * - Boolean values as "Yes"/"No"
 */
export class CsvSnapshotParser {
  private options: Required<CsvParserOptions>;

  constructor(options: CsvParserOptions = {}) {
    this.options = {
      trim: options.trim ?? true,
      skipEmptyLines: options.skipEmptyLines ?? true,
      normalizers: options.normalizers ?? {},
    };
  }

  /**
   * Parse a Notion CSV export file
   *
   * @param filePath - Path to the CSV file
   * @returns Array of parsed snapshot records
   */
  parse(filePath: string): SnapshotRecord[] {
    const content = readFileSync(filePath, 'utf-8');
    const records = parse(content, {
      columns: true,
      skip_empty_lines: this.options.skipEmptyLines,
      trim: this.options.trim,
      relax_quotes: true,
      relax_column_count: true,
    }) as Record<string, string>[];

    return records.map((record, index) => {
      const id = this.extractId(record) ?? `row-${index}`;
      return {
        id,
        properties: this.normalizeProperties(record),
        source: 'csv' as const,
        filePath,
      };
    });
  }

  /**
   * Parse Teams CSV from snapshot directory
   *
   * @param snapshotDir - Path to the snapshot directory (e.g., snapshots/notion-export-2026-01-05)
   * @returns Array of team records
   */
  parseTeams(snapshotDir: string): SnapshotRecord[] {
    const filePath = join(
      snapshotDir,
      'Digital Herencia',
      'Teams 2d5a4e63bf2381519b98c81833668844.csv'
    );
    return this.parse(filePath);
  }

  /**
   * Parse Tasks CSV from snapshot directory
   *
   * @param snapshotDir - Path to the snapshot directory
   * @returns Array of task records
   */
  parseTasks(snapshotDir: string): SnapshotRecord[] {
    const filePath = join(
      snapshotDir,
      'Digital Herencia',
      'Tasks 2d5a4e63bf23816fa217ef754ce4a70e.csv'
    );
    return this.parse(filePath);
  }

  /**
   * Parse Projects CSV from snapshot directory
   *
   * @param snapshotDir - Path to the snapshot directory
   * @returns Array of project records
   */
  parseProjects(snapshotDir: string): SnapshotRecord[] {
    const filePath = join(
      snapshotDir,
      'Digital Herencia',
      'Projects 2d5a4e63bf2381b1b507f5ac308958e6.csv'
    );
    return this.parse(filePath);
  }

  /**
   * Parse Meetings CSV from snapshot directory
   *
   * @param snapshotDir - Path to the snapshot directory
   * @returns Array of meeting records
   */
  parseMeetings(snapshotDir: string): SnapshotRecord[] {
    const filePath = join(
      snapshotDir,
      'Digital Herencia',
      'Meetings 2d5a4e63bf238168af99d85e20bfb76f.csv'
    );
    return this.parse(filePath);
  }

  /**
   * Extract page ID from any field in the record
   * Looks for Notion URLs and extracts the page ID
   *
   * @param record - CSV record
   * @returns Extracted page ID or undefined
   */
  private extractId(record: Record<string, string>): string | undefined {
    // Notion exports include URLs with page IDs in various formats:
    // - https://www.notion.so/2d5a4e63-bf23-8151-9b98-c81833668844
    // - notion.so/2d5a4e63bf2381519b98c81833668844 (no hyphens)
    for (const value of Object.values(record)) {
      if (!value) continue;

      // Match URLs with hyphens
      const matchWithHyphens = value.match(
        /notion\.so\/([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/i
      );
      if (matchWithHyphens) return matchWithHyphens[1];

      // Match URLs without hyphens (compact format)
      const matchCompact = value.match(/notion\.so\/([a-f0-9]{32})/i);
      if (matchCompact && matchCompact[1]) {
        // Convert compact format to standard UUID format
        const compact = matchCompact[1];
        return `${compact.slice(0, 8)}-${compact.slice(8, 12)}-${compact.slice(12, 16)}-${compact.slice(16, 20)}-${compact.slice(20, 32)}`;
      }
    }
    return undefined;
  }

  /**
   * Normalize property values from CSV strings to appropriate types
   *
   * @param record - Raw CSV record
   * @returns Normalized properties
   */
  private normalizeProperties(record: Record<string, string>): Record<string, unknown> {
    const normalized: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(record)) {
      // Apply custom normalizer if provided
      if (this.options.normalizers[key]) {
        normalized[key] = this.options.normalizers[key](value);
        continue;
      }

      // Skip empty values
      if (!value || value.trim() === '') {
        normalized[key] = null;
        continue;
      }

      // Parse boolean values (Notion uses "Yes"/"No")
      if (value === 'Yes') {
        normalized[key] = true;
        continue;
      }
      if (value === 'No') {
        normalized[key] = false;
        continue;
      }

      // Parse relation references (text with URLs)
      if (value.includes('(https://www.notion.so/') || value.includes('(https://notion.so/')) {
        normalized[key] = this.parseRelations(value);
        continue;
      }

      // Parse date strings
      // Notion exports dates like: "January 5, 2026" or "January 5, 2026 10:40 AM"
      if (this.isDateString(value)) {
        normalized[key] = value; // Keep as string, can be parsed later with Date.parse()
        continue;
      }

      // Parse ISO date strings
      if (value.match(/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2})?/)) {
        normalized[key] = value;
        continue;
      }

      // Default: keep as string
      normalized[key] = value;
    }

    return normalized;
  }

  /**
   * Parse relation references from a value containing Notion URLs
   *
   * Example: "Team A (https://notion.so/abc123), Team B (https://notion.so/def456)"
   *
   * @param value - String containing relation URLs
   * @returns Array of extracted page IDs
   */
  private parseRelations(value: string): string[] {
    const ids: string[] = [];

    // Match URLs with hyphens
    const matchesWithHyphens = Array.from(
      value.matchAll(new RegExp(UUID_WITH_HYPHENS_PATTERN, 'gi'))
    );
    for (const match of matchesWithHyphens) {
      if (match[1]) {
        ids.push(match[1]);
      }
    }

    // Match compact format URLs (without hyphens)
    const matchesCompact = Array.from(value.matchAll(new RegExp(UUID_COMPACT_PATTERN, 'gi')));
    for (const match of matchesCompact) {
      if (match[1]) {
        const compact = match[1];
        const formatted = `${compact.slice(0, 8)}-${compact.slice(8, 12)}-${compact.slice(12, 16)}-${compact.slice(16, 20)}-${compact.slice(20, 32)}`;
        // Avoid duplicates if both formats are present
        if (!ids.includes(formatted)) {
          ids.push(formatted);
        }
      }
    }

    return ids;
  }

  /**
   * Check if a string is likely a date string
   *
   * @param value - String to check
   * @returns True if it looks like a date string
   */
  private isDateString(value: string): boolean {
    // Common month names
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];

    return months.some((month) => value.startsWith(month));
  }
}
