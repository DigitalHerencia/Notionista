/**
 * Query Builder Tests
 * 
 * Run with: node --test src/query/builder.test.ts
 * Or with a test runner like Vitest
 */

import { QueryBuilder, QueryBuilderHelpers } from "./builder";

// Simple test runner (can be replaced with proper test framework)
function describe(name: string, fn: () => void) {
  console.log(`\n${name}`);
  fn();
}

function it(name: string, fn: () => void) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
  } catch (error) {
    console.log(`  ✗ ${name}`);
    console.error(`    ${error}`);
  }
}

function expect(actual: unknown) {
  return {
    toEqual(expected: unknown) {
      const actualStr = JSON.stringify(actual, null, 2);
      const expectedStr = JSON.stringify(expected, null, 2);
      if (actualStr !== expectedStr) {
        throw new Error(
          `Expected:\n${expectedStr}\n\nActual:\n${actualStr}`
        );
      }
    },
    toBeDefined() {
      if (actual === undefined) {
        throw new Error("Expected value to be defined");
      }
    },
    toBeUndefined() {
      if (actual !== undefined) {
        throw new Error("Expected value to be undefined");
      }
    },
  };
}

// Tests
describe("QueryBuilder", () => {
  describe("Basic Filters", () => {
    it("should create a simple select filter", () => {
      const query = new QueryBuilder()
        .where("status", "select", "equals", "Active")
        .build();

      expect(query.filter).toEqual({
        property: "status",
        select: { equals: "Active" },
      });
    });

    it("should create a checkbox filter", () => {
      const query = new QueryBuilder()
        .where("done", "checkbox", "equals", false)
        .build();

      expect(query.filter).toEqual({
        property: "done",
        checkbox: { equals: false },
      });
    });

    it("should create a number filter", () => {
      const query = new QueryBuilder()
        .where("count", "number", "greater_than", 5)
        .build();

      expect(query.filter).toEqual({
        property: "count",
        number: { greater_than: 5 },
      });
    });

    it("should create a text filter", () => {
      const query = new QueryBuilder()
        .where("name", "title", "contains", "Project")
        .build();

      expect(query.filter).toEqual({
        property: "name",
        title: { contains: "Project" },
      });
    });

    it("should create a date filter", () => {
      const query = new QueryBuilder()
        .where("due", "date", "after", "2025-01-01")
        .build();

      expect(query.filter).toEqual({
        property: "due",
        date: { after: "2025-01-01" },
      });
    });

    it("should handle is_empty operator without value", () => {
      const query = new QueryBuilder()
        .where("description", "rich_text", "is_empty")
        .build();

      expect(query.filter).toEqual({
        property: "description",
        rich_text: { is_empty: true },
      });
    });
  });

  describe("Multiple Filters", () => {
    it("should combine multiple filters with AND", () => {
      const query = new QueryBuilder()
        .where("status", "select", "equals", "Active")
        .where("priority", "select", "equals", "High")
        .build();

      expect(query.filter).toEqual({
        and: [
          {
            property: "status",
            select: { equals: "Active" },
          },
          {
            property: "priority",
            select: { equals: "High" },
          },
        ],
      });
    });
  });

  describe("Compound Filters", () => {
    it("should create an AND compound filter", () => {
      const query = new QueryBuilder()
        .and((qb) => {
          qb.where("status", "select", "equals", "Active").where(
            "milestone",
            "select",
            "equals",
            "M2"
          );
        })
        .build();

      expect(query.filter).toEqual({
        and: [
          {
            property: "status",
            select: { equals: "Active" },
          },
          {
            property: "milestone",
            select: { equals: "M2" },
          },
        ],
      });
    });

    it("should create an OR compound filter", () => {
      const query = new QueryBuilder()
        .or((qb) => {
          qb.where("priority", "select", "equals", "High").where(
            "priority",
            "select",
            "equals",
            "Critical"
          );
        })
        .build();

      expect(query.filter).toEqual({
        or: [
          {
            property: "priority",
            select: { equals: "High" },
          },
          {
            property: "priority",
            select: { equals: "Critical" },
          },
        ],
      });
    });

    it("should combine AND and OR filters", () => {
      const query = new QueryBuilder()
        .where("done", "checkbox", "equals", false)
        .or((qb) => {
          qb.where("priority", "select", "equals", "High").where(
            "priority",
            "select",
            "equals",
            "Critical"
          );
        })
        .build();

      expect(query.filter).toEqual({
        and: [
          {
            property: "done",
            checkbox: { equals: false },
          },
          {
            or: [
              {
                property: "priority",
                select: { equals: "High" },
              },
              {
                property: "priority",
                select: { equals: "Critical" },
              },
            ],
          },
        ],
      });
    });
  });

  describe("Sorting", () => {
    it("should add a property sort", () => {
      const query = new QueryBuilder()
        .orderBy("due", "ascending")
        .build();

      expect(query.sorts).toEqual([
        {
          property: "due",
          direction: "ascending",
        },
      ]);
    });

    it("should default to ascending direction", () => {
      const query = new QueryBuilder().orderBy("due").build();

      expect(query.sorts).toEqual([
        {
          property: "due",
          direction: "ascending",
        },
      ]);
    });

    it("should add multiple sorts", () => {
      const query = new QueryBuilder()
        .orderBy("priority", "descending")
        .orderBy("due", "ascending")
        .build();

      expect(query.sorts).toEqual([
        {
          property: "priority",
          direction: "descending",
        },
        {
          property: "due",
          direction: "ascending",
        },
      ]);
    });

    it("should add a timestamp sort", () => {
      const query = new QueryBuilder()
        .orderByTimestamp("created_time", "descending")
        .build();

      expect(query.sorts).toEqual([
        {
          timestamp: "created_time",
          direction: "descending",
        },
      ]);
    });
  });

  describe("Pagination", () => {
    it("should set page size", () => {
      const query = new QueryBuilder().limit(50).build();

      expect(query.page_size).toEqual(50);
    });

    it("should clamp page size to max 100", () => {
      const query = new QueryBuilder().limit(200).build();

      expect(query.page_size).toEqual(100);
    });

    it("should clamp page size to min 1", () => {
      const query = new QueryBuilder().limit(0).build();

      expect(query.page_size).toEqual(1);
    });

    it("should set start cursor", () => {
      const query = new QueryBuilder().startAfter("abc123").build();

      expect(query.start_cursor).toEqual("abc123");
    });
  });

  describe("Complex Queries", () => {
    it("should build a full query with filters, sorts, and pagination", () => {
      const query = new QueryBuilder()
        .where("status", "select", "equals", "Active")
        .where("priority", "select", "equals", "High")
        .orderBy("due", "ascending")
        .orderByTimestamp("created_time", "descending")
        .limit(50)
        .startAfter("cursor123")
        .build();

      expect(query).toEqual({
        filter: {
          and: [
            {
              property: "status",
              select: { equals: "Active" },
            },
            {
              property: "priority",
              select: { equals: "High" },
            },
          ],
        },
        sorts: [
          {
            property: "due",
            direction: "ascending",
          },
          {
            timestamp: "created_time",
            direction: "descending",
          },
        ],
        page_size: 50,
        start_cursor: "cursor123",
      });
    });
  });

  describe("Reset", () => {
    it("should reset the builder state", () => {
      const builder = new QueryBuilder()
        .where("status", "select", "equals", "Active")
        .orderBy("due", "ascending")
        .limit(50);

      let query = builder.build();
      expect(query.filter).toBeDefined();
      expect(query.sorts).toBeDefined();
      expect(query.page_size).toEqual(50);

      builder.reset();
      query = builder.build();
      expect(query.filter).toBeUndefined();
      expect(query.sorts).toBeUndefined();
      expect(query.page_size).toBeUndefined();
    });
  });
});

