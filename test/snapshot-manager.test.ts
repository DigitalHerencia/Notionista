import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdirSync, rmSync, existsSync } from "fs";
import { join } from "path";
import { SnapshotManager } from "../src/sync/snapshot.js";
import type { SnapshotRecord } from "../src/core/types/snapshot.js";

const TEST_SNAPSHOTS_DIR = join(process.cwd(), "test", "tmp-snapshots");

describe("SnapshotManager", () => {
  beforeEach(() => {
    // Create test snapshots directory
    if (!existsSync(TEST_SNAPSHOTS_DIR)) {
      mkdirSync(TEST_SNAPSHOTS_DIR, { recursive: true });
    }
  });

  afterEach(() => {
    // Clean up test directory
    if (existsSync(TEST_SNAPSHOTS_DIR)) {
      rmSync(TEST_SNAPSHOTS_DIR, { recursive: true, force: true });
    }
  });

  describe("listSnapshots", () => {
    it("should return empty array if snapshots directory does not exist", () => {
      const manager = new SnapshotManager("/nonexistent/path");
      const snapshots = manager.listSnapshots();

      expect(snapshots).toEqual([]);
    });

    it("should return empty array if no snapshot directories exist", () => {
      const manager = new SnapshotManager(TEST_SNAPSHOTS_DIR);
      const snapshots = manager.listSnapshots();

      expect(snapshots).toEqual([]);
    });

    it("should list snapshot directories in reverse chronological order", () => {
      // Create test snapshot directories
      mkdirSync(join(TEST_SNAPSHOTS_DIR, "notion-export-2026-01-01"), { recursive: true });
      mkdirSync(join(TEST_SNAPSHOTS_DIR, "notion-export-2026-01-05"), { recursive: true });
      mkdirSync(join(TEST_SNAPSHOTS_DIR, "notion-export-2026-01-03"), { recursive: true });

      const manager = new SnapshotManager(TEST_SNAPSHOTS_DIR);
      const snapshots = manager.listSnapshots();

      expect(snapshots).toEqual([
        "notion-export-2026-01-05",
        "notion-export-2026-01-03",
        "notion-export-2026-01-01",
      ]);
    });
  });

  describe("compareSnapshots", () => {
    it("should detect added records", () => {
      const manager = new SnapshotManager(TEST_SNAPSHOTS_DIR);

      const oldSnapshot = {
        id: "snap-1",
        databaseId: "db-1",
        capturedAt: new Date("2026-01-01"),
        pageCount: 1,
        records: [
          {
            id: "record-1",
            properties: { name: "Record 1" },
            source: "csv" as const,
            filePath: "test.csv",
          },
        ],
      };

      const newSnapshot = {
        id: "snap-2",
        databaseId: "db-1",
        capturedAt: new Date("2026-01-05"),
        pageCount: 2,
        records: [
          {
            id: "record-1",
            properties: { name: "Record 1" },
            source: "csv" as const,
            filePath: "test.csv",
          },
          {
            id: "record-2",
            properties: { name: "Record 2" },
            source: "csv" as const,
            filePath: "test.csv",
          },
        ],
      };

      const diff = manager.compareSnapshots(oldSnapshot, newSnapshot);

      expect(diff.added).toHaveLength(1);
      expect(diff.added[0]?.id).toBe("record-2");
      expect(diff.removed).toHaveLength(0);
      expect(diff.modified).toHaveLength(0);
    });

    it("should detect removed records", () => {
      const manager = new SnapshotManager(TEST_SNAPSHOTS_DIR);

      const oldSnapshot = {
        id: "snap-1",
        databaseId: "db-1",
        capturedAt: new Date("2026-01-01"),
        pageCount: 2,
        records: [
          {
            id: "record-1",
            properties: { name: "Record 1" },
            source: "csv" as const,
            filePath: "test.csv",
          },
          {
            id: "record-2",
            properties: { name: "Record 2" },
            source: "csv" as const,
            filePath: "test.csv",
          },
        ],
      };

      const newSnapshot = {
        id: "snap-2",
        databaseId: "db-1",
        capturedAt: new Date("2026-01-05"),
        pageCount: 1,
        records: [
          {
            id: "record-1",
            properties: { name: "Record 1" },
            source: "csv" as const,
            filePath: "test.csv",
          },
        ],
      };

      const diff = manager.compareSnapshots(oldSnapshot, newSnapshot);

      expect(diff.removed).toHaveLength(1);
      expect(diff.removed[0]?.id).toBe("record-2");
      expect(diff.added).toHaveLength(0);
      expect(diff.modified).toHaveLength(0);
    });

    it("should detect modified records", () => {
      const manager = new SnapshotManager(TEST_SNAPSHOTS_DIR);

      const oldSnapshot = {
        id: "snap-1",
        databaseId: "db-1",
        capturedAt: new Date("2026-01-01"),
        pageCount: 1,
        records: [
          {
            id: "record-1",
            properties: { name: "Record 1", status: "draft" },
            source: "csv" as const,
            filePath: "test.csv",
          },
        ],
      };

      const newSnapshot = {
        id: "snap-2",
        databaseId: "db-1",
        capturedAt: new Date("2026-01-05"),
        pageCount: 1,
        records: [
          {
            id: "record-1",
            properties: { name: "Record 1", status: "published" },
            source: "csv" as const,
            filePath: "test.csv",
          },
        ],
      };

      const diff = manager.compareSnapshots(oldSnapshot, newSnapshot);

      expect(diff.modified).toHaveLength(1);
      expect(diff.modified[0]?.id).toBe("record-1");
      expect(diff.modified[0]?.changedProperties).toContain("status");
      expect(diff.added).toHaveLength(0);
      expect(diff.removed).toHaveLength(0);
    });

    it("should handle complex changes with added, removed, and modified", () => {
      const manager = new SnapshotManager(TEST_SNAPSHOTS_DIR);

      const oldSnapshot = {
        id: "snap-1",
        databaseId: "db-1",
        capturedAt: new Date("2026-01-01"),
        pageCount: 3,
        records: [
          {
            id: "record-1",
            properties: { name: "Record 1", status: "draft" },
            source: "csv" as const,
            filePath: "test.csv",
          },
          {
            id: "record-2",
            properties: { name: "Record 2" },
            source: "csv" as const,
            filePath: "test.csv",
          },
          {
            id: "record-3",
            properties: { name: "Record 3" },
            source: "csv" as const,
            filePath: "test.csv",
          },
        ],
      };

      const newSnapshot = {
        id: "snap-2",
        databaseId: "db-1",
        capturedAt: new Date("2026-01-05"),
        pageCount: 3,
        records: [
          {
            id: "record-1",
            properties: { name: "Record 1", status: "published" },
            source: "csv" as const,
            filePath: "test.csv",
          },
          {
            id: "record-2",
            properties: { name: "Record 2" },
            source: "csv" as const,
            filePath: "test.csv",
          },
          {
            id: "record-4",
            properties: { name: "Record 4" },
            source: "csv" as const,
            filePath: "test.csv",
          },
        ],
      };

      const diff = manager.compareSnapshots(oldSnapshot, newSnapshot);

      expect(diff.added).toHaveLength(1);
      expect(diff.added[0]?.id).toBe("record-4");
      expect(diff.removed).toHaveLength(1);
      expect(diff.removed[0]?.id).toBe("record-3");
      expect(diff.modified).toHaveLength(1);
      expect(diff.modified[0]?.id).toBe("record-1");
    });
  });

  describe("formatDiffReport", () => {
    it("should generate a markdown report", () => {
      const manager = new SnapshotManager(TEST_SNAPSHOTS_DIR);

      const diff = {
        added: [
          {
            id: "record-2",
            properties: { Name: "New Task" },
            source: "csv" as const,
            filePath: "test.csv",
          },
        ],
        removed: [],
        modified: [],
      };

      const report = manager.formatDiffReport(diff);

      expect(report).toContain("# Snapshot Diff Report");
      expect(report).toContain("## Summary");
      expect(report).toContain("**Added**: 1 records");
      expect(report).toContain("## Added Records");
      expect(report).toContain("record-2");
    });

    it("should format modified records with property changes", () => {
      const manager = new SnapshotManager(TEST_SNAPSHOTS_DIR);

      const diff = {
        added: [],
        removed: [],
        modified: [
          {
            id: "record-1",
            oldRecord: {
              id: "record-1",
              properties: { Name: "Task 1", Done: false },
              source: "csv" as const,
              filePath: "test.csv",
            },
            newRecord: {
              id: "record-1",
              properties: { Name: "Task 1", Done: true },
              source: "csv" as const,
              filePath: "test.csv",
            },
            changedProperties: ["Done"],
          },
        ],
      };

      const report = manager.formatDiffReport(diff);

      expect(report).toContain("## Modified Records");
      expect(report).toContain("record-1");
      expect(report).toContain("Done");
      expect(report).toContain("✗"); // false
      expect(report).toContain("✓"); // true
    });
  });

  describe("saveSnapshot and loadSavedSnapshot", () => {
    it("should save and load a snapshot", () => {
      const manager = new SnapshotManager(TEST_SNAPSHOTS_DIR);

      const snapshot = {
        id: "test-snap-1",
        databaseId: "db-1",
        capturedAt: new Date("2026-01-05T10:00:00Z"),
        pageCount: 1,
        records: [
          {
            id: "record-1",
            properties: { name: "Test Record" },
            source: "csv" as const,
            filePath: "test.csv",
          },
        ],
      };

      manager.saveSnapshot(snapshot, "test-snapshot.json");
      const loaded = manager.loadSavedSnapshot("test-snapshot.json");

      expect(loaded.id).toBe(snapshot.id);
      expect(loaded.databaseId).toBe(snapshot.databaseId);
      expect(loaded.pageCount).toBe(snapshot.pageCount);
      expect(loaded.records).toHaveLength(1);
      expect(loaded.capturedAt.toISOString()).toBe("2026-01-05T10:00:00.000Z");
    });

    it("should throw error when loading non-existent snapshot", () => {
      const manager = new SnapshotManager(TEST_SNAPSHOTS_DIR);

      expect(() => {
        manager.loadSavedSnapshot("nonexistent.json");
      }).toThrow();
    });
  });

  describe("compareLiveData", () => {
    it("should compare snapshot with live data records", () => {
      const manager = new SnapshotManager(TEST_SNAPSHOTS_DIR);

      const snapshot = {
        id: "snap-1",
        databaseId: "db-1",
        capturedAt: new Date("2026-01-01"),
        pageCount: 1,
        records: [
          {
            id: "record-1",
            properties: { name: "Record 1", status: "draft" },
            source: "csv" as const,
            filePath: "test.csv",
          },
        ],
      };

      const liveData: SnapshotRecord[] = [
        {
          id: "record-1",
          properties: { name: "Record 1", status: "published" },
          source: "csv" as const,
          filePath: "live.csv",
        },
        {
          id: "record-2",
          properties: { name: "Record 2" },
          source: "csv" as const,
          filePath: "live.csv",
        },
      ];

      const diff = manager.compareLiveData(snapshot, liveData);

      expect(diff.added).toHaveLength(1);
      expect(diff.modified).toHaveLength(1);
      expect(diff.removed).toHaveLength(0);
    });
  });
});
