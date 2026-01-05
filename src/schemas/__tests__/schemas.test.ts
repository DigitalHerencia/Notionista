import { describe, it, expect } from 'vitest';
import { TeamSchema, ProjectSchema, TaskSchema, MeetingSchema } from '../index.js';

describe('Schemas', () => {
  describe('TeamSchema', () => {
    it('should validate a valid team', () => {
      const team = {
        id: 'test-id',
        name: 'Engineering Team',
        meetings: [],
        projects: [],
        tasks: [],
      };
      expect(() => TeamSchema.parse(team)).not.toThrow();
    });

    it('should reject invalid team', () => {
      const team = {
        id: 'test-id',
      };
      expect(() => TeamSchema.parse(team)).toThrow();
    });
  });

  describe('ProjectSchema', () => {
    it('should validate a valid project', () => {
      const project = {
        id: 'test-id',
        name: 'Test Project',
        status: 'Active',
        milestone: 'M1',
        phase: 'P1.1',
        domain: 'ENG',
        startDate: '2024-01-01',
        endDate: '2024-01-15',
        taskIds: [],
      };
      expect(() => ProjectSchema.parse(project)).not.toThrow();
    });

    it('should allow nullable fields', () => {
      const project = {
        id: 'test-id',
        name: 'Test Project',
        status: 'Active',
        milestone: null,
        phase: null,
        domain: null,
        startDate: null,
        endDate: null,
        taskIds: [],
      };
      expect(() => ProjectSchema.parse(project)).not.toThrow();
    });
  });

  describe('TaskSchema', () => {
    it('should validate a valid task', () => {
      const task = {
        id: 'test-id',
        name: 'Test Task',
        done: false,
        due: '2024-01-01',
        priority: 'High',
      };
      expect(() => TaskSchema.parse(task)).not.toThrow();
    });

    it('should validate task with all fields', () => {
      const task = {
        id: 'test-id',
        name: 'Test Task',
        done: true,
        taskCode: 'TASK-001',
        due: null,
        priority: null,
        projectId: 'project-id',
        teamId: 'team-id',
      };
      expect(() => TaskSchema.parse(task)).not.toThrow();
    });
  });

  describe('MeetingSchema', () => {
    it('should validate a valid meeting', () => {
      const meeting = {
        id: 'test-id',
        name: 'Daily Standup',
        type: 'Standup',
        cadence: 'Daily',
        date: '2024-01-01',
        attendeeTeamIds: [],
        actionItemTaskIds: [],
        projectIds: [],
        teamIds: [],
      };
      expect(() => MeetingSchema.parse(meeting)).not.toThrow();
    });

    it('should allow nullable fields', () => {
      const meeting = {
        id: 'test-id',
        name: 'Ad Hoc Meeting',
        type: 'Ad Hoc',
        cadence: null,
        date: null,
        attendeeTeamIds: [],
        actionItemTaskIds: [],
        projectIds: [],
        teamIds: [],
      };
      expect(() => MeetingSchema.parse(meeting)).not.toThrow();
    });
  });
});
