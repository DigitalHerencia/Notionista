#!/usr/bin/env node
/**
 * Example: Parse CSV snapshots and compare them
 *
 * This example demonstrates how to:
 * 1. List available snapshots
 * 2. Load specific snapshots
 * 3. Compare snapshots to detect changes
 * 4. Generate diff reports
 *
 * Note: Run `npm run build` before running this example.
 */

import { SnapshotManager, type SnapshotRecord } from "../dist/index.js";

const SNAPSHOT_DIRECTORY = "./snapshots";

const formatError = (error: unknown): string =>
  error instanceof Error ? error.message : String(error);

const getRecordName = (record: SnapshotRecord): string => {
  const nameKeys = ["Name", "name"] as const;
  for (const key of nameKeys) {
    const value = record.properties[key];
    if (typeof value === "string" && value.trim().length > 0) {
      return value;
    }
  }
  return record.id;
};

async function main(): Promise<void> {
  const manager = new SnapshotManager(SNAPSHOT_DIRECTORY);

  console.log("📸 Snapshot Comparison Example\n");

  // List available snapshots
  console.log("Available snapshots:");
  const snapshots = manager.listSnapshots();

  if (snapshots.length === 0) {
    console.log(`⚠️  No snapshots found in ${SNAPSHOT_DIRECTORY} directory`);
    console.log(`   Please export your Notion workspace and place it in ${SNAPSHOT_DIRECTORY}/`);
    console.log("   Expected format: snapshots/notion-export-YYYY-MM-DD/");
    return;
  }

  snapshots.forEach((snap, i) => {
    console.log(`  ${i + 1}. ${snap}`);
  });

  // Load the two most recent snapshots
  if (snapshots.length < 2) {
    console.log("\n⚠️  Need at least 2 snapshots to compare");

    // Show info about the single snapshot
    const [singleSnapshot] = snapshots;
    if (singleSnapshot) {
      console.log(`\nLoading single snapshot: ${singleSnapshot}`);

      try {
        const snapshot = manager.loadSnapshot(singleSnapshot, "tasks");
        console.log(`\n📋 Tasks Snapshot:`);
        console.log(`   Database ID: ${snapshot.databaseId}`);
        console.log(`   Captured: ${snapshot.capturedAt.toISOString()}`);
        console.log(`   Records: ${snapshot.pageCount}`);

        if (snapshot.records.length > 0) {
          console.log(`\n   Sample records:`);
          snapshot.records.slice(0, 3).forEach((record) => {
            console.log(`   - ${getRecordName(record)}`);
          });
        }
      } catch (error) {
        console.error(`   Error loading snapshot: ${formatError(error)}`);
      }
    }
    return;
  }

  const newestSnapshot = snapshots[0]!;
  const olderSnapshot = snapshots[1]!;
  console.log(`\n🔍 Comparing:`);
  console.log(`   Old: ${olderSnapshot}`);
  console.log(`   New: ${newestSnapshot}`);

  // Compare Tasks
  console.log("\n📋 Tasks Database:");
  try {
    const oldSnapshot = manager.loadSnapshot(olderSnapshot, "tasks");
    const newSnapshot = manager.loadSnapshot(newestSnapshot, "tasks");

    const diff = manager.compareSnapshots(oldSnapshot, newSnapshot);

    console.log(`   Added: ${diff.added.length} records`);
    console.log(`   Removed: ${diff.removed.length} records`);
    console.log(`   Modified: ${diff.modified.length} records`);

    if (diff.added.length > 0 || diff.removed.length > 0 || diff.modified.length > 0) {
      console.log("\n📄 Detailed Diff Report:");
      console.log("─".repeat(60));
      const report = manager.formatDiffReport(diff);
      console.log(report);
    } else {
      console.log("   ✅ No changes detected");
    }
  } catch (error) {
    console.error(`   ❌ Error: ${formatError(error)}`);
  }

  // Compare Projects
  console.log("\n📁 Projects Database:");
  try {
    const oldSnapshot = manager.loadSnapshot(olderSnapshot, "projects");
    const newSnapshot = manager.loadSnapshot(newestSnapshot, "projects");

    const diff = manager.compareSnapshots(oldSnapshot, newSnapshot);

    console.log(`   Added: ${diff.added.length} records`);
    console.log(`   Removed: ${diff.removed.length} records`);
    console.log(`   Modified: ${diff.modified.length} records`);

    if (diff.modified.length > 0) {
      console.log("\n   Modified projects:");
      diff.modified.forEach((mod) => {
        console.log(`   - ${getRecordName(mod.newRecord)}: ${mod.changedProperties.join(", ")}`);
      });
    }
  } catch (error) {
    console.error(`   ❌ Error: ${formatError(error)}`);
  }

  // Compare Teams
  console.log("\n👥 Teams Database:");
  try {
    const oldSnapshot = manager.loadSnapshot(olderSnapshot, "teams");
    const newSnapshot = manager.loadSnapshot(newestSnapshot, "teams");

    const diff = manager.compareSnapshots(oldSnapshot, newSnapshot);

    console.log(`   Added: ${diff.added.length} records`);
    console.log(`   Removed: ${diff.removed.length} records`);
    console.log(`   Modified: ${diff.modified.length} records`);
  } catch (error) {
    console.error(`   ❌ Error: ${formatError(error)}`);
  }

  console.log("\n✨ Done!\n");
}

main().catch((error) => {
  console.error(`❌ Unexpected error: ${formatError(error)}`);
});
