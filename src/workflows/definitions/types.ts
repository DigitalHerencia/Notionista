/**
 * Core types for natural language workflow definitions
 *
 * These types define the structure of declarative workflows that map
 * natural language intents to structured query → proposal → verification steps.
 */

/**
 * A single step in a workflow
 */
export interface WorkflowStep {
  /**
   * Phase of the workflow step
   * - query: Retrieve data from Notion
   * - analysis: Process/calculate data (pure functions)
   * - proposal: Generate change proposals
   */
  phase: 'query' | 'analysis' | 'proposal';

  /**
   * Human-readable description of what this step does
   */
  description: string;

  /**
   * MCP tool to invoke (for query/proposal phases)
   * Examples: 'query-data-source', 'post-page', 'patch-page'
   */
  mcpTool?: string;

  /**
   * Parameters to pass to the MCP tool
   */
  parameters?: Record<string, unknown>;

  /**
   * For analysis phase: indicates this is a pure function
   */
  pure?: boolean;

  /**
   * For analysis phase: name of the pure function to call
   */
  function?: string;

  /**
   * Variable name to store the output of this step
   * Used for referencing data in subsequent steps
   */
  output?: string;
}

/**
 * Verification checks for a workflow
 */
export interface WorkflowVerification {
  /**
   * Description of what should be verified
   */
  description: string;

  /**
   * List of verification checks to perform
   */
  checks: string[];
}

/**
 * Complete workflow definition
 */
export interface WorkflowDefinition {
  /**
   * Unique identifier for the workflow
   */
  id: string;

  /**
   * Human-readable name
   */
  name: string;

  /**
   * Natural language patterns that trigger this workflow
   */
  triggers: string[];

  /**
   * Ordered sequence of steps to execute
   */
  steps: WorkflowStep[];

  /**
   * Verification requirements
   */
  verification: WorkflowVerification;

  /**
   * Optional metadata
   */
  metadata?: {
    /**
     * Category/domain of this workflow
     */
    category?: string;

    /**
     * Tags for classification
     */
    tags?: string[];

    /**
     * Version of this workflow definition
     */
    version?: string;

    /**
     * Author/creator
     */
    author?: string;
  };
}
