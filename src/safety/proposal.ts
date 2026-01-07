import type { DatabaseId } from '../core/types';

/**
 * Represents a single property change
 */
export interface PropertyDiff {
  property: string;
  oldValue: unknown;
  newValue: unknown;
  impact: 'low' | 'medium' | 'high';
}

/**
 * Side effects of a proposed change
 */
export interface SideEffect {
  type: 'relation_update' | 'rollup_recalc' | 'cascade';
  description: string;
  affectedItems: string[];
}

/**
 * Validation result for a proposed change
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * MCP tool that should be used to execute this proposal
 */
export type McpTool = 'post-page' | 'patch-page' | 'delete-a-block' | 'patch-block-children';

/**
 * Intent description for a proposal
 * Describes what Copilot should do to execute this proposal
 */
export interface ProposalIntent {
  description: string;
  mcpTool: McpTool;
  parameters: Record<string, unknown>;
}

/**
 * Diff summary showing before/after states
 */
export interface DiffSummary {
  before: Record<string, unknown> | null;
  after: Record<string, unknown>;
  summary: string;
}

/**
 * Risk assessment for a proposed change
 */
export interface RiskAssessment {
  level: 'low' | 'medium' | 'high';
  factors: string[];
  mitigations: string[];
}

/**
 * A declarative proposed change that describes intent only
 * NO execution methods - Copilot handles all execution
 * Implements the Propose → Approve → Apply safety workflow
 */
export interface ChangeProposal<T = unknown> {
  id: string;
  type: 'create' | 'update' | 'delete' | 'bulk';
  target: {
    database: DatabaseId;
    pageId?: string;
  };

  // Declarative intent - what should be done
  intent: ProposalIntent;

  // Diff summary - before/after comparison
  diff: DiffSummary;

  // Validation and risks
  validation: ValidationResult;
  risks: RiskAssessment;

  // Legacy fields for backward compatibility
  currentState: T | null;
  proposedState: T;
  propertyDiffs: PropertyDiff[];
  sideEffects: SideEffect[];

  // Status tracking
  status: 'pending' | 'approved' | 'applied' | 'rejected' | 'failed';
  createdAt: Date;
  appliedAt?: Date;
}

/**
 * Manages the proposal lifecycle: propose → approve → (external execution)
 *
 * This is a DECLARATIVE proposal manager - it only tracks proposal state
 * and provides descriptions of intent. It does NOT execute operations.
 * All execution is delegated to Copilot using the MCP tools specified in the intent.
 */
export class ProposalManager {
  private pendingProposals = new Map<string, ChangeProposal>();

  /**
   * Create a new declarative change proposal (does NOT execute)
   * @param change The proposed change details
   * @returns The created proposal with unique ID
   */
  propose<T>(change: Omit<ChangeProposal<T>, 'id' | 'createdAt' | 'status'>): ChangeProposal<T> {
    const proposal: ChangeProposal<T> = {
      ...change,
      id: Math.random().toString(36).substring(2) + Date.now().toString(36),
      status: 'pending',
      createdAt: new Date(),
    };

    this.pendingProposals.set(proposal.id, proposal);
    return proposal;
  }

  /**
   * Approve a proposal (marks it as ready for external execution)
   * @param proposalId The proposal ID to approve
   */
  approve(proposalId: string): void {
    const proposal = this.pendingProposals.get(proposalId);
    if (!proposal) {
      throw new Error(`Proposal ${proposalId} not found`);
    }
    if (proposal.status !== 'pending') {
      throw new Error(`Proposal ${proposalId} cannot be approved (status: ${proposal.status})`);
    }
    proposal.status = 'approved';
  }

  /**
   * Mark a proposal as applied (called after external execution)
   *
   * This does NOT execute the proposal. It only updates the status
   * after external systems have executed the MCP operation.
   *
   * @param proposalId The proposal ID to mark as applied
   */
  markApplied(proposalId: string): void {
    const proposal = this.pendingProposals.get(proposalId);
    if (!proposal) {
      throw new Error(`Proposal ${proposalId} not found`);
    }
    if (proposal.status !== 'approved') {
      throw new Error(
        `Proposal ${proposalId} must be approved before marking as applied (status: ${proposal.status})`
      );
    }
    proposal.status = 'applied';
    proposal.appliedAt = new Date();
  }

  /**
   * Mark a proposal as failed (called after external execution failure)
   *
   * @param proposalId The proposal ID to mark as failed
   */
  markFailed(proposalId: string): void {
    const proposal = this.pendingProposals.get(proposalId);
    if (!proposal) {
      throw new Error(`Proposal ${proposalId} not found`);
    }
    proposal.status = 'failed';
  }

