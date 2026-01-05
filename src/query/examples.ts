/**
 * Query Builder Usage Examples
 * 
 * This file demonstrates various use cases for the QueryBuilder
 */

import { QueryBuilder, QueryBuilderHelpers, createQueryBuilder } from "./builder";

// ============================================================================
// BASIC EXAMPLES
// ============================================================================

/**
 * Example 1: Simple filter query
 */
export function example1_SimpleFilter() {
  const query = new QueryBuilder()
    .where("status", "select", "equals", "Active")
    .build();

  console.log("Example 1 - Simple Filter:");
  console.log(JSON.stringify(query, null, 2));
  return query;
}

/**
 * Example 2: Multiple filters (AND)
 */
export function example2_MultipleFilters() {
  const query = new QueryBuilder()
    .where("status", "select", "equals", "Active")
    .where("priority", "select", "equals", "High")
    .where("milestone", "select", "equals", "M2")
    .build();

  console.log("Example 2 - Multiple Filters:");
  console.log(JSON.stringify(query, null, 2));
  return query;
}

/**
 * Example 3: OR compound filter
 */
export function example3_OrFilter() {
  const query = new QueryBuilder()
    .or((qb) => {
      qb.where("priority", "select", "equals", "High")
        .where("priority", "select", "equals", "Critical");
    })
    .build();

  console.log("Example 3 - OR Filter:");
  console.log(JSON.stringify(query, null, 2));
  return query;
}

/**
 * Example 4: Complex nested filters
 */
export function example4_ComplexFilter() {
  const query = new QueryBuilder()
    .and((qb) => {
      qb.where("status", "select", "equals", "Active")
        .where("milestone", "select", "equals", "M2");
    })
    .or((qb) => {
      qb.where("priority", "select", "equals", "High")
        .where("priority", "select", "equals", "Critical");
    })
    .build();

  console.log("Example 4 - Complex Nested Filters:");
  console.log(JSON.stringify(query, null, 2));
  return query;
}

/**
 * Example 5: Sorting
 */
export function example5_Sorting() {
  const query = new QueryBuilder()
    .where("status", "select", "equals", "Active")
    .orderBy("priority", "descending")
    .orderBy("due", "ascending")
    .build();

  console.log("Example 5 - Sorting:");
  console.log(JSON.stringify(query, null, 2));
  return query;
}

/**
 * Example 6: Pagination
 */
export function example6_Pagination() {
  const query = new QueryBuilder()
    .where("status", "select", "equals", "Active")
    .limit(25)
    .startAfter("cursor_abc123")
    .build();

  console.log("Example 6 - Pagination:");
  console.log(JSON.stringify(query, null, 2));
  return query;
}

// ============================================================================
// DIGITAL HERENCIA WORKSPACE EXAMPLES
// ============================================================================

/**
 * Example 7: Find active projects in Milestone M2
 */
export function example7_ActiveM2Projects() {
  const query = new QueryBuilder()
    .where("status", "select", "equals", "Active")
    .where("milestone", "select", "equals", "M2")
    .orderBy("startDate", "descending")
    .build();

  console.log("Example 7 - Active M2 Projects:");
  console.log(JSON.stringify(query, null, 2));
  return query;
}

/**
 * Example 8: Find high priority incomplete tasks due this week
 */
export function example8_HighPriorityTasksDueSoon() {
  const query = new QueryBuilder()
    .where("done", "checkbox", "equals", false)
    .where("priority", "select", "equals", "High")
    .where("due", "date", "next_week")
    .orderBy("due", "ascending")
    .build();

  console.log("Example 8 - High Priority Tasks Due This Week:");
  console.log(JSON.stringify(query, null, 2));
  return query;
}

/**
 * Example 9: Find all items for Engineering team in Phase P2.1
 */
export function example9_EngineeringP21Items() {
  const query = new QueryBuilder()
    .where("domain", "select", "equals", "ENG")
    .where("phase", "select", "equals", "P2.1")
    .orderByTimestamp("created_time", "descending")
    .build();

  console.log("Example 9 - Engineering P2.1 Items:");
  console.log(JSON.stringify(query, null, 2));
  return query;
}

