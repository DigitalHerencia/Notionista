import { describe, it, expect, beforeEach } from 'vitest';
import { ProjectRepository } from '../project.repository';
import { MockMcpClient } from '../../../mcp/client';

describe('ProjectRepository', () => {
  let repository: ProjectRepository;
  let mockClient: MockMcpClient;

  beforeEach(() => {
    mockClient = new MockMcpClient();
    repository = new ProjectRepository(mockClient);
  });

  describe('create', () => {
    it('should return a change proposal for project creation', async () => {
      const input = {
        name: 'Sprint 1',
        status: 'Active' as const,
        milestone: 'M1' as const,
        phase: 'P1.1' as const,
      };

      const proposal = await repository.create(input);

      expect(proposal).toBeDefined();
      expect(proposal.type).toBe('create');
      expect(proposal.currentState).toBeNull();
      expect(proposal.proposedState).toBeDefined();
      expect(proposal.proposedState.name).toBe('Sprint 1');
      expect(proposal.proposedState.status).toBe('Active');
      expect(proposal.proposedState.milestone).toBe('M1');
    });
  });

  describe('findByStatus', () => {
    it('should filter projects by status', async () => {
      const project1 = await repository.create({ name: 'Active Project', status: 'Active' });
      const project2 = await repository.create({ name: 'Completed Project', status: 'Completed' });

      await repository.executeCreate(project1);
      await repository.executeCreate(project2);

      const activeProjects = await repository.findByStatus('Active');
      expect(activeProjects.some((p) => p.name === 'Active Project')).toBe(true);
    });
  });

  describe('findActive', () => {
    it('should return only active projects', async () => {
      const project1 = await repository.create({ name: 'Active', status: 'Active' });
      const project2 = await repository.create({ name: 'Done', status: 'Completed' });

      await repository.executeCreate(project1);
      await repository.executeCreate(project2);

      const active = await repository.findActive();
      expect(active.length).toBeGreaterThan(0);
      expect(active.every((p) => p.status === 'Active')).toBe(true);
    });
  });

  describe('findByMilestone', () => {
    it('should filter projects by milestone', async () => {
      const project = await repository.create({
        name: 'M1 Project',
        status: 'Active',
        milestone: 'M1',
      });

      await repository.executeCreate(project);

      const m1Projects = await repository.findByMilestone('M1');
      expect(m1Projects.some((p) => p.name === 'M1 Project')).toBe(true);
    });
  });
});
