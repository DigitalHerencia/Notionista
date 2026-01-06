import { describe, it, expect, beforeEach } from 'vitest';
import { TeamRepository } from '../team.repository';
import { MockMcpClient } from '../../../mcp/client';

describe('TeamRepository', () => {
  let repository: TeamRepository;
  let mockClient: MockMcpClient;

  beforeEach(() => {
    mockClient = new MockMcpClient();
    repository = new TeamRepository(mockClient);
  });

  describe('create', () => {
    it('should return a change proposal for team creation', async () => {
      const input = { name: 'Engineering Team' };

      const proposal = await repository.create(input);

      expect(proposal).toBeDefined();
      expect(proposal.type).toBe('create');
      expect(proposal.currentState).toBeNull();
      expect(proposal.proposedState).toBeDefined();
      expect(proposal.proposedState.name).toBe('Engineering Team');
      expect(proposal.validation.valid).toBe(true);
      expect(proposal.diff).toBeDefined();
      expect(proposal.diff.length).toBeGreaterThan(0);
    });

    it('should include property diffs in the proposal', async () => {
      const input = { name: 'Design Team' };

      const proposal = await repository.create(input);

      const nameDiff = proposal.diff.find((d) => d.property === 'name');
      expect(nameDiff).toBeDefined();
      expect(nameDiff?.oldValue).toBeNull();
      expect(nameDiff?.newValue).toBe('Design Team');
    });
  });

  describe('update', () => {
    it('should return a change proposal for team update', async () => {
      // First create a team
      const createProposal = await repository.create({ name: 'Original Team' });
      const createdTeam = await repository.executeCreate(createProposal);

      // Now update it
      const updateProposal = await repository.update(createdTeam.id, { name: 'Updated Team' });

      expect(updateProposal).toBeDefined();
      expect(updateProposal.type).toBe('update');
      expect(updateProposal.currentState).toBeDefined();
      expect(updateProposal.currentState?.name).toBe('Original Team');
      expect(updateProposal.proposedState.name).toBe('Updated Team');
      expect(updateProposal.target.pageId).toBe(createdTeam.id);
    });

    it('should generate accurate diffs', async () => {
      const createProposal = await repository.create({ name: 'Team A' });
      const createdTeam = await repository.executeCreate(createProposal);

      const updateProposal = await repository.update(createdTeam.id, { name: 'Team B' });

      const nameDiff = updateProposal.diff.find((d) => d.property === 'name');
      expect(nameDiff).toBeDefined();
      expect(nameDiff?.oldValue).toBe('Team A');
      expect(nameDiff?.newValue).toBe('Team B');
    });
  });

  describe('findById', () => {
    it('should return null for non-existent team', async () => {
      const team = await repository.findById('non-existent');
      expect(team).toBeNull();
    });

    it('should return team after creation', async () => {
      const createProposal = await repository.create({ name: 'Test Team' });
      const createdTeam = await repository.executeCreate(createProposal);

      const foundTeam = await repository.findById(createdTeam.id);
      expect(foundTeam).toBeDefined();
      expect(foundTeam?.name).toBe('Test Team');
    });
  });

  describe('findByName', () => {
    it('should find teams by partial name match', async () => {
      const team1Proposal = await repository.create({ name: 'Engineering Team' });
      const team2Proposal = await repository.create({ name: 'Product Team' });
      await repository.executeCreate(team1Proposal);
      await repository.executeCreate(team2Proposal);

      const results = await repository.findByName('eng');
      expect(results.length).toBeGreaterThan(0);
      expect(results[0]?.name).toContain('Engineering');
    });
  });

  describe('getMetrics', () => {
    it('should return team metrics', async () => {
      const createProposal = await repository.create({ name: 'Metrics Team' });
      const createdTeam = await repository.executeCreate(createProposal);

      const metrics = await repository.getMetrics(createdTeam.id);

      expect(metrics).toBeDefined();
      expect(metrics.team.name).toBe('Metrics Team');
      expect(metrics.totalProjects).toBe(0);
      expect(metrics.totalTasks).toBe(0);
    });
  });
});
