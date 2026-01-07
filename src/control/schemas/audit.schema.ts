import { z } from 'zod';

/**
 * Audit Schema
 *
 * Tracks all changes for governance and compliance
 * Implements audit trail requirements from copilot-instructions.md
 */

/**
 * Audit event types
 */
export const AuditEventTypeSchema = z.enum([
  'proposal_created',
  'proposal_approved',
  'proposal_rejected',
  'proposal_applied',
  'proposal_failed',
  'validation_performed',
  'query_executed',
  'bulk_operation_initiated',
  'side_effect_detected',
  'rollback_performed',
]);

export type AuditEventType = z.infer<typeof AuditEventTypeSchema>;

/**
 * Actor type (who performed the action)
 */
export const ActorTypeSchema = z.enum([
  'user', // Human user
  'copilot', // GitHub Copilot agent
  'system', // Automated system process
  'mcp-server', // MCP server action
]);

export type ActorType = z.infer<typeof ActorTypeSchema>;

/**
 * Actor information
 */
export const ActorSchema = z.object({
  type: ActorTypeSchema,
  id: z.string(),
  name: z.string().optional(),
  email: z.string().optional(),
});

export type Actor = z.infer<typeof ActorSchema>;

/**
 * Audit event
 */
export const AuditEventSchema = z.object({
  id: z.string(),
  eventType: AuditEventTypeSchema,
  timestamp: z.date(),
  actor: ActorSchema,
  target: z.object({
    database: z.string(),
    pageId: z.string().optional(),
    pageIds: z.array(z.string()).optional(),
  }),
  action: z.string(), // Human-readable action description
  details: z.record(z.string(), z.unknown()).optional(),
  result: z.enum(['success', 'failure', 'pending']).optional(),
  error: z.string().optional(),
});

export type AuditEvent = z.infer<typeof AuditEventSchema>;

/**
 * Audit trail
 * Complete history of a proposal or operation
 */
export const AuditTrailSchema = z.object({
  proposalId: z.string().optional(),
  events: z.array(AuditEventSchema),
  startedAt: z.date(),
  completedAt: z.date().optional(),
  status: z.enum(['in-progress', 'completed', 'failed']),
});

export type AuditTrail = z.infer<typeof AuditTrailSchema>;

/**
 * Audit log entry
 * Individual log entry in the audit system
 */
export const AuditLogEntrySchema = z.object({
  id: z.string(),
  timestamp: z.date(),
  level: z.enum(['debug', 'info', 'warning', 'error']),
  category: z.enum([
    'proposal',
    'validation',
    'execution',
    'governance',
    'security',
    'performance',
  ]),
  message: z.string(),
  data: z.record(z.string(), z.unknown()).optional(),
  correlationId: z.string().optional(), // Links related events
});

export type AuditLogEntry = z.infer<typeof AuditLogEntrySchema>;

/**
 * Change record
 * Documents a specific change that was made
 */
export const ChangeRecordSchema = z.object({
  id: z.string(),
  proposalId: z.string(),
  timestamp: z.date(),
  database: z.string(),
  pageId: z.string(),
  operation: z.enum(['create', 'update', 'delete']),
  changes: z.array(
    z.object({
      field: z.string(),
      oldValue: z.unknown().nullable(),
      newValue: z.unknown().nullable(),
    })
  ),
  actor: ActorSchema,
  verified: z.boolean().default(false), // Post-change verification performed
});

export type ChangeRecord = z.infer<typeof ChangeRecordSchema>;

/**
 * Governance report
 * Summary of governance compliance
 */
export const GovernanceReportSchema = z.object({
  period: z.object({
    start: z.date(),
    end: z.date(),
  }),
  totalProposals: z.number(),
  approvedProposals: z.number(),
  rejectedProposals: z.number(),
  failedProposals: z.number(),
  averageApprovalTime: z.number().optional(), // milliseconds
  complianceRate: z.number(), // percentage
  violations: z.array(
    z.object({
      type: z.string(),
      count: z.number(),
      severity: z.enum(['low', 'medium', 'high', 'critical']),
    })
  ),
  recommendations: z.array(z.string()),
});

export type GovernanceReport = z.infer<typeof GovernanceReportSchema>;

/**
 * Audit query
 * For searching/filtering audit logs
 */
export const AuditQuerySchema = z.object({
  eventType: AuditEventTypeSchema.optional(),
  actor: z.string().optional(),
  database: z.string().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  result: z.enum(['success', 'failure']).optional(),
  limit: z.number().default(100),
  offset: z.number().default(0),
});

export type AuditQuery = z.infer<typeof AuditQuerySchema>;
