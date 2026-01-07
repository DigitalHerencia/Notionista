/**
 * Control Layer Schemas
 *
 * Agent-aligned control schemas that mirror behavioral expectations from:
 * - Agents.md (formerly referenced as AGENTS.md)
 * - .github/copilot-instructions.md
 *
 * These schemas define the control/governance layer without execution logic.
 * They serve as behavioral contracts for Copilot agents and SDK operations.
 *
 * @module control/schemas
 */

// Proposal schemas - Propose → Approve → Apply workflow
export {
  DatabaseTargetSchema,
  OperationTypeSchema,
  ProposalStatusSchema,
  PropertyDiffSchema,
  SideEffectSchema,
  ValidationResultSchema as ProposalValidationResultSchema,
  ProposalIntentSchema,
  AuditRecordSchema,
  ProposalSchema,
  ProposalSummarySchema,
  type DatabaseTarget,
  type OperationType,
  type ProposalStatus,
  type PropertyDiff,
  type SideEffect,
  type ValidationResult as ProposalValidationResult,
  type ProposalIntent,
  type AuditRecord,
  type Proposal,
  type ProposalWorkflow,
  type ProposalSummary,
} from './proposal.schema';

// Validation schemas - Data validation and constraints
export {
  ValidationRuleTypeSchema,
  FieldTypeSchema,
  ValidationSeveritySchema,
  ValidationRuleSchema,
  ValidationIssueSchema,
  ValidationContextSchema,
  ValidationResultSchema,
  DatabaseSchemaSchema,
  PreChangeChecklistSchema as ValidationPreChangeChecklistSchema,
  ValidationPolicySchema,
  type ValidationRuleType,
  type FieldType,
  type ValidationSeverity,
  type ValidationRule,
  type ValidationIssue,
  type ValidationContext,
  type ValidationResult,
  type DatabaseSchema,
  type PreChangeChecklist as ValidationPreChangeChecklist,
  type ValidationPolicy,
} from './validation.schema';

// Audit schemas - Governance and audit trail
export {
  AuditEventTypeSchema,
  ActorTypeSchema,
  ActorSchema,
  AuditEventSchema,
  AuditTrailSchema,
  AuditLogEntrySchema,
  ChangeRecordSchema,
  GovernanceReportSchema,
  AuditQuerySchema,
  type AuditEventType,
  type ActorType,
  type Actor,
  type AuditEvent,
  type AuditTrail,
  type AuditLogEntry,
  type ChangeRecord,
  type GovernanceReport,
  type AuditQuery,
} from './audit.schema';

// Governance schemas - Rules and policies
export {
  PermissionLevelSchema,
  OperationCategorySchema,
  GovernanceRuleSchema,
  DefaultGovernancePolicySchema,
  SafetyWorkflowConfigSchema,
  PreChangeChecklistItemSchema,
  PreChangeChecklistSchema as GovernancePreChangeChecklistSchema,
  GovernanceViolationSchema,
  GovernancePolicySchema,
  PermissionCheckResultSchema,
  type PermissionLevel,
  type OperationCategory,
  type GovernanceRule,
  type DefaultGovernancePolicy,
  type SafetyWorkflowConfig,
  type PreChangeChecklistItem,
  type PreChangeChecklist as GovernancePreChangeChecklist,
  type GovernanceViolation,
  type GovernancePolicy,
  type PermissionCheckResult,
} from './governance.schema';

// Workflow schemas - Sprint cycles and team workflows
export {
  WorkflowTypeSchema,
  WorkflowStateSchema,
  SprintPhaseSchema,
  MilestoneSchema,
  ProjectStatusSchema,
  TaskPrioritySchema,
  MeetingTypeSchema,
  MeetingCadenceSchema,
  DomainSchema,
  WorkflowStepSchema,
  WorkflowDefinitionSchema,
  SprintCycleWorkflowSchema,
  ProjectLifecycleSchema,
  TaskLifecycleSchema,
  WorkflowTransitionSchema,
  WorkflowExecutionSchema,
  type WorkflowType,
  type WorkflowState,
  type SprintPhase,
  type Milestone,
  type ProjectStatus,
  type TaskPriority,
  type MeetingType,
  type MeetingCadence,
  type Domain,
  type WorkflowStep,
  type WorkflowDefinition,
  type SprintCycleWorkflow,
  type ProjectLifecycle,
  type TaskLifecycle,
  type WorkflowTransition,
  type WorkflowExecution,
} from './workflow.schema';

// Target schemas - Database entities and naming conventions
export {
  TeamTargetSchema,
  ProjectTargetSchema,
  TaskTargetSchema,
  MeetingTargetSchema,
  PromptTargetSchema,
  TechStackTargetSchema,
  TemplateTargetSchema,
  SOPTargetSchema,
  CalendarTargetSchema,
  DatabaseTargetUnionSchema,
  TargetIdentifierSchema,
  NamingConventionsSchema,
  type TeamTarget,
  type ProjectTarget,
  type TaskTarget,
  type MeetingTarget,
  type PromptTarget,
  type TechStackTarget,
  type TemplateTarget,
  type SOPTarget,
  type CalendarTarget,
  type DatabaseTargetUnion,
  type TargetIdentifier,
  type NamingConventions,
} from './targets.schema';

// Change request schemas - Change patterns and templates
export {
  ChangeRequestTypeSchema,
  CreateProjectRequestSchema,
  CreateTaskRequestSchema,
  MarkTaskDoneRequestSchema,
  ScheduleMeetingRequestSchema,
  QueryTasksRequestSchema,
  UpdateProjectStatusRequestSchema,
  AssignTaskRequestSchema,
  AddRelationRequestSchema,
  RemoveRelationRequestSchema,
  BulkCreateRequestSchema,
  BulkUpdateRequestSchema,
  ChangeRequestSchema,
  ChangeRequestTemplateSchema,
  DEFAULT_TEMPLATES,
  type ChangeRequestType,
  type CreateProjectRequest,
  type CreateTaskRequest,
  type MarkTaskDoneRequest,
  type ScheduleMeetingRequest,
  type QueryTasksRequest,
  type UpdateProjectStatusRequest,
  type AssignTaskRequest,
  type AddRelationRequest,
  type RemoveRelationRequest,
  type BulkCreateRequest,
  type BulkUpdateRequest,
  type ChangeRequest,
  type ChangeRequestTemplate,
} from './changes.schema';
