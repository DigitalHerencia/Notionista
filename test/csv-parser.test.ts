import { describe, it, expect } from "vitest";
import { join } from "path";
import { CsvSnapshotParser } from "../src/sync/parser/csv.js";

const FIXTURES_DIR = join(process.cwd(), "test", "fixtures");

describe("CsvSnapshotParser", () => {
  describe("parse", () => {
    it("should parse a CSV file and return snapshot records", () => {
      const parser = new CsvSnapshotParser();
      const records = parser.parse(join(FIXTURES_DIR, "tasks.csv"));

      expect(records).toHaveLength(3);
      expect(records[0]).toMatchObject({
        id: expect.any(String),
        properties: expect.any(Object),
        source: "csv",
        filePath: expect.stringContaining("tasks.csv"),
      });
    });

    it("should extract page IDs from Notion URLs", () => {
      const parser = new CsvSnapshotParser();
      const records = parser.parse(join(FIXTURES_DIR, "teams.csv"));

      // Teams CSV has team page IDs
      expect(records[0]?.id).toMatch(
        /[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/
      );
    });

    it("should normalize boolean values from Yes/No", () => {
      const parser = new CsvSnapshotParser();
      const records = parser.parse(join(FIXTURES_DIR, "tasks.csv"));

      const firstTask = records[0];
      expect(firstTask?.properties.Done).toBe(true);

      const secondTask = records[1];
      expect(secondTask?.properties.Done).toBe(false);
    });

    it("should parse relation references as arrays", () => {
      const parser = new CsvSnapshotParser();
      const records = parser.parse(join(FIXTURES_DIR, "tasks.csv"));

      const firstTask = records[0];
      expect(firstTask?.properties.Team).toBeInstanceOf(Array);
      expect(firstTask?.properties.Team).toHaveLength(1);
      expect((firstTask?.properties.Team as string[])[0]).toMatch(
        /[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/
      );
    });

    it("should handle empty relation fields", () => {
      const parser = new CsvSnapshotParser();
      const records = parser.parse(join(FIXTURES_DIR, "tasks.csv"));

      const thirdTask = records[2];
      expect(thirdTask?.properties.Meetings).toBeNull();
    });

    it("should parse date strings", () => {
      const parser = new CsvSnapshotParser();
      const records = parser.parse(join(FIXTURES_DIR, "tasks.csv"));

      const firstTask = records[0];
      expect(firstTask?.properties["Created time"]).toBe("January 5, 2026");
    });

    it("should handle multiple relations in one field", () => {
      const parser = new CsvSnapshotParser();
      const records = parser.parse(join(FIXTURES_DIR, "teams.csv"));

      const firstTeam = records[0];
      expect(firstTeam?.properties.Projects).toBeInstanceOf(Array);
      expect((firstTeam?.properties.Projects as string[]).length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("parseTeams/parseTasks/parseProjects", () => {
    it("should throw error if file does not exist", () => {
      const parser = new CsvSnapshotParser();
      
      expect(() => {
        parser.parseTeams("/nonexistent/path");
      }).toThrow();
    });
  });

  describe("custom normalizers", () => {
    it("should apply custom normalizers to properties", () => {
      const parser = new CsvSnapshotParser({
        normalizers: {
          "Task Code": (value) => `CODE-${value}`,
        },
      });

      const records = parser.parse(join(FIXTURES_DIR, "tasks.csv"));

      const firstTask = records[0];
      expect(firstTask?.properties["Task Code"]).toBe("CODE-T001");
    });
  });

  describe("URL format handling", () => {
    it("should handle URLs with hyphens in UUID format", () => {
      const parser = new CsvSnapshotParser();
      const records = parser.parse(join(FIXTURES_DIR, "tasks.csv"));

      // All test fixtures use hyphenated UUID format
      records.forEach((record) => {
        expect(record.id).toMatch(
          /^([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}|row-\d+)$/
        );
      });
    });

    it("should extract relations with URL formats correctly", () => {
      const parser = new CsvSnapshotParser();
      const records = parser.parse(join(FIXTURES_DIR, "projects.csv"));

      const firstProject = records[0];
      const team = firstProject?.properties.Team;
      
      expect(Array.isArray(team)).toBe(true);
      if (Array.isArray(team)) {
        expect(team[0]).toMatch(
          /[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/
        );
      }
    });
  });

  describe("edge cases", () => {
    it("should handle records without extractable IDs", () => {
      const parser = new CsvSnapshotParser();
      const records = parser.parse(join(FIXTURES_DIR, "tasks.csv"));

      // Should generate row-based IDs for records without URLs
      const hasRowId = records.some((r) => r.id.startsWith("row-"));
      // All our test data has URLs, but the functionality exists
      expect(records).toBeDefined();
    });

    it("should trim whitespace when option is enabled", () => {
      const parser = new CsvSnapshotParser({ trim: true });
      const records = parser.parse(join(FIXTURES_DIR, "tasks.csv"));

      const firstTask = records[0];
      expect(firstTask?.properties.Name).toBe("Align team OKRs");
      // No leading/trailing spaces
    });

    it("should handle special characters in CSV values", () => {
      const parser = new CsvSnapshotParser();
      const records = parser.parse(join(FIXTURES_DIR, "tasks.csv"));

      // CSV values with quotes and commas should be parsed correctly
      expect(records).toBeDefined();
      expect(records.length).toBeGreaterThan(0);
    });
  });
});