/**
 * Example 10: Find tasks without team assignment
 */
export function example10_UnassignedTasks() {
  const query = new QueryBuilder()
    .where("team", "relation", "is_empty")
    .where("done", "checkbox", "equals", false)
    .orderBy("priority", "descending")
    .build();

  console.log("Example 10 - Unassigned Tasks:");
  console.log(JSON.stringify(query, null, 2));
  return query;
}

/**
 * Example 11: Find overdue tasks
 */
export function example11_OverdueTasks() {
  const today = new Date().toISOString().split("T")[0];

  const query = new QueryBuilder()
    .where("done", "checkbox", "equals", false)
    .where("due", "date", "before", today)
    .orderBy("due", "ascending")
    .build();

  console.log("Example 11 - Overdue Tasks:");
  console.log(JSON.stringify(query, null, 2));
  return query;
}

/**
 * Example 12: Find projects by domain and status
 */
export function example12_ProjectsByDomainAndStatus() {
  const query = new QueryBuilder()
    .or((qb) => {
      qb.where("domain", "select", "equals", "ENG")
        .where("domain", "select", "equals", "PROD");
    })
    .and((qb) => {
      qb.or((inner) => {
        inner
          .where("status", "select", "equals", "Active")
          .where("status", "select", "equals", "On Hold");
      });
    })
    .build();

  console.log("Example 12 - Projects by Domain and Status:");
  console.log(JSON.stringify(query, null, 2));
  return query;
}

// ============================================================================
// HELPER EXAMPLES
// ============================================================================

/**
 * Example 13: Using incompleteTasks helper
 */
export function example13_HelperIncompleteTasks() {
  const query = QueryBuilderHelpers.incompleteTasks()
    .orderBy("due", "ascending")
    .limit(50)
    .build();

  console.log("Example 13 - Helper: Incomplete Tasks:");
  console.log(JSON.stringify(query, null, 2));
  return query;
}

/**
 * Example 14: Using tasksDueSoon helper
 */
export function example14_HelperTasksDueSoon() {
  const query = QueryBuilderHelpers.tasksDueSoon(3)
    .where("priority", "select", "equals", "High")
    .orderBy("due", "ascending")
    .build();

  console.log("Example 14 - Helper: Tasks Due Soon (3 days):");
  console.log(JSON.stringify(query, null, 2));
  return query;
}

/**
 * Example 15: Using activeProjects helper
 */
export function example15_HelperActiveProjects() {
  const query = QueryBuilderHelpers.activeProjects()
    .where("milestone", "select", "equals", "M2")
    .orderBy("startDate", "descending")
    .build();

  console.log("Example 15 - Helper: Active M2 Projects:");
  console.log(JSON.stringify(query, null, 2));
  return query;
}

/**
 * Example 16: Using byTeam helper
 */
export function example16_HelperByTeam() {
  const query = QueryBuilderHelpers.byTeam("team-id-123")
    .where("status", "select", "equals", "Active")
    .orderBy("priority", "descending")
    .build();

  console.log("Example 16 - Helper: Tasks by Team:");
  console.log(JSON.stringify(query, null, 2));
  return query;
}

/**
 * Example 17: Using byMilestone helper
 */
export function example17_HelperByMilestone() {
  const query = QueryBuilderHelpers.byMilestone("M2")
    .where("status", "select", "equals", "Active")
    .orderByTimestamp("created_time", "descending")
    .build();

  console.log("Example 17 - Helper: M2 Milestone Items:");
  console.log(JSON.stringify(query, null, 2));
  return query;
}

// ============================================================================
// ADVANCED EXAMPLES
// ============================================================================

/**
 * Example 18: Date range filtering
 */
export function example18_DateRangeFilter() {
  const startDate = "2025-01-01";
  const endDate = "2025-01-31";

  const query = new QueryBuilder()
    .and((qb) => {
      qb.where("startDate", "date", "on_or_after", startDate)
        .where("startDate", "date", "on_or_before", endDate);
    })
    .orderBy("startDate", "ascending")
    .build();

  console.log("Example 18 - Date Range Filter:");
  console.log(JSON.stringify(query, null, 2));
  return query;
}