  /**
   * Reject a pending proposal
   * @param proposalId The proposal ID to reject
   */
  reject(proposalId: string): void {
    const proposal = this.pendingProposals.get(proposalId);
    if (!proposal) {
      throw new Error(`Proposal ${proposalId} not found`);
    }
    if (proposal.status !== 'pending') {
      throw new Error(`Proposal ${proposalId} cannot be rejected (status: ${proposal.status})`);
    }
    proposal.status = 'rejected';
  }

  /**
   * Get a proposal by ID
   * @param proposalId The proposal ID
   * @returns The proposal or undefined
   */
  get(proposalId: string): ChangeProposal | undefined {
    return this.pendingProposals.get(proposalId);
  }

  /**
   * Format proposal for human review with intent and risk information
   * @param proposal The proposal to format
   * @returns Markdown-formatted review text
   */
  formatForReview<T>(proposal: ChangeProposal<T>): string {
    const lines: string[] = [
      `## Change Proposal: ${proposal.id}`,
      ``,
      `**Type**: ${proposal.type}`,
      `**Target Database**: ${proposal.target.database}`,
      `**Status**: ${proposal.status}`,
      `**Created**: ${proposal.createdAt.toISOString()}`,
      ``,
    ];

    // Intent section
    lines.push(`### Intent`);
    lines.push(``);
    lines.push(`**Description**: ${proposal.intent.description}`);
    lines.push(`**MCP Tool**: \`${proposal.intent.mcpTool}\``);
    lines.push(`**Parameters**:`);
    lines.push(`\`\`\`json`);
    lines.push(JSON.stringify(proposal.intent.parameters, null, 2));
    lines.push(`\`\`\``);
    lines.push(``);

    // Diff summary
    lines.push(`### Diff Summary`);
    lines.push(``);
    lines.push(proposal.diff.summary);
    lines.push(``);
    if (proposal.diff.before) {
      lines.push(`**Before**:`);
      lines.push(`\`\`\`json`);
      lines.push(JSON.stringify(proposal.diff.before, null, 2));
      lines.push(`\`\`\``);
    }
    lines.push(`**After**:`);
    lines.push(`\`\`\`json`);
    lines.push(JSON.stringify(proposal.diff.after, null, 2));
    lines.push(`\`\`\``);
    lines.push(``);

    // Property changes (legacy format for backward compatibility)
    if (proposal.propertyDiffs && proposal.propertyDiffs.length > 0) {
      lines.push(`### Property Changes`);
      lines.push(``);
      for (const diff of proposal.propertyDiffs) {
        lines.push(`- **${diff.property}** (${diff.impact} impact)`);
        lines.push(`  - Old: \`${JSON.stringify(diff.oldValue)}\``);
        lines.push(`  - New: \`${JSON.stringify(diff.newValue)}\``);
      }
      lines.push(``);
    }

    // Validation
    if (!proposal.validation.valid) {
      lines.push(`### ❌ Validation Errors`);
      lines.push(``);
      for (const error of proposal.validation.errors) {
        lines.push(`- ${error}`);
      }
      lines.push(``);
    }

    if (proposal.validation.warnings.length > 0) {
      lines.push(`### ⚠️ Warnings`);
      lines.push(``);
      for (const warning of proposal.validation.warnings) {
        lines.push(`- ${warning}`);
      }
      lines.push(``);
    }

    // Risk assessment
    lines.push(`### 🎯 Risk Assessment`);
    lines.push(``);
    lines.push(`**Risk Level**: ${proposal.risks.level.toUpperCase()}`);
    lines.push(``);
    if (proposal.risks.factors.length > 0) {
      lines.push(`**Risk Factors**:`);
      for (const factor of proposal.risks.factors) {
        lines.push(`- ${factor}`);
      }
      lines.push(``);
    }
    if (proposal.risks.mitigations.length > 0) {
      lines.push(`**Mitigations**:`);
      for (const mitigation of proposal.risks.mitigations) {
        lines.push(`- ${mitigation}`);
      }
      lines.push(``);
    }

    // Side effects
    if (proposal.sideEffects && proposal.sideEffects.length > 0) {
      lines.push(`### Side Effects`);
      lines.push(``);
      for (const effect of proposal.sideEffects) {
        lines.push(`- **${effect.type}**: ${effect.description}`);
        if (effect.affectedItems.length > 0) {
          lines.push(`  - Affects: ${effect.affectedItems.join(', ')}`);
        }
      }
      lines.push(``);
    }

    return lines.join('\n');
  }

  /**
   * Get all proposals with optional status filter
   * @param status Filter by status
   * @returns Array of proposals
   */
  list(status?: ChangeProposal['status']): ChangeProposal[] {
    const proposals = Array.from(this.pendingProposals.values());
    if (status) {
      return proposals.filter((p) => p.status === status);
    }
    return proposals;
  }

  /**
   * Clear all proposals (use with caution)
   */
  clear(): void {
    this.pendingProposals.clear();
  }
}
