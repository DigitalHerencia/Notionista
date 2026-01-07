import { describe, it, expect } from 'vitest';
import {
  dailyAuditWorkflow,
  taskCompletionVerificationWorkflow,
  meetingNotesUpdateWorkflow,
  projectProgressReviewWorkflow,
  workflowRegistry,
  getWorkflowById,
  findWorkflowByTrigger,
  getAllWorkflows,
  getWorkflowsByCategory,
  getWorkflowsByTag,
} from '../definitions';
import type { WorkflowDefinition } from '../definitions';

describe('Workflow Definitions', () => {
  describe('Structure Validation', () => {
    const workflows: WorkflowDefinition[] = [
      dailyAuditWorkflow,
      taskCompletionVerificationWorkflow,
      meetingNotesUpdateWorkflow,
      projectProgressReviewWorkflow,
    ];

    it.each(workflows)('$name should have valid structure', (workflow) => {
      // Required fields
      expect(workflow.id).toBeDefined();
      expect(workflow.id).toMatch(/^[a-z-]+$/);
      expect(workflow.name).toBeDefined();
      expect(workflow.name.length).toBeGreaterThan(0);

      // Triggers
      expect(Array.isArray(workflow.triggers)).toBe(true);
      expect(workflow.triggers.length).toBeGreaterThan(0);

      // Steps
      expect(Array.isArray(workflow.steps)).toBe(true);
      expect(workflow.steps.length).toBeGreaterThan(0);

      // Verification
      expect(workflow.verification).toBeDefined();
      expect(workflow.verification.description).toBeDefined();
      expect(Array.isArray(workflow.verification.checks)).toBe(true);
      expect(workflow.verification.checks.length).toBeGreaterThan(0);
    });

    it.each(workflows)('$name should have valid steps', (workflow) => {
      for (const step of workflow.steps) {
        // Phase is required and must be valid
        expect(['query', 'analysis', 'proposal']).toContain(step.phase);

        // Description is required
        expect(step.description).toBeDefined();
        expect(step.description.length).toBeGreaterThan(0);

        // Phase-specific validation
        if (step.phase === 'query' || step.phase === 'proposal') {
          expect(step.mcpTool).toBeDefined();
        }

        if (step.phase === 'analysis') {
          expect(step.pure).toBe(true);
          expect(step.function).toBeDefined();
        }
      }
    });

    it.each(workflows)('$name should have metadata', (workflow) => {
      expect(workflow.metadata).toBeDefined();
      expect(workflow.metadata?.category).toBeDefined();
      expect(workflow.metadata?.tags).toBeDefined();
      expect(Array.isArray(workflow.metadata?.tags)).toBe(true);
      expect(workflow.metadata?.version).toBeDefined();
      expect(workflow.metadata?.author).toBe('Digital Herencia');
    });
  });

  describe('Daily Audit Workflow', () => {
    it('should have correct ID and name', () => {
      expect(dailyAuditWorkflow.id).toBe('daily-audit');
      expect(dailyAuditWorkflow.name).toBe('Daily Progress Audit');
    });

    it('should have appropriate triggers', () => {
      expect(dailyAuditWorkflow.triggers).toContain('audit progress');
      expect(dailyAuditWorkflow.triggers).toContain('daily audit');
      expect(dailyAuditWorkflow.triggers).toContain('check team status');
    });

    it('should follow query → analysis pattern', () => {
      const phases = dailyAuditWorkflow.steps.map((s) => s.phase);
      expect(phases).toContain('query');
      expect(phases).toContain('analysis');

      // First steps should be queries
      expect(dailyAuditWorkflow.steps[0].phase).toBe('query');
    });

    it('should query required databases', () => {
      const mcpTools = dailyAuditWorkflow.steps
        .filter((s) => s.mcpTool)
        .map((s) => s.mcpTool);

      expect(mcpTools).toContain('query-data-source');
    });
  });

  describe('Task Completion Verification Workflow', () => {
    it('should have correct ID and name', () => {
      expect(taskCompletionVerificationWorkflow.id).toBe('task-completion-verification');
      expect(taskCompletionVerificationWorkflow.name).toBe('Task Completion Verification');
    });

    it('should have verification-related triggers', () => {
      expect(taskCompletionVerificationWorkflow.triggers).toContain('verify task completion');
      expect(taskCompletionVerificationWorkflow.triggers).toContain('check completed tasks');
    });

    it('should include integrity checks', () => {
      const analysisFunctions = taskCompletionVerificationWorkflow.steps
        .filter((s) => s.phase === 'analysis')
        .map((s) => s.function);

      expect(analysisFunctions).toContain('validateTaskCompletionIntegrity');
    });
  });

  describe('Meeting Notes Update Workflow', () => {
    it('should have correct ID and name', () => {
      expect(meetingNotesUpdateWorkflow.id).toBe('meeting-notes-update');
      expect(meetingNotesUpdateWorkflow.name).toBe('Meeting Notes Update');
    });

    it('should have meeting-related triggers', () => {
      expect(meetingNotesUpdateWorkflow.triggers).toContain('update meeting notes');
      expect(meetingNotesUpdateWorkflow.triggers).toContain('add action items');
    });

    it('should include proposal phase for updates', () => {
      const phases = meetingNotesUpdateWorkflow.steps.map((s) => s.phase);
      expect(phases).toContain('proposal');

      const proposalSteps = meetingNotesUpdateWorkflow.steps.filter(
        (s) => s.phase === 'proposal'
      );
      expect(proposalSteps.length).toBeGreaterThan(0);
    });
  });

  describe('Project Progress Review Workflow', () => {
    it('should have correct ID and name', () => {
      expect(projectProgressReviewWorkflow.id).toBe('project-progress-review');
      expect(projectProgressReviewWorkflow.name).toBe('Project Progress Review');
    });

    it('should have project-related triggers', () => {
      expect(projectProgressReviewWorkflow.triggers).toContain('review project progress');
      expect(projectProgressReviewWorkflow.triggers).toContain('check sprint status');
      expect(projectProgressReviewWorkflow.triggers).toContain('milestone progress');
    });

    it('should include analysis steps', () => {
      const analysisSteps = projectProgressReviewWorkflow.steps.filter(
        (s) => s.phase === 'analysis'
      );

      expect(analysisSteps.length).toBeGreaterThan(0);

      const functions = analysisSteps.map((s) => s.function);
      expect(functions).toContain('calculateProjectCompletionRates');
      expect(functions).toContain('identifyAtRiskProjects');
    });
  });

  describe('Workflow Registry', () => {
    it('should contain all workflows', () => {
      expect(Object.keys(workflowRegistry).length).toBe(4);
      expect(workflowRegistry['daily-audit']).toBe(dailyAuditWorkflow);
      expect(workflowRegistry['task-completion-verification']).toBe(
        taskCompletionVerificationWorkflow
      );
      expect(workflowRegistry['meeting-notes-update']).toBe(meetingNotesUpdateWorkflow);
      expect(workflowRegistry['project-progress-review']).toBe(projectProgressReviewWorkflow);
    });

    it('should retrieve workflow by ID', () => {
      const workflow = getWorkflowById('daily-audit');
      expect(workflow).toBe(dailyAuditWorkflow);
    });

    it('should return undefined for non-existent workflow', () => {
      const workflow = getWorkflowById('non-existent');
      expect(workflow).toBeUndefined();
    });

    it('should find workflow by trigger', () => {
      const workflow1 = findWorkflowByTrigger('audit progress');
      expect(workflow1).toBe(dailyAuditWorkflow);

      const workflow2 = findWorkflowByTrigger('verify task completion');
      expect(workflow2).toBe(taskCompletionVerificationWorkflow);

      const workflow3 = findWorkflowByTrigger('update meeting notes');
      expect(workflow3).toBe(meetingNotesUpdateWorkflow);

      const workflow4 = findWorkflowByTrigger('review project progress');
      expect(workflow4).toBe(projectProgressReviewWorkflow);
    });

    it('should handle case-insensitive trigger matching', () => {
      const workflow = findWorkflowByTrigger('AUDIT PROGRESS');
      expect(workflow).toBe(dailyAuditWorkflow);
    });

    it('should handle partial trigger matching', () => {
      const workflow = findWorkflowByTrigger('I need to audit progress today');
      expect(workflow).toBe(dailyAuditWorkflow);
    });

    it('should return undefined for non-matching trigger', () => {
      const workflow = findWorkflowByTrigger('something completely different');
      expect(workflow).toBeUndefined();
    });

    it('should get all workflows', () => {
      const workflows = getAllWorkflows();
      expect(workflows.length).toBe(4);
    });

    it('should filter workflows by category', () => {
      const reportingWorkflows = getWorkflowsByCategory('reporting');
      expect(reportingWorkflows).toContain(dailyAuditWorkflow);

      const validationWorkflows = getWorkflowsByCategory('validation');
      expect(validationWorkflows).toContain(taskCompletionVerificationWorkflow);

      const projectWorkflows = getWorkflowsByCategory('project-management');
      expect(projectWorkflows).toContain(projectProgressReviewWorkflow);
    });

    it('should filter workflows by tag', () => {
      const auditWorkflows = getWorkflowsByTag('audit');
      expect(auditWorkflows.length).toBeGreaterThan(0);

      const taskWorkflows = getWorkflowsByTag('task');
      expect(taskWorkflows.length).toBeGreaterThan(0);

      const meetingWorkflows = getWorkflowsByTag('meeting');
      expect(meetingWorkflows).toContain(meetingNotesUpdateWorkflow);
    });
  });

  describe('Pure Data Structures', () => {
    it('should not contain executable functions', () => {
      const workflows = getAllWorkflows();

      for (const workflow of workflows) {
        for (const step of workflow.steps) {
          // Ensure no executable code, only references
          if (step.function) {
            expect(typeof step.function).toBe('string');
          }

          // Ensure parameters are plain data
          if (step.parameters) {
            expect(typeof step.parameters).toBe('object');
          }
        }
      }
    });

    it('should be JSON serializable', () => {
      const workflows = getAllWorkflows();

      for (const workflow of workflows) {
        // Should be able to serialize and deserialize
        const json = JSON.stringify(workflow);
        const parsed = JSON.parse(json);

        expect(parsed.id).toBe(workflow.id);
        expect(parsed.name).toBe(workflow.name);
        expect(parsed.steps.length).toBe(workflow.steps.length);
      }
    });
  });
});
