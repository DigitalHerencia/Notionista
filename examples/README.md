# Examples

This directory contains example scripts demonstrating how to use the Notionista snapshot utilities.

## Running Examples

After building the project:

```bash
npm run build
```

You can run the examples directly:

```bash
node examples/parse-csv.js
node examples/compare-snapshots.js
```

## Available Examples

### parse-csv.js

Demonstrates parsing a single CSV file and inspecting the extracted data.

**Usage:**
```bash
node examples/parse-csv.js
```

**Output:**
- Lists all parsed records
- Shows extracted page IDs
- Displays normalized property values
- Demonstrates boolean and relation parsing

### compare-snapshots.js

Demonstrates comparing two Notion export snapshots to detect changes.

**Usage:**
```bash
# First, place your Notion exports in ./snapshots/
# Expected format: snapshots/notion-export-YYYY-MM-DD/

node examples/compare-snapshots.js
```

**Output:**
- Lists available snapshots
- Compares the two most recent snapshots
- Shows added, removed, and modified records
- Generates a detailed diff report

## Setting Up Snapshots

1. Export your Notion workspace:
   - Go to Settings & Members → Settings → Export content
   - Choose "Markdown & CSV" format
   - Download the export

2. Extract the export:
   ```bash
   unzip Notion_Export_*.zip -d snapshots/notion-export-$(date +%Y-%m-%d)
   ```

3. Run the comparison:
   ```bash
   node examples/compare-snapshots.js
   ```

## Creating Your Own Examples

You can create your own scripts using the Notionista API:

```javascript
import { SnapshotManager, CsvSnapshotParser } from "notionista";

// Your custom logic here
```

See the [README](../README.md) for full API documentation.
