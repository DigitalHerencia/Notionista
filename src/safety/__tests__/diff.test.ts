import { describe, it, expect } from 'vitest';
import { DiffEngine } from '../diff';

describe('DiffEngine', () => {
  const engine = new DiffEngine();

  describe('computeDiff', () => {
    it('should detect property additions when current is null', () => {
      const proposed = { name: 'Test', priority: 'High' };
      const diffs = engine.computeDiff(null, proposed);

      expect(diffs).toHaveLength(2);
      expect(diffs[0]).toMatchObject({
        property: 'name',
        oldValue: null,
        newValue: 'Test',
      });
      expect(diffs[1]).toMatchObject({
        property: 'priority',
        oldValue: null,
        newValue: 'High',
      });
    });

    it('should detect modified properties', () => {
      const current = { name: 'Old Name', priority: 'Low' };
      const proposed = { name: 'New Name', priority: 'Low' };
      const diffs = engine.computeDiff(current, proposed);

      expect(diffs).toHaveLength(1);
      expect(diffs[0]).toMatchObject({
        property: 'name',
        oldValue: 'Old Name',
        newValue: 'New Name',
      });
    });

    it('should detect removed properties', () => {
      const current = { name: 'Test', priority: 'High', extra: 'value' };
      const proposed = { name: 'Test', priority: 'High' };
      const diffs = engine.computeDiff(current, proposed);

      expect(diffs).toHaveLength(1);
      expect(diffs[0]).toMatchObject({
        property: 'extra',
        oldValue: 'value',
        newValue: undefined,
      });
    });

    it('should return empty array when no changes', () => {
      const current = { name: 'Test', priority: 'High' };
      const proposed = { name: 'Test', priority: 'High' };
      const diffs = engine.computeDiff(current, proposed);

      expect(diffs).toHaveLength(0);
    });

    it('should handle date comparisons', () => {
      const date1 = new Date('2026-01-01');
      const date2 = new Date('2026-01-02');
      const current = { due: date1 };
      const proposed = { due: date2 };
      const diffs = engine.computeDiff(current, proposed);

      expect(diffs).toHaveLength(1);
      expect(diffs[0]?.property).toBe('due');
    });

    it('should handle array comparisons', () => {
      const current = { tags: ['a', 'b'] };
      const proposed = { tags: ['a', 'b', 'c'] };
      const diffs = engine.computeDiff(current, proposed);

      expect(diffs).toHaveLength(1);
      expect(diffs[0]?.property).toBe('tags');
    });
  });

  describe('assessImpact', () => {
    it('should assign high impact to critical properties', () => {
      expect(engine.assessImpact('id', 'old', 'new')).toBe('high');
      expect(engine.assessImpact('status', 'Active', 'Completed')).toBe('high');
      expect(engine.assessImpact('done', false, true)).toBe('high');
    });

    it('should assign high impact to relation changes', () => {
      expect(engine.assessImpact('projectId', 'old', 'new')).toBe('high');
      expect(engine.assessImpact('teamRelation', 'old', 'new')).toBe('high');
    });

    it('should assign high impact to deletions', () => {
      expect(engine.assessImpact('anyField', 'value', null)).toBe('high');
      expect(engine.assessImpact('anyField', 'value', undefined)).toBe('high');
    });

    it('should assign medium impact to date changes', () => {
      expect(engine.assessImpact('due', '2026-01-01', '2026-01-02')).toBe('medium');
      expect(engine.assessImpact('startDate', '2026-01-01', '2026-01-02')).toBe('medium');
    });

    it('should assign medium impact to priority changes', () => {
      expect(engine.assessImpact('priority', 'Low', 'High')).toBe('medium');
    });

    it('should assign low impact to other changes', () => {
      expect(engine.assessImpact('description', 'old', 'new')).toBe('low');
      expect(engine.assessImpact('notes', 'old', 'new')).toBe('low');
    });
  });

  describe('hasRelationChanges', () => {
    it('should detect relation changes', () => {
      const diffs = [
        { property: 'projectId', oldValue: 'old', newValue: 'new', impact: 'high' as const },
        { property: 'name', oldValue: 'old', newValue: 'new', impact: 'low' as const },
      ];

      expect(engine.hasRelationChanges(diffs)).toBe(true);
    });

    it('should return false when no relation changes', () => {
      const diffs = [
        { property: 'name', oldValue: 'old', newValue: 'new', impact: 'low' as const },
        { property: 'priority', oldValue: 'Low', newValue: 'High', impact: 'medium' as const },
      ];

      expect(engine.hasRelationChanges(diffs)).toBe(false);
    });
  });

  describe('formatAsMarkdown', () => {
    it('should format diffs as markdown', () => {
      const diffs = [
        { property: 'name', oldValue: 'Old', newValue: 'New', impact: 'low' as const },
        { property: 'priority', oldValue: 'Low', newValue: 'High', impact: 'medium' as const },
      ];

      const markdown = engine.formatAsMarkdown(diffs);

      expect(markdown).toContain('name');
      expect(markdown).toContain('priority');
      expect(markdown).toContain('Old');
      expect(markdown).toContain('New');
    });

    it('should handle empty diffs', () => {
      const markdown = engine.formatAsMarkdown([]);
      expect(markdown).toContain('No changes');
    });

    it('should format removed properties', () => {
      const diffs = [
        { property: 'extra', oldValue: 'value', newValue: undefined, impact: 'high' as const },
      ];

      const markdown = engine.formatAsMarkdown(diffs);
      expect(markdown).toContain('Removed');
    });
  });

  describe('generateSummary', () => {
    it('should summarize changes', () => {
      const diffs = [
        { property: 'name', oldValue: null, newValue: 'New', impact: 'low' as const },
        { property: 'priority', oldValue: 'Low', newValue: 'High', impact: 'medium' as const },
        { property: 'extra', oldValue: 'value', newValue: undefined, impact: 'high' as const },
      ];

      const summary = engine.generateSummary(diffs);
      expect(summary).toContain('added');
      expect(summary).toContain('modified');
      expect(summary).toContain('removed');
    });

    it('should return "No changes" for empty diffs', () => {
      const summary = engine.generateSummary([]);
      expect(summary).toBe('No changes');
    });

    it('should handle only additions', () => {
      const diffs = [
        { property: 'name', oldValue: null, newValue: 'New', impact: 'low' as const },
        { property: 'priority', oldValue: null, newValue: 'High', impact: 'medium' as const },
      ];

      const summary = engine.generateSummary(diffs);
      expect(summary).toBe('2 added');
    });

    it('should handle only modifications', () => {
      const diffs = [
        { property: 'name', oldValue: 'Old', newValue: 'New', impact: 'low' as const },
      ];

      const summary = engine.generateSummary(diffs);
      expect(summary).toBe('1 modified');
    });
  });
});

