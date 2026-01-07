/**
 * Natural Language Workflow Definitions - Usage Examples
 *
 * This file demonstrates how to use the workflow definitions
 * to map natural language intents to structured operations.
 */

import {
  findWorkflowByTrigger,
  getWorkflowById,
  getAllWorkflows,
  getWorkflowsByCategory,
  getWorkflowsByTag,
  type WorkflowDefinition,
} from '../src/workflows/definitions/index.js';

// ============================================================================
// Example 1: Find workflow by natural language trigger
// ============================================================================

function example1_findByNaturalLanguage() {
  console.log('=== Example 1: Find Workflow by Natural Language ===\n');

  const userInput = 'I need to audit progress for today';

  const workflow = findWorkflowByTrigger(userInput);

  if (workflow) {
    console.log(`Found workflow: ${workflow.name}`);
    console.log(`ID: ${workflow.id}`);
    console.log(`Steps: ${workflow.steps.length}`);
    console.log(`\nTriggers that match this workflow:`);
    workflow.triggers.forEach((trigger) => console.log(`  - "${trigger}"`));
  } else {
    console.log('No workflow found for this trigger');
  }
}

// ============================================================================
// Example 2: Inspect workflow steps
// ============================================================================

function example2_inspectWorkflowSteps() {
  console.log('\n=== Example 2: Inspect Workflow Steps ===\n');

  const workflow = getWorkflowById('daily-audit');

  if (workflow) {
    console.log(`Workflow: ${workflow.name}\n`);

    workflow.steps.forEach((step, index) => {
      console.log(`Step ${index + 1} [${step.phase}]:`);
      console.log(`  Description: ${step.description}`);

      if (step.mcpTool) {
        console.log(`  MCP Tool: ${step.mcpTool}`);
      }

      if (step.function) {
        console.log(`  Function: ${step.function}`);
      }

      if (step.output) {
        console.log(`  Output Variable: ${step.output}`);
      }

      console.log('');
    });

    console.log('Verification Requirements:');
    console.log(`  ${workflow.verification.description}`);
    workflow.verification.checks.forEach((check) => {
      console.log(`  ✓ ${check}`);
    });
  }
}

// ============================================================================
// Example 3: Browse workflows by category
// ============================================================================

function example3_browseByCategory() {
  console.log('\n=== Example 3: Browse Workflows by Category ===\n');

  const categories = ['reporting', 'validation', 'meeting-management', 'project-management'];

  categories.forEach((category) => {
    const workflows = getWorkflowsByCategory(category);
    console.log(`${category}:`);
    workflows.forEach((w) => console.log(`  - ${w.name}`));
  });
}

// ============================================================================
// Example 4: Search workflows by tags
// ============================================================================

function example4_searchByTags() {
  console.log('\n=== Example 4: Search Workflows by Tags ===\n');

  const tags = ['audit', 'task', 'meeting', 'progress'];

  tags.forEach((tag) => {
    const workflows = getWorkflowsByTag(tag);
    console.log(`Workflows tagged with "${tag}":`);
    workflows.forEach((w) => console.log(`  - ${w.name} (${w.id})`));
    console.log('');
  });
}

// ============================================================================
// Example 5: Generate execution plan from workflow
// ============================================================================

function example5_generateExecutionPlan() {
  console.log('\n=== Example 5: Generate Execution Plan ===\n');

  const workflow = getWorkflowById('project-progress-review');

  if (workflow) {
    console.log(`Execution Plan for: ${workflow.name}\n`);

    // Group steps by phase
    const querySteps = workflow.steps.filter((s) => s.phase === 'query');
    const analysisSteps = workflow.steps.filter((s) => s.phase === 'analysis');
    const proposalSteps = workflow.steps.filter((s) => s.phase === 'proposal');

    console.log('PHASE 1: Data Collection (Query)');
    querySteps.forEach((step) => {
      console.log(`  → ${step.description}`);
      if (step.mcpTool) {
        console.log(`    Tool: ${step.mcpTool}`);
      }
    });

    console.log('\nPHASE 2: Data Processing (Analysis)');
    analysisSteps.forEach((step) => {
      console.log(`  → ${step.description}`);
      if (step.function) {
        console.log(`    Function: ${step.function}`);
      }
    });

    if (proposalSteps.length > 0) {
      console.log('\nPHASE 3: Change Proposal');
      proposalSteps.forEach((step) => {
        console.log(`  → ${step.description}`);
        if (step.mcpTool) {
          console.log(`    Tool: ${step.mcpTool}`);
        }
      });
    }
  }
}

// ============================================================================
// Example 6: Serialize workflow to JSON
// ============================================================================

function example6_serializeWorkflow() {
  console.log('\n=== Example 6: Serialize Workflow to JSON ===\n');

  const workflow = getWorkflowById('task-completion-verification');

  if (workflow) {
    // Workflows are pure data structures, fully serializable
    const json = JSON.stringify(workflow, null, 2);

    console.log(`Workflow "${workflow.name}" serialized:`);
    console.log(json.substring(0, 500) + '...\n');

    // Can be deserialized back
    const deserialized = JSON.parse(json) as WorkflowDefinition;
    console.log(`Deserialized workflow ID: ${deserialized.id}`);
    console.log(`Deserialized steps: ${deserialized.steps.length}`);
  }
}

// ============================================================================
// Example 7: List all available workflows
// ============================================================================

function example7_listAllWorkflows() {
  console.log('\n=== Example 7: List All Available Workflows ===\n');

  const workflows = getAllWorkflows();

  console.log(`Total workflows: ${workflows.length}\n`);

  workflows.forEach((workflow) => {
    console.log(`${workflow.name}`);
    console.log(`  ID: ${workflow.id}`);
    console.log(`  Category: ${workflow.metadata?.category || 'N/A'}`);
    console.log(`  Tags: ${workflow.metadata?.tags?.join(', ') || 'N/A'}`);
    console.log(`  Steps: ${workflow.steps.length}`);
    console.log(`  Triggers: ${workflow.triggers.length}`);
    console.log('');
  });
}

// ============================================================================
// Run all examples
// ============================================================================

export function runWorkflowExamples() {
  console.log('\n' + '='.repeat(70));
  console.log('NATURAL LANGUAGE WORKFLOW DEFINITIONS - EXAMPLES');
  console.log('='.repeat(70));

  example1_findByNaturalLanguage();
  example2_inspectWorkflowSteps();
  example3_browseByCategory();
  example4_searchByTags();
  example5_generateExecutionPlan();
  example6_serializeWorkflow();
  example7_listAllWorkflows();

  console.log('\n' + '='.repeat(70));
  console.log('END OF EXAMPLES');
  console.log('='.repeat(70) + '\n');
}

// Uncomment to run examples:
// runWorkflowExamples();
