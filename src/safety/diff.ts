import type { PropertyDiff, DiffSummary } from './proposal';

/**
 * Impact level for property changes
 */
export type ImpactLevel = 'low' | 'medium' | 'high';

/**
 * Diff result containing all changes
 */
export interface DiffResult {
  hasChanges: boolean;
  diffs: PropertyDiff[];
  summary: string;
}

/**
 * Engine for computing diffs between object states
 * Used to show what will change when a proposal is applied
 */
export class DiffEngine {
  /**
   * Compute full diff summary including before/after states
   * @param current Current state (null for creates)
   * @param proposed Proposed new state
   * @returns Complete diff summary
   */
  computeDiffSummary<T extends Record<string, unknown>>(current: T | null, proposed: T): DiffSummary {
    const propertyDiffs = this.computeDiff(current, proposed);
    const summary = this.generateSummary(propertyDiffs);

    return {
      before: current,
      after: proposed,
      summary,
    };
  }
  /**
   * Compute diff between current and proposed states
   * @param current Current state (null for creates)
   * @param proposed Proposed new state
   * @returns Array of property diffs
   */
  computeDiff<T extends Record<string, unknown>>(current: T | null, proposed: T): PropertyDiff[] {
    const diffs: PropertyDiff[] = [];

    // If current is null, all properties are additions
    if (current === null) {
      for (const [key, value] of Object.entries(proposed)) {
        diffs.push({
          property: key,
          oldValue: null,
          newValue: value,
          impact: this.assessImpact(key, null, value),
        });
      }
      return diffs;
    }

    // Compare all properties in proposed state
    for (const [key, newValue] of Object.entries(proposed)) {
      const oldValue = current[key];

      if (!this.areValuesEqual(oldValue, newValue)) {
        diffs.push({
          property: key,
          oldValue,
          newValue,
          impact: this.assessImpact(key, oldValue, newValue),
        });
      }
    }

    // Check for removed properties (in current but not in proposed)
    for (const key of Object.keys(current)) {
      if (!(key in proposed)) {
        diffs.push({
          property: key,
          oldValue: current[key],
          newValue: undefined,
          impact: this.assessImpact(key, current[key], undefined),
        });
      }
    }

    return diffs;
  }

  /**
   * Assess the impact level of a property change
   * @param property Property name
   * @param _oldValue Previous value (unused but kept for API consistency)
   * @param newValue New value
   * @returns Impact level
   */
  assessImpact(property: string, _oldValue: unknown, newValue: unknown): ImpactLevel {
    // High impact properties (critical data)
    const highImpactProps = ['id', 'type', 'database', 'pageId', 'status', 'done'];
    if (highImpactProps.includes(property.toLowerCase())) {
      return 'high';
    }

    // Relation changes are high impact
    if (property.toLowerCase().includes('relation') || property.endsWith('Id')) {
      return 'high';
    }

    // Deletion is high impact
    if (newValue === undefined || newValue === null) {
      return 'high';
    }

    // Date changes are medium impact
    if (
      property.toLowerCase().includes('date') ||
      property.toLowerCase().includes('due') ||
      property.toLowerCase().includes('deadline')
    ) {
      return 'medium';
    }

    // Priority/urgency changes are medium impact
    if (property.toLowerCase().includes('priority') || property.toLowerCase().includes('urgency')) {
      return 'medium';
    }

    // Default to low impact
    return 'low';
  }

  /**
   * Check if relation properties changed
   * @param diffs Array of property diffs
   * @returns True if any relation changed
   */
  hasRelationChanges(diffs: PropertyDiff[]): boolean {
    return diffs.some(
      (diff) =>
        diff.property.toLowerCase().includes('relation') ||
        diff.property.endsWith('Id') ||
        diff.property.endsWith('Ids')
    );
  }

