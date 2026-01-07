---
mode: 'agent'
description: 'Make AGENTS.md and copilot-instructions.md authoritative - Issue 03/07'
tools: ['editFiles', 'codebase', 'terminal']
---

# Agent-Aligned Control Layer

**Epic:** Alignment Epic: Notionista → Copilot-Governed Control Plane
**Issue:** 03 of 07
**Depends on:** Issue 02 must be completed first
**PR Name:** `feat/agent-aligned-control-layer`

## Objective

Create a control/governance layer that directly reflects AGENTS.md and copilot-instructions.md. Treat the markdown files as behavioral contracts.

## Instructions

1. **Read AGENTS.md** and extract behavioral expectations
2. **Read .github/copilot-instructions.md** and extract governance rules
3. **Create `src/control/**` directory** with schemas that mirror these expectations
4. **Define explicit schemas** for proposals, approvals, audits, and validations
5. **Do not add execution logic**

## Reference Documents

- `AGENTS.md` - Agent behavioral contracts
- `.github/copilot-instructions.md` - Copilot governance rules

## Schema Examples

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

// Mirrors "Propose → Approve → Apply" workflow from AGENTS.md
export interface ProposalWorkflow {
  propose: (intent: ProposalIntent) => ProposalSchema;
  validate: (proposal: ProposalSchema) => ValidationResult;
}
```

## Acceptance Criteria

- [ ] Control schemas mirror agent expectations
- [ ] Explicit proposal/approval states defined
- [ ] Clear mapping to Copilot instructions
- [ ] No execution logic added
- [ ] Behavioral contracts reflected in TypeScript types

## Output

After completion, create:

- **PR:** `feat/agent-aligned-control-layer`
- **Run summary:** `docs/runs/03-agent-alignment.md`
