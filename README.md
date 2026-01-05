# Notionista - Snapshot & Sync

Snapshot parsing and comparison utilities for Notion exports. Part of the Notionista SDK for advanced Notion automation.

## Features

- ✅ Parse Notion CSV exports
- ✅ Load snapshots from `snapshots/` directory
- ✅ Compare snapshots to detect drift
- ✅ Generate detailed diff reports
- ✅ TypeScript-first with full type safety
- ✅ Support for multiple database types (Teams, Tasks, Projects, Meetings)

## Installation

```bash
npm install notionista
```

## Quick Start

### Parsing CSV Exports

```typescript
import { CsvSnapshotParser } from "notionista";

const parser = new CsvSnapshotParser();

// Parse a single CSV file
const records = parser.parse("./snapshots/notion-export-2026-01-05/tasks.csv");

console.log(`Parsed ${records.length} records`);
console.log(records[0]); // { id, properties, source, filePath }
```

### Loading Snapshots

```typescript
import { SnapshotManager } from "notionista";

const manager = new SnapshotManager("./snapshots");

// List available snapshots
const snapshots = manager.listSnapshots();
console.log("Available snapshots:", snapshots);

// Load a specific snapshot
const snapshot = manager.loadSnapshot("notion-export-2026-01-05", "tasks");
console.log(`Loaded ${snapshot.pageCount} tasks from ${snapshot.capturedAt}`);
```

### Comparing Snapshots

```typescript
import { SnapshotManager } from "notionista";

const manager = new SnapshotManager("./snapshots");

// Load two snapshots
const oldSnapshot = manager.loadSnapshot("notion-export-2026-01-01", "tasks");
const newSnapshot = manager.loadSnapshot("notion-export-2026-01-05", "tasks");

// Compare them
const diff = manager.compareSnapshots(oldSnapshot, newSnapshot);

console.log(`Added: ${diff.added.length}`);
console.log(`Removed: ${diff.removed.length}`);
console.log(`Modified: ${diff.modified.length}`);
```

### Generating Diff Reports

```typescript
import { SnapshotManager } from "notionista";

const manager = new SnapshotManager("./snapshots");

const oldSnapshot = manager.loadSnapshot("notion-export-2026-01-01", "tasks");
const newSnapshot = manager.loadSnapshot("notion-export-2026-01-05", "tasks");

const diff = manager.compareSnapshots(oldSnapshot, newSnapshot);

// Generate a markdown report
const report = manager.formatDiffReport(diff);
console.log(report);
```

Example output:

```markdown
# Snapshot Diff Report

## Summary

- **Added**: 2 records
- **Removed**: 1 records
- **Modified**: 3 records

## Added Records

- **2d5a4e63-bf23-8137-8277-000b41c867c3**: New Task Name
- **2d5a4e63-bf23-8137-8277-000b41c867c4**: Another Task

## Modified Records

### 2d5a4e63-bf23-8137-8277-000b41c867c5

Changed properties: Done, Priority

| Property | Old Value | New Value |
|----------|-----------|-----------|
| Done | ✗ | ✓ |
| Priority | Low | High |
```

## CSV Format

Notionista parses Notion CSV exports with the following features:

### Page ID Extraction

Page IDs are automatically extracted from Notion URLs:

```csv
Name,Team
"Task 1",Operations Team (https://www.notion.so/2d5a4e63-bf23-8151-9b98-c81833668844)
```

The parser extracts `2d5a4e63-bf23-8151-9b98-c81833668844` as the page ID.

### Boolean Values

Notion exports boolean values as "Yes" or "No":

```csv
Name,Done
"Task 1",Yes
"Task 2",No
```

The parser converts these to `true` and `false`.

### Relation References

Relations are exported as text with embedded URLs:

```csv
Name,Project,Team
"Task 1","Project A (https://notion.so/abc123)","Team B (https://notion.so/def456)"
```

The parser extracts relation IDs as arrays: `['abc123', 'def456']`

### Date Formats

Notion exports dates in human-readable format:

```csv
Name,Created time
"Task 1","January 5, 2026"
"Task 2","January 5, 2026 10:40 AM"
```

The parser preserves these as strings (can be parsed with `Date.parse()`).

## Advanced Usage

### Custom Property Normalizers

```typescript
import { CsvSnapshotParser } from "notionista";

const parser = new CsvSnapshotParser({
  normalizers: {
    "Task Code": (value) => value.toUpperCase(),
    "Priority": (value) => value === "High" ? 1 : value === "Medium" ? 2 : 3,
  },
});

const records = parser.parse("./tasks.csv");
```

### Comparing with Live Data

