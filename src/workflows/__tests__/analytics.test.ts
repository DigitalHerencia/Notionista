import { describe, it, expect, vi } from 'vitest';
import { AnalyticsService } from '../analytics';
import type {
  ITeamRepository,
  IProjectRepository,
  ITaskRepository,
} from '../../domain/repositories';
import type { Team, Project, Task } from '../../schemas';

describe('AnalyticsService', () => {
  const mockTeamRepo: ITeamRepository = {
    findById: vi.fn(),
    findMany: vi.fn(),
  };

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

  const mockTeam: Team = {
    id: 'team-1',
    name: 'Engineering Team',
    meetings: [],
    projects: ['project-1'],
    tasks: ['task-1', 'task-2'],
  };

  const mockProject: Project = {
    id: 'project-1',
    name: 'Test Project',
    status: 'Active',
    milestone: 'M1',
    phase: 'P1.1',
    domain: 'ENG',
    startDate: new Date(Date.now() - 7 * 86400000).toISOString(), // 7 days ago
    endDate: new Date(Date.now() + 7 * 86400000).toISOString(), // 7 days from now
    teamId: 'team-1',
    taskIds: ['task-1', 'task-2'],
  };

  const mockTasks: Task[] = [
    {
      id: 'task-1',
      name: 'Task 1',
      done: true,
      priority: 'High',
      due: null,
      teamId: 'team-1',
      projectId: 'project-1',
    },
    {
      id: 'task-2',
      name: 'Task 2',
      done: false,
      priority: 'Medium',
      due: new Date(Date.now() + 86400000).toISOString(),
      teamId: 'team-1',
      projectId: 'project-1',
    },
  ];

  it('should get team metrics', async () => {
    const service = new AnalyticsService(mockTeamRepo, mockProjectRepo, mockTaskRepo);

    vi.mocked(mockTeamRepo.findMany).mockResolvedValue([mockTeam]);
    vi.mocked(mockProjectRepo.findByTeam).mockResolvedValue([mockProject]);
    vi.mocked(mockTaskRepo.findByTeam).mockResolvedValue(mockTasks);

    const metrics = await service.getTeamMetrics('team-1');

    expect(metrics.teamId).toBe('team-1');
    expect(metrics.teamName).toBe('Engineering Team');
    expect(metrics.totalProjects).toBe(1);
    expect(metrics.activeProjects).toBe(1);
    expect(metrics.totalTasks).toBe(2);
    expect(metrics.completedTasks).toBe(1);
    expect(metrics.activeTasks).toBe(1);
    expect(metrics.completionRate).toBe(50);
  });

  it('should get project metrics', async () => {
    const service = new AnalyticsService(mockTeamRepo, mockProjectRepo, mockTaskRepo);

    vi.mocked(mockProjectRepo.findMany).mockResolvedValue([mockProject]);
    vi.mocked(mockTeamRepo.findById).mockResolvedValue(mockTeam);
    vi.mocked(mockTaskRepo.findByProject).mockResolvedValue(mockTasks);

    const metrics = await service.getProjectMetrics('project-1');

    expect(metrics.projectId).toBe('project-1');
    expect(metrics.projectName).toBe('Test Project');
    expect(metrics.status).toBe('Active');
    expect(metrics.totalTasks).toBe(2);
    expect(metrics.completedTasks).toBe(1);
    expect(metrics.completionRate).toBe(50);
    expect(metrics.onTrack).toBeDefined();
  });

  it('should identify overdue tasks in project metrics', async () => {
    const service = new AnalyticsService(mockTeamRepo, mockProjectRepo, mockTaskRepo);

    const tasksWithOverdue: Task[] = [
      ...mockTasks,
      {
        id: 'task-3',
        name: 'Overdue Task',
        done: false,
        priority: 'High',
        due: new Date(Date.now() - 86400000).toISOString(), // Yesterday
        teamId: 'team-1',
        projectId: 'project-1',
      },
    ];

    vi.mocked(mockProjectRepo.findMany).mockResolvedValue([mockProject]);
    vi.mocked(mockTeamRepo.findById).mockResolvedValue(mockTeam);
    vi.mocked(mockTaskRepo.findByProject).mockResolvedValue(tasksWithOverdue);

    const metrics = await service.getProjectMetrics('project-1');

    expect(metrics.overdueTasks).toBe(1);
  });

  it('should calculate overall analytics', async () => {
    const service = new AnalyticsService(mockTeamRepo, mockProjectRepo, mockTaskRepo);

    vi.mocked(mockTeamRepo.findMany).mockResolvedValue([mockTeam]);
    vi.mocked(mockProjectRepo.findMany).mockResolvedValue([mockProject]);
    vi.mocked(mockProjectRepo.findByTeam).mockResolvedValue([mockProject]);
    vi.mocked(mockTaskRepo.findMany).mockResolvedValue(mockTasks);
    vi.mocked(mockTaskRepo.findByTeam).mockResolvedValue(mockTasks);
    vi.mocked(mockTaskRepo.findByProject).mockResolvedValue(mockTasks);
    vi.mocked(mockTeamRepo.findById).mockResolvedValue(mockTeam);

    const analytics = await service.getOverallAnalytics();

    expect(analytics.totalTeams).toBe(1);
    expect(analytics.totalProjects).toBe(1);
    expect(analytics.totalTasks).toBe(2);
    expect(analytics.overallCompletionRate).toBe(50);
  });

  it('should format overall report', async () => {
    const service = new AnalyticsService(mockTeamRepo, mockProjectRepo, mockTaskRepo);

    vi.mocked(mockTeamRepo.findMany).mockResolvedValue([mockTeam]);
    vi.mocked(mockProjectRepo.findMany).mockResolvedValue([mockProject]);
    vi.mocked(mockProjectRepo.findByTeam).mockResolvedValue([mockProject]);
    vi.mocked(mockTaskRepo.findMany).mockResolvedValue(mockTasks);
    vi.mocked(mockTaskRepo.findByTeam).mockResolvedValue(mockTasks);
    vi.mocked(mockTaskRepo.findByProject).mockResolvedValue(mockTasks);
    vi.mocked(mockTeamRepo.findById).mockResolvedValue(mockTeam);

    const analytics = await service.getOverallAnalytics();
    const formatted = service.formatOverallReport(analytics);

    expect(formatted).toContain('Analytics Report');
    expect(formatted).toContain('Overall Summary');
    expect(formatted).toContain('**Teams**: 1');
    expect(formatted).toContain('**Projects**: 1');
  });

  it('should format team report', async () => {
    const service = new AnalyticsService(mockTeamRepo, mockProjectRepo, mockTaskRepo);

    vi.mocked(mockTeamRepo.findMany).mockResolvedValue([mockTeam]);
    vi.mocked(mockProjectRepo.findByTeam).mockResolvedValue([mockProject]);
    vi.mocked(mockTaskRepo.findByTeam).mockResolvedValue(mockTasks);

    const metrics = await service.getTeamMetrics('team-1');
    const formatted = service.formatTeamReport(metrics);

    expect(formatted).toContain('Team Report: Engineering Team');
    expect(formatted).toContain('Overview');
    expect(formatted).toContain('Completion Rate');
  });

  it('should group tasks by priority', async () => {
    const service = new AnalyticsService(mockTeamRepo, mockProjectRepo, mockTaskRepo);

    vi.mocked(mockTeamRepo.findMany).mockResolvedValue([mockTeam]);
    vi.mocked(mockProjectRepo.findByTeam).mockResolvedValue([mockProject]);
    vi.mocked(mockTaskRepo.findByTeam).mockResolvedValue(mockTasks);

    const metrics = await service.getTeamMetrics('team-1');

    expect(metrics.tasksByPriority.High).toBe(1);
    expect(metrics.tasksByPriority.Medium).toBe(1);
    expect(metrics.tasksByPriority.Low).toBe(0);
  });
});
