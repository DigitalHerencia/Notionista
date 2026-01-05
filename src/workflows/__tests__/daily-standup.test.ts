import { describe, it, expect, vi } from 'vitest';
import { DailyStandupWorkflow } from '../daily-standup';
import type { ITaskRepository, ITeamRepository } from '../../domain/repositories';
import type { Team, Task } from '../../schemas';

describe('DailyStandupWorkflow', () => {
  const mockTaskRepo: ITaskRepository = {
    findById: vi.fn(),
    findByTeam: vi.fn(),
    findByProject: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
  };

  const mockTeamRepo: ITeamRepository = {
    findById: vi.fn(),
    findMany: vi.fn(),
  };

  const mockTeams: Team[] = [
    {
      id: 'team-1',
      name: 'Engineering Team',
      meetings: [],
      projects: [],
      tasks: [],
    },
    {
      id: 'team-2',
      name: 'Design Team',
      meetings: [],
      projects: [],
      tasks: [],
    },
  ];

  const mockTasks: Task[] = [
    {
      id: 'task-1',
      name: 'Task 1',
      done: false,
      priority: 'High',
      due: new Date(Date.now() - 86400000).toISOString(), // Yesterday (overdue)
      teamId: 'team-1',
    },
    {
      id: 'task-2',
      name: 'Task 2',
      done: true,
      priority: 'Medium',
      due: null,
      teamId: 'team-1',
    },
    {
      id: 'task-3',
      name: 'Task 3',
      done: false,
      priority: 'Low',
      due: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
      teamId: 'team-2',
    },
  ];

  it('should generate standup report for all teams', async () => {
    const workflow = new DailyStandupWorkflow(mockTaskRepo, mockTeamRepo);

    vi.mocked(mockTeamRepo.findMany).mockResolvedValue(mockTeams);
    vi.mocked(mockTaskRepo.findByTeam).mockImplementation(async (teamId: string) => {
      return mockTasks.filter((t) => t.teamId === teamId);
    });

    const report = await workflow.generateStandupReport();

    expect(report.teams).toHaveLength(2);
    expect(report.overallSummary.totalTeams).toBe(2);
    expect(report.overallSummary.totalTasks).toBe(3);
  });

  it('should calculate team metrics correctly', async () => {
    const workflow = new DailyStandupWorkflow(mockTaskRepo, mockTeamRepo);

    vi.mocked(mockTeamRepo.findMany).mockResolvedValue(mockTeams);
    vi.mocked(mockTaskRepo.findByTeam).mockImplementation(async (teamId: string) => {
      return mockTasks.filter((t) => t.teamId === teamId);
    });

    const report = await workflow.generateStandupReport();
    const team1Summary = report.teams.find((t) => t.teamId === 'team-1');

    expect(team1Summary).toBeDefined();
    expect(team1Summary!.totalTasks).toBe(2);
    expect(team1Summary!.completedTasks).toBe(1);
    expect(team1Summary!.activeTasks).toBe(1);
    expect(team1Summary!.overdueTasks).toBe(1);
    expect(team1Summary!.highPriorityTasks).toBe(1);
  });

  it('should identify overdue tasks correctly', async () => {
    const workflow = new DailyStandupWorkflow(mockTaskRepo, mockTeamRepo);

    vi.mocked(mockTeamRepo.findMany).mockResolvedValue(mockTeams);
    vi.mocked(mockTaskRepo.findByTeam).mockImplementation(async (teamId: string) => {
      return mockTasks.filter((t) => t.teamId === teamId);
    });

    const report = await workflow.generateStandupReport();
    const team1Summary = report.teams.find((t) => t.teamId === 'team-1');

    const overdueTask = team1Summary!.tasks.find((t) => t.isOverdue);
    expect(overdueTask).toBeDefined();
    expect(overdueTask!.done).toBe(false);
  });

  it('should format standup report', async () => {
    const workflow = new DailyStandupWorkflow(mockTaskRepo, mockTeamRepo);

    vi.mocked(mockTeamRepo.findMany).mockResolvedValue(mockTeams);
    vi.mocked(mockTaskRepo.findByTeam).mockImplementation(async (teamId: string) => {
      return mockTasks.filter((t) => t.teamId === teamId);
    });

    const report = await workflow.generateStandupReport();
    const formatted = workflow.formatReport(report);

    expect(formatted).toContain('Daily Standup Report');
    expect(formatted).toContain('Engineering Team');
    expect(formatted).toContain('Design Team');
    expect(formatted).toContain('OVERDUE');
  });

  it('should generate team quick summary', async () => {
    const workflow = new DailyStandupWorkflow(mockTaskRepo, mockTeamRepo);

    vi.mocked(mockTeamRepo.findMany).mockResolvedValue(mockTeams);
    vi.mocked(mockTaskRepo.findByTeam).mockImplementation(async (teamId: string) => {
      return mockTasks.filter((t) => t.teamId === teamId);
    });

    const summary = await workflow.generateTeamQuickSummary('team-1');

    expect(summary).toContain('Engineering Team');
    expect(summary).toContain('active');
    expect(summary).toContain('done');
  });

  it('should filter out completed tasks when includeDone is false', async () => {
    const workflow = new DailyStandupWorkflow(mockTaskRepo, mockTeamRepo);

    vi.mocked(mockTeamRepo.findMany).mockResolvedValue(mockTeams);
    vi.mocked(mockTaskRepo.findByTeam).mockImplementation(async (teamId: string) => {
      return mockTasks.filter((t) => t.teamId === teamId);
    });

    const report = await workflow.generateStandupReport({ includeDone: false });
    const team1Summary = report.teams.find((t) => t.teamId === 'team-1');

    // Should only include the active task, not the completed one
    expect(team1Summary!.tasks.length).toBe(1);
    expect(team1Summary!.tasks[0].done).toBe(false);
  });
});
