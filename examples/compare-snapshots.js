#!/usr/bin/env node
/**
 * Example: Parse CSV snapshots and compare them
 * 
 * This example demonstrates how to:
 * 1. List available snapshots
 * 2. Load specific snapshots
 * 3. Compare snapshots to detect changes
 * 4. Generate diff reports
 */

import { SnapshotManager } from "../dist/index.js";

async function main() {
  const manager = new SnapshotManager("./snapshots");

  console.log("📸 Snapshot Comparison Example\n");

  // List available snapshots
  console.log("Available snapshots:");
  const snapshots = manager.listSnapshots();
  
  if (snapshots.length === 0) {
    console.log("⚠️  No snapshots found in ./snapshots directory");
    console.log("   Please export your Notion workspace and place it in ./snapshots/");
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
    if (snapshots[0]) {
      console.log(`\nLoading single snapshot: ${snapshots[0]}`);
      
      try {
        const snapshot = manager.loadSnapshot(snapshots[0], "tasks");
        console.log(`\n📋 Tasks Snapshot:`);
        console.log(`   Database ID: ${snapshot.databaseId}`);
        console.log(`   Captured: ${snapshot.capturedAt.toISOString()}`);
        console.log(`   Records: ${snapshot.pageCount}`);
        
        if (snapshot.records.length > 0) {
          console.log(`\n   Sample records:`);
          snapshot.records.slice(0, 3).forEach((record) => {
            const name = record.properties.Name || record.properties.name || record.id;
            console.log(`   - ${name}`);
          });
        }
      } catch (error) {
        console.error(`   Error loading snapshot: ${error}`);
      }
    }
    return;
  }

  const [newest, older] = snapshots;
  console.log(`\n🔍 Comparing:`);
  console.log(`   Old: ${older}`);
  console.log(`   New: ${newest}`);

  // Compare Tasks
  console.log("\n📋 Tasks Database:");
  try {
    const oldSnapshot = manager.loadSnapshot(older!, "tasks");
    const newSnapshot = manager.loadSnapshot(newest!, "tasks");

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
    console.error(`   ❌ Error: ${error}`);
  }

  // Compare Projects
  console.log("\n📁 Projects Database:");
  try {
    const oldSnapshot = manager.loadSnapshot(older!, "projects");
    const newSnapshot = manager.loadSnapshot(newest!, "projects");

    const diff = manager.compareSnapshots(oldSnapshot, newSnapshot);

    console.log(`   Added: ${diff.added.length} records`);
    console.log(`   Removed: ${diff.removed.length} records`);
    console.log(`   Modified: ${diff.modified.length} records`);

    if (diff.modified.length > 0) {
      console.log("\n   Modified projects:");
      diff.modified.forEach((mod) => {
        const name = mod.newRecord.properties.Name || mod.newRecord.properties.name;
        console.log(`   - ${name}: ${mod.changedProperties.join(", ")}`);
      });
    }
  } catch (error) {
    console.error(`   ❌ Error: ${error}`);
  }

  // Compare Teams
  console.log("\n👥 Teams Database:");
  try {
    const oldSnapshot = manager.loadSnapshot(older!, "teams");
    const newSnapshot = manager.loadSnapshot(newest!, "teams");

    const diff = manager.compareSnapshots(oldSnapshot, newSnapshot);

    console.log(`   Added: ${diff.added.length} records`);
    console.log(`   Removed: ${diff.removed.length} records`);
    console.log(`   Modified: ${diff.modified.length} records`);
  } catch (error) {
    console.error(`   ❌ Error: ${error}`);
  }

  console.log("\n✨ Done!\n");
}

main().catch(console.error);
