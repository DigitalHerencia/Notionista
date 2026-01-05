#!/usr/bin/env node
/**
 * Example: Parse a single CSV file
 * 
 * This example demonstrates how to parse individual CSV files
 * and inspect the extracted data.
 */

import { CsvSnapshotParser } from "../dist/index.js";

async function main() {
  const parser = new CsvSnapshotParser();

  console.log("📄 CSV Parser Example\n");

  // Parse the test fixture
  const csvPath = "./test/fixtures/tasks.csv";
  console.log(`Parsing: ${csvPath}\n`);

  try {
    const records = parser.parse(csvPath);

    console.log(`✅ Parsed ${records.length} records\n`);

    // Display each record
    records.forEach((record, index) => {
      console.log(`Record ${index + 1}:`);
      console.log(`  ID: ${record.id}`);
      console.log(`  Source: ${record.source}`);
      console.log(`  Properties:`);
      
      for (const [key, value] of Object.entries(record.properties)) {
        if (value === null) {
          console.log(`    ${key}: (empty)`);
        } else if (typeof value === "boolean") {
          console.log(`    ${key}: ${value ? "✓" : "✗"}`);
        } else if (Array.isArray(value)) {
          console.log(`    ${key}: [${value.length} items]`);
          value.forEach((item) => {
            console.log(`      - ${item}`);
          });
        } else {
          console.log(`    ${key}: ${value}`);
        }
      }
      console.log();
    });

  } catch (error) {
    console.error(`❌ Error parsing CSV: ${error}`);
  }
}

main().catch(console.error);