/**
 * Example 19: Text search with contains
 */
export function example19_TextSearch() {
  const query = new QueryBuilder()
    .where("name", "title", "contains", "Sprint")
    .where("status", "select", "equals", "Active")
    .build();

  console.log("Example 19 - Text Search:");
  console.log(JSON.stringify(query, null, 2));
  return query;
}

/**
 * Example 20: Empty/not empty checks
 */
export function example20_EmptyChecks() {
  const query = new QueryBuilder()
    .where("description", "rich_text", "is_not_empty")
    .where("team", "relation", "is_not_empty")
    .where("attachments", "files", "is_empty")
    .build();

  console.log("Example 20 - Empty/Not Empty Checks:");
  console.log(JSON.stringify(query, null, 2));
  return query;
}

/**
 * Example 21: Using factory function
 */
export function example21_FactoryFunction() {
  const query = createQueryBuilder()
    .where("status", "select", "equals", "Active")
    .orderBy("priority", "descending")
    .build();

  console.log("Example 21 - Factory Function:");
  console.log(JSON.stringify(query, null, 2));
  return query;
}

/**
 * Example 22: Reusing and resetting builder
 */
export function example22_ReuseBuilder() {
  const builder = new QueryBuilder();

  // First query
  const query1 = builder
    .where("status", "select", "equals", "Active")
    .build();
  console.log("Example 22a - First Query:");
  console.log(JSON.stringify(query1, null, 2));

  // Reset and create second query
  builder.reset();
  const query2 = builder
    .where("done", "checkbox", "equals", true)
    .orderByTimestamp("last_edited_time", "descending")
    .build();
  console.log("Example 22b - Second Query:");
  console.log(JSON.stringify(query2, null, 2));

  return { query1, query2 };
}

// ============================================================================
// RUN ALL EXAMPLES
// ============================================================================

/**
 * Run all examples
 */
export function runAllExamples() {
  console.log("\n=== QUERY BUILDER EXAMPLES ===\n");

  // Basic examples
  example1_SimpleFilter();
  console.log("\n---\n");
  example2_MultipleFilters();
  console.log("\n---\n");
  example3_OrFilter();
  console.log("\n---\n");
  example4_ComplexFilter();
  console.log("\n---\n");
  example5_Sorting();
  console.log("\n---\n");
  example6_Pagination();

  // Digital Herencia examples
  console.log("\n\n=== DIGITAL HERENCIA WORKSPACE EXAMPLES ===\n");
  example7_ActiveM2Projects();
  console.log("\n---\n");
  example8_HighPriorityTasksDueSoon();
  console.log("\n---\n");
  example9_EngineeringP21Items();
  console.log("\n---\n");
  example10_UnassignedTasks();
  console.log("\n---\n");
  example11_OverdueTasks();
  console.log("\n---\n");
  example12_ProjectsByDomainAndStatus();

  // Helper examples
  console.log("\n\n=== HELPER EXAMPLES ===\n");
  example13_HelperIncompleteTasks();
  console.log("\n---\n");
  example14_HelperTasksDueSoon();
  console.log("\n---\n");
  example15_HelperActiveProjects();
  console.log("\n---\n");
  example16_HelperByTeam();
  console.log("\n---\n");
  example17_HelperByMilestone();

  // Advanced examples
  console.log("\n\n=== ADVANCED EXAMPLES ===\n");
  example18_DateRangeFilter();
  console.log("\n---\n");
  example19_TextSearch();
  console.log("\n---\n");
  example20_EmptyChecks();
  console.log("\n---\n");
  example21_FactoryFunction();
  console.log("\n---\n");
  example22_ReuseBuilder();

  console.log("\n\n=== ALL EXAMPLES COMPLETED ===\n");
}

// Run examples if this is the main module
if (require.main === module) {
  runAllExamples();
}