  /**
   * Format diff as markdown for human review
   * @param diffs Array of property diffs
   * @returns Markdown formatted diff
   */
  formatAsMarkdown(diffs: PropertyDiff[]): string {
    if (diffs.length === 0) {
      return '*(No changes)*';
    }

    const lines: string[] = [];

    for (const diff of diffs) {
      const impactIcon = this.getImpactIcon(diff.impact);
      const changeType = this.getChangeType(diff);

      lines.push(`${impactIcon} **${diff.property}** (${changeType})`);

      if (diff.oldValue !== undefined && diff.oldValue !== null) {
        lines.push(`  - Old: \`${this.formatValue(diff.oldValue)}\``);
      }

      if (diff.newValue !== undefined) {
        lines.push(`  - New: \`${this.formatValue(diff.newValue)}\``);
      } else {
        lines.push(`  - *Removed*`);
      }
    }

    return lines.join('\n');
  }

  /**
   * Generate a summary of changes
   * @param diffs Array of property diffs
   * @returns Human-readable summary
   */
  generateSummary(diffs: PropertyDiff[]): string {
    if (diffs.length === 0) {
      return 'No changes';
    }

    const added = diffs.filter((d) => d.oldValue === null || d.oldValue === undefined);
    const modified = diffs.filter(
      (d) =>
        d.oldValue !== null &&
        d.oldValue !== undefined &&
        d.newValue !== null &&
        d.newValue !== undefined
    );
    const removed = diffs.filter((d) => d.newValue === undefined || d.newValue === null);

    const parts: string[] = [];

    if (added.length > 0) {
      parts.push(`${added.length} added`);
    }

    if (modified.length > 0) {
      parts.push(`${modified.length} modified`);
    }

    if (removed.length > 0) {
      parts.push(`${removed.length} removed`);
    }

    return parts.join(', ');
  }

  /**
   * Compare two values for equality
   * @param a First value
   * @param b Second value
   * @returns True if values are equal
   */
  private areValuesEqual(a: unknown, b: unknown): boolean {
    // Handle null/undefined
    if (a === null || a === undefined) {
      return b === null || b === undefined;
    }

    if (b === null || b === undefined) {
      return false;
    }

    // Handle primitives
    if (typeof a !== 'object' || typeof b !== 'object') {
      return a === b;
    }

    // Handle dates
    if (a instanceof Date && b instanceof Date) {
      return a.getTime() === b.getTime();
    }

    // Handle arrays
    if (Array.isArray(a) && Array.isArray(b)) {
      if (a.length !== b.length) return false;
      return a.every((item, index) => this.areValuesEqual(item, b[index]));
    }

    // Handle objects (shallow comparison)
    const aKeys = Object.keys(a);
    const bKeys = Object.keys(b);

    if (aKeys.length !== bKeys.length) return false;

    return aKeys.every((key) =>
      this.areValuesEqual((a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key])
    );
  }

  /**
   * Get icon for impact level
   */
  private getImpactIcon(impact: ImpactLevel): string {
    switch (impact) {
      case 'high':
        return '🔴';
      case 'medium':
        return '🟡';
      case 'low':
        return '🟢';
    }
  }

  /**
   * Get change type label
   */
  private getChangeType(diff: PropertyDiff): string {
    if (diff.oldValue === null || diff.oldValue === undefined) {
      return 'added';
    }
    if (diff.newValue === undefined || diff.newValue === null) {
      return 'removed';
    }
    return 'modified';
  }

  /**
   * Format value for display
   */
  private formatValue(value: unknown): string {
    if (value === null) return 'null';
    if (value === undefined) return 'undefined';
    if (typeof value === 'string') return value;
    if (typeof value === 'number' || typeof value === 'boolean') return value.toString();
    if (typeof value === 'bigint') return `${value}n`;
    if (typeof value === 'symbol') return value.toString();
    if (typeof value === 'function') {
      return value.name ? `[Function ${value.name}]` : '[Function]';
    }
    if (value instanceof Date) return value.toISOString();
    if (Array.isArray(value)) return `[${value.length} items]`;
    if (typeof value === 'object') {
      try {
        return JSON.stringify(value);
      } catch {
        return '[object Object]';
      }
    }
    return 'unknown';
  }
}