describe('DiffEngine - computeDiffSummary', () => {
  const engine = new DiffEngine();

  it('should generate complete diff summary for creation', () => {
    const proposed = { name: 'Test Task', priority: 'High', done: false };
    const summary = engine.computeDiffSummary(null, proposed);

    expect(summary.before).toBeNull();
    expect(summary.after).toEqual(proposed);
    expect(summary.summary).toContain('3 added');
  });

  it('should generate diff summary for updates', () => {
    const current = { name: 'Old Task', priority: 'Low', done: false };
    const proposed = { name: 'New Task', priority: 'High', done: false };
    const summary = engine.computeDiffSummary(current, proposed);

    expect(summary.before).toEqual(current);
    expect(summary.after).toEqual(proposed);
    expect(summary.summary).toContain('2 modified');
  });

  it('should generate diff summary with mixed changes', () => {
    const current = { name: 'Task', priority: 'Low', oldField: 'value' };
    const proposed = { name: 'Task', priority: 'High', newField: 'value' };
    const summary = engine.computeDiffSummary(current, proposed);

    expect(summary.before).toEqual(current);
    expect(summary.after).toEqual(proposed);
    expect(summary.summary).toContain('1 added');
    expect(summary.summary).toContain('1 modified');
    expect(summary.summary).toContain('1 removed');
  });

  it('should generate summary with no changes', () => {
    const state = { name: 'Task', priority: 'Low' };
    const summary = engine.computeDiffSummary(state, state);

    expect(summary.before).toEqual(state);
    expect(summary.after).toEqual(state);
    expect(summary.summary).toBe('No changes');
  });
});
