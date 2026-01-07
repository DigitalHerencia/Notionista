# [Feature] Make AGENTS.md and copilot-instructions.md authoritative

## Epic

## Alignment Epic: Notionista → Copilot-Governed Control Plane

**Issue:** 03 of 07  
**Execution Order:** Sequential (depends on Issue 02)  
**Assigned to:** GitHub Copilot (Cloud Agent)

---

## Problem Statement

Agent behavior is defined in documentation files (`AGENTS.md`, `.github/copilot-instructions.md`) but this behavioral contract is not reflected in the code structure. The documentation describes governance patterns that have no corresponding code implementation.

## Proposed Solution

Create a control/governance layer that directly reflects the behavioral contracts defined in the markdown files:

- Introduce `src/control/**` directory structure
- Create explicit schemas for proposals, approvals, audits, and validations
- Map code structure to Copilot instructions
- Treat markdown files as the authoritative behavioral contracts

## Alternative Solutions

1. Update docs to match code - **Rejected:** Code should follow docs, not vice versa
2. Keep separation - **Rejected:** Creates confusion and drift

## Use Case / Example

```typescript
// src/control/schemas/proposal.schema.ts
export interface ProposalSchema {
  id: string;
  type: 'create' | 'update' | 'delete';
  target: DatabaseTarget;
  intent: ProposalIntent;
  status: 'pending' | 'approved' | 'rejected' | 'applied';
  validation: ValidationResult;
  audit: AuditRecord;
}

// Mirrors AGENTS.md: "Propose → Approve → Apply" workflow
export interface ProposalWorkflow {
  propose: (intent: ProposalIntent) => ProposalSchema;
  validate: (proposal: ProposalSchema) => ValidationResult;
  // Note: No execute/apply - that's Copilot's responsibility
}
```

## Priority

High

---

## Scope

**Files affected:** New `src/control/**` directory

## Acceptance Criteria

- [ ] Control schemas mirror agent expectations from `AGENTS.md`
- [ ] Explicit proposal/approval states defined
- [ ] Clear mapping to Copilot instructions in `.github/copilot-instructions.md`
- [ ] No execution logic added
- [ ] Behavioral contracts from markdown are reflected in TypeScript types

## Copilot Execution Prompt

See: `.github/prompts/03-agent-aligned-control-layer.prompt.md`

## PR Output

- **PR name:** `feat/agent-aligned-control-layer`
- **Run summary:** `/docs/runs/03-agent-alignment.md`

---

## Labels

- enhancement
- triage
- control-layer
- alignment-epic

## Verification

- [x] I have searched for existing feature requests
- [x] This feature aligns with the project scope
- [x] This is part of the Alignment Epic execution plan
