import { describe, it, expect, beforeEach } from 'vitest';
import { TaskRepository } from '../task.repository';
import { MockMcpClient } from '../../../mcp/client';

describe('TaskRepository', () => {
  let repository: TaskRepository;
  let mockClient: MockMcpClient;

  beforeEach(() => {
    mockClient = new MockMcpClient();
    repository = new TaskRepository(mockClient);
  });

  describe('create', () => {
    it('should return a change proposal for task creation', async () => {
      const input = {
        name: 'Implement feature X',
        done: false,
        priority: 'High' as const,
      };
      
      const proposal = await repository.create(input);

      expect(proposal).toBeDefined();
      expect(proposal.type).toBe('create');
      expect(proposal.proposedState.name).toBe('Implement feature X');
      expect(proposal.proposedState.done).toBe(false);
      expect(proposal.proposedState.priority).toBe('High');
    });
  });

  describe('findIncomplete', () => {
    it('should return only incomplete tasks', async () => {
      const task1 = await repository.create({ name: 'Todo', done: false });
      const task2 = await repository.create({ name: 'Done', done: true });
      
      await repository.executeCreate(task1);
      await repository.executeCreate(task2);

      const incomplete = await repository.findIncomplete();
      expect(incomplete.length).toBeGreaterThan(0);
      expect(incomplete.every(t => !t.done)).toBe(true);
    });
  });

  describe('findHighPriority', () => {
    it('should return only high priority tasks', async () => {
      const task = await repository.create({
        name: 'Urgent task',
        done: false,
        priority: 'High',
      });
      
      await repository.executeCreate(task);

      const highPriority = await repository.findHighPriority();
      expect(highPriority.length).toBeGreaterThan(0);
      expect(highPriority.every(t => t.priority === 'High')).toBe(true);
    });
  });

  describe('findOverdue', () => {
    it('should return tasks that are past due', async () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      const task = await repository.create({
        name: 'Overdue task',
        done: false,
        due: yesterday.toISOString(),
      });
      
      await repository.executeCreate(task);

      const overdue = await repository.findOverdue();
      expect(overdue.length).toBeGreaterThan(0);
    });
  });

  describe('getProjectCompletionRate', () => {
    it('should calculate correct completion rate', async () => {
      const projectId = 'test-project-id';
      
      const task1 = await repository.create({ name: 'Task 1', done: true, projectId });
      const task2 = await repository.create({ name: 'Task 2', done: false, projectId });
      
      await repository.executeCreate(task1);
      await repository.executeCreate(task2);

      const rate = await repository.getProjectCompletionRate(projectId);
      expect(rate).toBe(50); // 1 out of 2 tasks completed
    });
  });
});