```typescript
import { SnapshotManager } from "notionista";

const manager = new SnapshotManager("./snapshots");
const snapshot = manager.loadSnapshot("notion-export-2026-01-01", "tasks");

// Fetch current data from Notion (via MCP or API)
const currentRecords = await fetchCurrentTasksFromNotion();

// Compare snapshot with live data to detect drift
const drift = manager.compareLiveData(snapshot, currentRecords);

if (drift.modified.length > 0) {
  console.warn("Detected drift from snapshot!");
  console.log(manager.formatDiffReport(drift));
}
```

### Saving and Loading Snapshots

```typescript
import { SnapshotManager } from "notionista";

const manager = new SnapshotManager("./snapshots");

// Load from CSV
const snapshot = manager.loadSnapshot("notion-export-2026-01-05", "tasks");

// Save as JSON for faster loading
manager.saveSnapshot(snapshot, "tasks-2026-01-05.json");

// Load from JSON
const loaded = manager.loadSavedSnapshot("tasks-2026-01-05.json");
```

## Database Types

Notionista supports the following Digital Herencia database types:

- `teams` - Teams database
- `tasks` - Tasks database
- `projects` - Projects database
- `meetings` - Meetings database

Each database type knows the correct CSV filename to look for in the snapshot directory.

## Directory Structure

Expected snapshot directory structure:

```
snapshots/
├── notion-export-2026-01-01/
│   └── Digital Herencia/
│       ├── Teams 2d5a4e63bf2381519b98c81833668844.csv
│       ├── Tasks 2d5a4e63bf23816fa217ef754ce4a70e.csv
│       ├── Projects 2d5a4e63bf2381b1b507f5ac308958e6.csv
│       └── Meetings 2d5a4e63bf238168af99d85e20bfb76f.csv
└── notion-export-2026-01-05/
    └── Digital Herencia/
        └── ...
```

## API Reference

### `CsvSnapshotParser`

Parser for Notion CSV export files.

#### Constructor

```typescript
constructor(options?: CsvParserOptions)
```

**Options:**
- `trim?: boolean` - Trim whitespace from values (default: true)
- `skipEmptyLines?: boolean` - Skip empty lines (default: true)
- `normalizers?: Record<string, (value: string) => unknown>` - Custom property normalizers

#### Methods

- `parse(filePath: string): SnapshotRecord[]` - Parse a CSV file
- `parseTeams(snapshotDir: string): SnapshotRecord[]` - Parse Teams CSV
- `parseTasks(snapshotDir: string): SnapshotRecord[]` - Parse Tasks CSV
- `parseProjects(snapshotDir: string): SnapshotRecord[]` - Parse Projects CSV
- `parseMeetings(snapshotDir: string): SnapshotRecord[]` - Parse Meetings CSV

### `SnapshotManager`

Manages snapshots of Notion databases.

#### Constructor

```typescript
constructor(snapshotsDir?: string)
```

**Parameters:**
- `snapshotsDir` - Path to snapshots directory (default: "./snapshots")

#### Methods

- `listSnapshots(): string[]` - List available snapshot directories
- `loadSnapshot(snapshotName: string, databaseName: "teams" | "tasks" | "projects" | "meetings"): Snapshot` - Load a snapshot
- `compareSnapshots(oldSnapshot: Snapshot, newSnapshot: Snapshot): SnapshotDiff` - Compare two snapshots
- `compareLiveData(snapshot: Snapshot, currentRecords: SnapshotRecord[]): SnapshotDiff` - Compare snapshot with live data
- `formatDiffReport(diff: SnapshotDiff): string` - Generate markdown diff report
- `saveSnapshot(snapshot: Snapshot, filename?: string): void` - Save snapshot to disk
- `loadSavedSnapshot(filename: string): Snapshot` - Load saved snapshot from disk

## TypeScript Types

```typescript
interface SnapshotRecord {
  id: string;
  properties: Record<string, unknown>;
  source: "csv" | "markdown";
  filePath: string;
}

interface Snapshot {
  id: string;
  databaseId: string;
  capturedAt: Date;
  pageCount: number;
  records: SnapshotRecord[];
}

interface SnapshotDiff {
  added: SnapshotRecord[];
  removed: SnapshotRecord[];
  modified: Array<{
    id: string;
    oldRecord: SnapshotRecord;
    newRecord: SnapshotRecord;
    changedProperties: string[];
  }>;
}
```

## Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## License

MIT

## Part of Notionista SDK

This package is part of the Notionista SDK for advanced Notion automation. See the [main repository](https://github.com/DigitalHerencia/Notionista) for more information.
