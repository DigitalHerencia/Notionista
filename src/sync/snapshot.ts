import { readFileSync, writeFileSync, existsSync, readdirSync } from 'fs';
import { join } from 'path';
import { randomUUID } from 'crypto';
import type { Snapshot, SnapshotRecord, SnapshotDiff } from '../core/types/snapshot.js';
import { CsvSnapshotParser } from './parser/csv.js';

/**
 * Manages snapshots of Notion databases
 *
 * Provides functionality to:
 * - Load snapshots from the snapshots/ directory
 * - Compare snapshots with current state
 * - Generate diff reports
 */
export class SnapshotManager {
  private snapshotsDir: string;
  private parser: CsvSnapshotParser;

  /**
   * Create a new snapshot manager
   *
   * @param snapshotsDir - Path to the snapshots directory (default: ./snapshots)
   */
  constructor(snapshotsDir: string = './snapshots') {
    this.snapshotsDir = snapshotsDir;
    this.parser = new CsvSnapshotParser();
  }

  /**
   * List all available snapshot directories
   *
   * @returns Array of snapshot directory names (e.g., ["notion-export-2026-01-05", ...])
   */
  listSnapshots(): string[] {
    if (!existsSync(this.snapshotsDir)) {
      return [];
    }

    return readdirSync(this.snapshotsDir, { withFileTypes: true })
      .filter((dirent) => dirent.isDirectory() && dirent.name.startsWith('notion-export-'))
      .map((dirent) => dirent.name)
      .sort()
      .reverse(); // Most recent first
  }

  /**
   * Load a snapshot from a specific directory
   *
   * @param snapshotName - Name of the snapshot directory (e.g., "notion-export-2026-01-05")
   * @param databaseName - Name of the database to load ("teams", "tasks", "projects", or "meetings")
   * @returns Loaded snapshot
   */
  loadSnapshot(
    snapshotName: string,
    databaseName: 'teams' | 'tasks' | 'projects' | 'meetings'
  ): Snapshot {
    const snapshotPath = join(this.snapshotsDir, snapshotName);

    if (!existsSync(snapshotPath)) {
      throw new Error(`Snapshot directory not found: ${snapshotPath}`);
    }

    // Parse the appropriate CSV file
    let records: SnapshotRecord[];
    let databaseId: string;

    switch (databaseName) {
      case 'teams':
        records = this.parser.parseTeams(snapshotPath);
        databaseId = '2d5a4e63-bf23-8151-9b98-c81833668844';
        break;
      case 'tasks':
        records = this.parser.parseTasks(snapshotPath);
        databaseId = '2d5a4e63-bf23-816f-a217-ef754ce4a70e';
        break;
      case 'projects':
        records = this.parser.parseProjects(snapshotPath);
        databaseId = '2d5a4e63-bf23-81b1-b507-f5ac308958e6';
        break;
      case 'meetings':
        records = this.parser.parseMeetings(snapshotPath);
        databaseId = '2d5a4e63-bf23-8168-af99-d85e20bfb76f';
        break;
      default:
        throw new Error(`Unknown database: ${databaseName}`);
    }

    // Extract capture date from directory name
    // Format: notion-export-YYYY-MM-DD or notion-export-YYYY-MM-DD-HHMM
    const dateMatch = snapshotName.match(/notion-export-(\d{4}-\d{2}-\d{2})/);
    const capturedAt = dateMatch && dateMatch[1] ? new Date(dateMatch[1]) : new Date();

    return {
      id: randomUUID(),
      databaseId,
      capturedAt,
      pageCount: records.length,
      records,
    };
  }

  /**
   * Compare two snapshots and generate a diff report
   *
   * @param oldSnapshot - The older snapshot to compare from
   * @param newSnapshot - The newer snapshot to compare to
   * @returns Diff report showing changes
   */
  compareSnapshots(oldSnapshot: Snapshot, newSnapshot: Snapshot): SnapshotDiff {
    const oldRecordsMap = new Map(oldSnapshot.records.map((r) => [r.id, r]));
    const newRecordsMap = new Map(newSnapshot.records.map((r) => [r.id, r]));

    const added: SnapshotRecord[] = [];
    const removed: SnapshotRecord[] = [];
    const modified: SnapshotDiff['modified'] = [];

    // Find added and modified records
    for (const [id, newRecord] of newRecordsMap) {
      const oldRecord = oldRecordsMap.get(id);

      if (!oldRecord) {
        // Record was added
        added.push(newRecord);
      } else {
        // Check if record was modified
        const changedProperties = this.findChangedProperties(oldRecord, newRecord);
        if (changedProperties.length > 0) {
          modified.push({
            id,
            oldRecord,
            newRecord,
            changedProperties,
          });
        }
      }
    }

    // Find removed records
    for (const [id, oldRecord] of oldRecordsMap) {
      if (!newRecordsMap.has(id)) {
        removed.push(oldRecord);
      }
    }

    return { added, removed, modified };
  }

  /**
   * Compare a snapshot with current live data from Notion
   * Note: This requires live Notion data to be provided
   *
   * @param snapshot - The snapshot to compare from
   * @param currentRecords - Current records from live Notion
   * @returns Diff report showing drift
   */
  compareLiveData(snapshot: Snapshot, currentRecords: SnapshotRecord[]): SnapshotDiff {
    const currentSnapshot: Snapshot = {
      id: randomUUID(),
      databaseId: snapshot.databaseId,
      capturedAt: new Date(),
      pageCount: currentRecords.length,
      records: currentRecords,
    };

    return this.compareSnapshots(snapshot, currentSnapshot);
  }

