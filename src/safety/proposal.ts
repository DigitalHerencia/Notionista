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
 * A proposed change that must be approved before execution
 * Implements the Propose → Approve → Apply safety workflow
 */
export interface ChangeProposal<T = unknown> {
  id: string;
  type: 'create' | 'update' | 'delete' | 'bulk';
  target: {
    database: DatabaseId;
    pageId?: string;
  };
  currentState: T | null;
  proposedState: T;
  diff: PropertyDiff[];
  sideEffects: SideEffect[];
  validation: ValidationResult;
  status: 'pending' | 'approved' | 'applied' | 'rejected' | 'failed';
  createdAt: Date;
  appliedAt?: Date;
}

/**
 * Result of applying a proposal
 */
export interface ApplyResult {
  proposalId: string;
  success: boolean;
  entityId?: string;
  error?: Error;
  timestamp: Date;
}

/**
 * Manages the proposal lifecycle: propose → approve → apply
 */
export class ProposalManager {
  private pendingProposals = new Map<string, ChangeProposal>();

  /**
   * Create a new change proposal (does NOT execute)
   * @param change The proposed change details
   * @returns The created proposal with unique ID
   */
  async propose<T>(change: Omit<ChangeProposal<T>, 'id' | 'createdAt' | 'status'>): Promise<ChangeProposal<T>> {
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
   * Approve a proposal for execution
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
   * Execute an approved proposal
   * @param proposalId The proposal ID to apply
   * @param executor Function that performs the actual change
   * @returns Result of the application
   */
  async apply(
    proposalId: string,
    executor: (proposal: ChangeProposal) => Promise<string>
  ): Promise<ApplyResult> {
    const proposal = this.pendingProposals.get(proposalId);
    if (!proposal) {
      throw new Error(`Proposal ${proposalId} not found`);
    }
    if (proposal.status !== 'approved') {
      throw new Error(`Proposal ${proposalId} must be approved before applying (status: ${proposal.status})`);
    }

    try {
      const entityId = await executor(proposal);
      proposal.status = 'applied';
      proposal.appliedAt = new Date();

      return {
        proposalId,
        success: true,
        entityId,
        timestamp: new Date(),
      };
    } catch (error) {
      proposal.status = 'failed';
      return {
        proposalId,
        success: false,
        error: error as Error,
        timestamp: new Date(),
      };
    }
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
   * Format proposal for human review
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

    if (proposal.diff.length > 0) {
      lines.push(`### Property Changes`);
      lines.push(``);
      for (const diff of proposal.diff) {
        lines.push(`- **${diff.property}** (${diff.impact} impact)`);
        lines.push(`  - Old: \`${JSON.stringify(diff.oldValue)}\``);
        lines.push(`  - New: \`${JSON.stringify(diff.newValue)}\``);
      }
      lines.push(``);
    }

    if (proposal.sideEffects.length > 0) {
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
