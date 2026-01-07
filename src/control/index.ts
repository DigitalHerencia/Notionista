/**
 * Control Layer
 *
 * Agent-Aligned Control/Governance Layer for Notionista SDK
 *
 * This module provides declarative schemas that mirror behavioral expectations
 * from AGENTS.md and .github/copilot-instructions.md. It implements the
 * Propose → Approve → Apply workflow and governance rules as TypeScript types.
 *
 * ## Key Principles
 *
 * 1. **Behavioral Contracts**: Schemas reflect agent expectations, not implementation
 * 2. **No Execution Logic**: Control layer defines structure, not behavior
 * 3. **Type Safety**: Full TypeScript support with Zod validation
 * 4. **Governance First**: All changes flow through control layer
 *
 * ## Workflow
 *
 * The control layer enforces the safety workflow from copilot-instructions.md:
 *
 * 1. **Propose**: Create a proposal with validation and side effect analysis
 * 2. **Approve**: User reviews and approves with explicit "Approved" response
 * 3. **Apply**: External systems execute MCP operations
 * 4. **Verify**: Re-query to confirm changes were applied correctly
 *
 * ## Modules
 *
 * - **proposal**: Proposal lifecycle and workflow schemas
 * - **validation**: Validation rules and constraints
 * - **audit**: Audit trail and governance reporting
 * - **governance**: Permission rules and policies
 * - **workflow**: Sprint cycles and team workflows
 * - **targets**: Database entity schemas and naming conventions
 * - **changes**: Change request types and templates
 *
 * ## Usage
 *
 * ```typescript
 * import {
 *   ProposalSchema,
 *   ValidationResultSchema,
 *   GovernancePolicySchema,
 * } from 'notionista/control';
 *
 * // Validate a proposal
 * const proposal = ProposalSchema.parse(data);
 *
 * // Check governance rules
 * const policy = GovernancePolicySchema.parse(config);
 * ```
 *
 * @module control
 * @see {@link AGENTS.md} for agent behavioral contracts
 * @see {@link .github/copilot-instructions.md} for governance rules
 */

export * from './schemas';