describe("QueryBuilderHelpers", () => {
  describe("incompleteTasks", () => {
    it("should create a query for incomplete tasks", () => {
      const query = QueryBuilderHelpers.incompleteTasks().build();

      expect(query.filter).toEqual({
        property: "done",
        checkbox: { equals: false },
      });
    });

    it("should allow chaining additional conditions", () => {
      const query = QueryBuilderHelpers.incompleteTasks()
        .where("priority", "select", "equals", "High")
        .build();

      expect(query.filter).toEqual({
        and: [
          {
            property: "done",
            checkbox: { equals: false },
          },
          {
            property: "priority",
            select: { equals: "High" },
          },
        ],
      });
    });
  });

  describe("tasksDueSoon", () => {
    it("should create a query for tasks due soon", () => {
      const query = QueryBuilderHelpers.tasksDueSoon(7).build();

      expect(query.filter).toBeDefined();
      // Check that it has the done filter and due filter
      const filter = query.filter as any;
      expect(filter.and).toBeDefined();
      expect(filter.and.length).toEqual(2);
    });
  });

  describe("activeProjects", () => {
    it("should create a query for active projects", () => {
      const query = QueryBuilderHelpers.activeProjects().build();

      expect(query.filter).toEqual({
        property: "status",
        select: { equals: "Active" },
      });
    });
  });

  describe("highPriority", () => {
    it("should create a query for high priority items", () => {
      const query = QueryBuilderHelpers.highPriority().build();

      expect(query.filter).toEqual({
        property: "priority",
        select: { equals: "High" },
      });
    });
  });

  describe("byTeam", () => {
    it("should create a query for items by team", () => {
      const query = QueryBuilderHelpers.byTeam("team-123").build();

      expect(query.filter).toEqual({
        property: "team",
        relation: { contains: "team-123" },
      });
    });
  });

  describe("byMilestone", () => {
    it("should create a query for items by milestone", () => {
      const query = QueryBuilderHelpers.byMilestone("M2").build();

      expect(query.filter).toEqual({
        property: "milestone",
        select: { equals: "M2" },
      });
    });
  });
});

// Run tests if this is the main module
if (require.main === module) {
  console.log("Running Query Builder Tests...");
}