  /**
   * Generate a human-readable diff report
   *
   * @param diff - The diff to format
   * @returns Markdown-formatted report
   */
  formatDiffReport(diff: SnapshotDiff): string {
    const lines: string[] = [];

    lines.push('# Snapshot Diff Report');
    lines.push('');
    lines.push('## Summary');
    lines.push('');
    lines.push(`- **Added**: ${diff.added.length} records`);
    lines.push(`- **Removed**: ${diff.removed.length} records`);
    lines.push(`- **Modified**: ${diff.modified.length} records`);
    lines.push('');

    if (diff.added.length > 0) {
      lines.push('## Added Records');
      lines.push('');
      for (const record of diff.added) {
        lines.push(`- **${record.id}**: ${this.formatRecordSummary(record)}`);
      }
      lines.push('');
    }

    if (diff.removed.length > 0) {
      lines.push('## Removed Records');
      lines.push('');
      for (const record of diff.removed) {
        lines.push(`- **${record.id}**: ${this.formatRecordSummary(record)}`);
      }
      lines.push('');
    }

    if (diff.modified.length > 0) {
      lines.push('## Modified Records');
      lines.push('');
      for (const mod of diff.modified) {
        lines.push(`### ${mod.id}`);
        lines.push('');
        lines.push(`Changed properties: ${mod.changedProperties.join(', ')}`);
        lines.push('');
        lines.push('| Property | Old Value | New Value |');
        lines.push('|----------|-----------|-----------|');
        for (const prop of mod.changedProperties) {
          const oldValue = this.formatValue(mod.oldRecord.properties[prop]);
          const newValue = this.formatValue(mod.newRecord.properties[prop]);
          lines.push(`| ${prop} | ${oldValue} | ${newValue} |`);
        }
        lines.push('');
      }
    }

    return lines.join('\n');
  }

  /**
   * Save a snapshot to disk
   *
   * @param snapshot - The snapshot to save
   * @param filename - Optional filename (default: snapshot-{id}.json)
   */
  saveSnapshot(snapshot: Snapshot, filename?: string): void {
    const filepath = join(this.snapshotsDir, filename ?? `snapshot-${snapshot.id}.json`);

    const data = {
      ...snapshot,
      capturedAt: snapshot.capturedAt.toISOString(),
    };

    writeFileSync(filepath, JSON.stringify(data, null, 2), 'utf-8');
  }

  /**
   * Load a saved snapshot from disk
   *
   * @param filename - Name of the snapshot file
   * @returns Loaded snapshot
   */
  loadSavedSnapshot(filename: string): Snapshot {
    const filepath = join(this.snapshotsDir, filename);

    if (!existsSync(filepath)) {
      throw new Error(`Snapshot file not found: ${filepath}`);
    }

    const data = JSON.parse(readFileSync(filepath, 'utf-8'));

    return {
      ...data,
      capturedAt: new Date(data.capturedAt),
    };
  }

  /**
   * Find properties that changed between two records
   *
   * @param oldRecord - The old record
   * @param newRecord - The new record
   * @returns Array of property names that changed
   */
  private findChangedProperties(oldRecord: SnapshotRecord, newRecord: SnapshotRecord): string[] {
    const changedProps: string[] = [];
    const allProps = new Set([
      ...Object.keys(oldRecord.properties),
      ...Object.keys(newRecord.properties),
    ]);

    for (const prop of allProps) {
      const oldValue = oldRecord.properties[prop];
      const newValue = newRecord.properties[prop];

      if (!this.isEqual(oldValue, newValue)) {
        changedProps.push(prop);
      }
    }

    return changedProps;
  }

  /**
   * Deep equality check for values
   *
   * @param a - First value
   * @param b - Second value
   * @returns True if values are equal
   */
  private isEqual(a: unknown, b: unknown): boolean {
    if (a === b) return true;
    if (a === null || b === null) return false;
    if (a === undefined || b === undefined) return false;

    if (Array.isArray(a) && Array.isArray(b)) {
      if (a.length !== b.length) return false;
      return a.every((item, i) => this.isEqual(item, b[i]));
    }

    if (typeof a === 'object' && typeof b === 'object') {
      const aKeys = Object.keys(a as object);
      const bKeys = Object.keys(b as object);
      if (aKeys.length !== bKeys.length) return false;
      return aKeys.every((key) =>
        this.isEqual((a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key])
      );
    }

    return false;
  }

  /**
   * Format a record for summary display
   *
   * @param record - The record to format
   * @returns Human-readable summary
   */
  private formatRecordSummary(record: SnapshotRecord): string {
    const name = record.properties.Name || record.properties.name || record.id;
    return String(name);
  }

  /**
   * Format a value for display in diff reports
   *
   * @param value - The value to format
   * @returns Formatted string
   */
  private formatValue(value: unknown): string {
    if (value === null || value === undefined) return '∅';
    if (typeof value === 'boolean') return value ? '✓' : '✗';
    if (Array.isArray(value)) return `[${value.length} items]`;
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  }
}
