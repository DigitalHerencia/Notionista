import { describe, it, expect, vi } from 'vitest';
import { SprintCycleWorkflow } from '../sprint-cycle';
import type { IProjectRepository, ITaskRepository, IMeetingRepository } from '../../domain/repositories';
import type { ChangeProposal } from '../../safety';
import type { Project, Task, Meeting } from '../../schemas';

describe('SprintCycleWorkflow', () => {
  // Mock repositories
  const mockProjectRepo: IProjectRepository = {
    findById: vi.fn(),
    findByTeam: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
  };

  const mockTaskRepo: ITaskRepository = {
    findById: vi.fn(),
    findByTeam: vi.fn(),
    findByProject: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
  };

  const mockMeetingRepo: IMeetingRepository = {
    findById: vi.fn(),
    findByTeam: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
  };

  it('should create a sprint proposal with project, tasks, and meetings', async () => {
    const workflow = new SprintCycleWorkflow(mockProjectRepo, mockTaskRepo, mockMeetingRepo);

    // Mock the create methods to return proposals
    const mockProjectProposal: ChangeProposal<Project> = {
      id: 'proposal-1',
      type: 'create',
      target: { database: '2d5a4e63-bf23-81b1-b507-f5ac308958e6' },
      currentState: null,
      proposedState: {
        id: 'project-1',
        name: 'Test Sprint',
        status: 'Active',
        milestone: 'M1',
        phase: 'P1.1',
        domain: 'ENG',
        startDate: '2026-01-06T00:00:00.000Z',
        endDate: '2026-01-20T00:00:00.000Z',
        teamId: 'team-1',
        taskIds: [],
      },
      diff: [],
      sideEffects: [],
      validation: { valid: true, errors: [], warnings: [] },
      status: 'pending',
      createdAt: new Date(),
    };

    vi.mocked(mockProjectRepo.create).mockResolvedValue(mockProjectProposal);

    const mockTaskProposal: ChangeProposal<Task> = {
      id: 'task-proposal-1',
      type: 'create',
      target: { database: '2d5a4e63-bf23-816f-a217-ef754ce4a70e' },
      currentState: null,
      proposedState: {
        id: 'task-1',
        name: 'Test task',
        done: false,
        due: null,
        priority: 'High',
        projectId: 'project-1',
        teamId: 'team-1',
      },
      diff: [],
      sideEffects: [],
      validation: { valid: true, errors: [], warnings: [] },
      status: 'pending',
      createdAt: new Date(),
    };

    vi.mocked(mockTaskRepo.create).mockResolvedValue(mockTaskProposal);

    const mockMeetingProposal: ChangeProposal<Meeting> = {
      id: 'meeting-proposal-1',
      type: 'create',
      target: { database: '2d5a4e63-bf23-8168-af99-d85e20bfb76f' },
      currentState: null,
      proposedState: {
        id: 'meeting-1',
        name: 'Sprint Planning - Test Sprint',
        type: 'Sprint Planning',
        cadence: 'Biweekly',
        date: '2026-01-06T00:00:00.000Z',
        teamIds: ['team-1'],
        projectIds: ['project-1'],
        attendeeTeamIds: [],
        actionItemTaskIds: [],
      },
      diff: [],
      sideEffects: [],
      validation: { valid: true, errors: [], warnings: [] },
      status: 'pending',
      createdAt: new Date(),
    };

    vi.mocked(mockMeetingRepo.create).mockResolvedValue(mockMeetingProposal);

    const config = {
      teamId: 'team-1',
      name: 'Test Sprint',
      startDate: new Date('2026-01-06'),
      endDate: new Date('2026-01-20'),
      milestone: 'M1' as const,
      phase: 'P1.1' as const,
      domain: 'ENG' as const,
      tasks: [
        {
          name: 'Test task',
          done: false,
          due: null,
          priority: 'High' as const,
          teamId: 'team-1',
        },
      ],
    };

    const proposal = await workflow.planSprint(config);

    expect(proposal.project).toBeDefined();
    expect(proposal.tasks).toHaveLength(1);
    expect(proposal.meetings).toHaveLength(3); // Planning, Standup, Post-mortem
    expect(proposal.summary.projectName).toBe('Test Sprint');
    expect(proposal.summary.taskCount).toBe(1);
    expect(proposal.summary.meetingCount).toBe(3);
  });

  it('should validate sprint configuration', async () => {
    const workflow = new SprintCycleWorkflow(mockProjectRepo, mockTaskRepo, mockMeetingRepo);

    const invalidConfig = {
      teamId: '',
      name: '',
      startDate: new Date('2026-01-20'),
      endDate: new Date('2026-01-06'), // End before start
      milestone: 'M1' as const,
      phase: 'P1.1' as const,
      domain: 'ENG' as const,
      tasks: [],
    };

    await expect(workflow.planSprint(invalidConfig)).rejects.toThrow();
  });

  it('should format sprint proposal for review', async () => {
    const workflow = new SprintCycleWorkflow(mockProjectRepo, mockTaskRepo, mockMeetingRepo);

    const mockProposal = {
      project: {
        id: 'proposal-1',
        proposedState: {
          id: 'project-1',
          name: 'Test Sprint',
          status: 'Active',
          startDate: '2026-01-06',
          endDate: '2026-01-20',
        },
      },
      tasks: [
        {
          id: 'task-1',
          proposedState: {
            name: 'Task 1',
            priority: 'High',
            due: '2026-01-10',
          },
        },
      ],
      meetings: [
        {
          id: 'meeting-1',
          proposedState: {
            name: 'Sprint Planning',
            type: 'Sprint Planning',
            date: '2026-01-06',
          },
        },
      ],
      summary: {
        projectName: 'Test Sprint',
        teamId: 'team-1',
        duration: '14 days',
        taskCount: 1,
        meetingCount: 1,
        milestone: 'M1',
        phase: 'P1.1',
      },
    } as any;

    const formatted = workflow.formatForReview(mockProposal);

    expect(formatted).toContain('Test Sprint');
    expect(formatted).toContain('Task 1');
    expect(formatted).toContain('Sprint Planning');
    expect(formatted).toContain('14 days');
  });
});
