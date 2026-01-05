import type { IMcpClient } from '../../mcp/client';
import type { DatabaseId } from '../../core/constants/databases';
import type { NotionPage, PageProperties, QueryFilter } from '../../core/types/notion';
import type { ChangeProposal, PropertyDiff, SideEffect, ValidationResult } from '../../core/types/proposals';
import { EntityNotFoundError, ValidationError as DomainValidationError } from '../../core/errors';

/**
 * Abstract base repository implementing the repository pattern
 * All concrete repositories extend this class
 * 
 * @template TEntity - The domain entity type
 * @template TCreateInput - Input type for creating entities
 * @template TUpdateInput - Input type for updating entities
 */
export abstract class BaseRepository<TEntity, TCreateInput, TUpdateInput> {
  constructor(
    protected readonly mcp: IMcpClient,
    protected readonly databaseId: DatabaseId
  ) {}

  /**
   * Find all entities matching the filter
   */
  async findMany(filter?: QueryFilter): Promise<TEntity[]> {
    const result = await this.mcp.queryDatabase({
      database_id: this.databaseId,
      filter,
      page_size: 100,
    });

    return result.results.map((page: NotionPage) => this.toDomainEntity(page));
  }

  /**
   * Find a single entity by ID
   * @returns The entity or null if not found
   */
  async findById(id: string): Promise<TEntity | null> {
    try {
      const page = await this.mcp.getPage(id);
      return this.toDomainEntity(page);
    } catch (error) {
      return null;
    }
  }

  /**
   * Find a single entity by ID, throw if not found
   * @throws {EntityNotFoundError} If entity is not found
   */
  async findByIdOrThrow(id: string): Promise<TEntity> {
    const entity = await this.findById(id);
    if (!entity) {
      throw new EntityNotFoundError(this.getEntityName(), id);
    }
    return entity;
  }

  /**
   * Create a new entity - returns a proposal for the safety workflow
   * Does NOT execute the change immediately
   */
  async create(input: TCreateInput): Promise<ChangeProposal<TEntity>> {
    // Validate input
    const validation = await this.validateCreate(input);
    if (!validation.valid) {
      throw new DomainValidationError('Create validation failed', validation.errors);
    }

    // Create proposed entity
    const proposedState = this.createProposedEntity(input);

    // Detect side effects
    const sideEffects = await this.detectSideEffects('create', null, proposedState);

    // Generate diff
    const diff = this.generateDiff(null, proposedState);

    return {
      id: this.generateProposalId(),
      type: 'create',
      target: {
        database: this.databaseId,
      },
      currentState: null,
      proposedState,
      diff,
      sideEffects,
      validation,
      createdAt: new Date(),
    };
  }

  /**
   * Update an existing entity - returns a proposal for the safety workflow
   * Does NOT execute the change immediately
   */
  async update(id: string, input: TUpdateInput): Promise<ChangeProposal<TEntity>> {
    // Get current state
    const currentState = await this.findByIdOrThrow(id);

    // Validate update
    const validation = await this.validateUpdate(id, input);
    if (!validation.valid) {
      throw new DomainValidationError('Update validation failed', validation.errors);
    }

    // Create proposed state
    const proposedState = this.mergeUpdate(currentState, input);

    // Detect side effects
    const sideEffects = await this.detectSideEffects('update', currentState, proposedState);

    // Generate diff
    const diff = this.generateDiff(currentState, proposedState);

    return {
      id: this.generateProposalId(),
      type: 'update',
      target: {
        database: this.databaseId,
        pageId: id,
      },
      currentState,
      proposedState,
      diff,
      sideEffects,
      validation,
      createdAt: new Date(),
    };
  }

  /**
   * Execute a create proposal
   * @internal Used by ProposalManager
   */
  async executeCreate(proposal: ChangeProposal<TEntity>): Promise<TEntity> {
    const properties = this.toNotionProperties(proposal.proposedState as any);
    const page = await this.mcp.createPage(this.databaseId, properties);
    return this.toDomainEntity(page);
  }

  /**
   * Execute an update proposal
   * @internal Used by ProposalManager
   */
  async executeUpdate(proposal: ChangeProposal<TEntity>): Promise<TEntity> {
    if (!proposal.target.pageId) {
      throw new Error('Update proposal must have a pageId');
    }
    const properties = this.toNotionProperties(proposal.proposedState as any);
    const page = await this.mcp.updatePage(proposal.target.pageId, properties);
    return this.toDomainEntity(page);
  }

  /**
   * Convert a Notion page to a domain entity
   * Must be implemented by concrete repositories
   */
  protected abstract toDomainEntity(page: NotionPage): TEntity;

  /**
   * Convert domain input to Notion properties
   * Must be implemented by concrete repositories
   */
  protected abstract toNotionProperties(input: TCreateInput | TUpdateInput | TEntity): PageProperties;

  /**
   * Get the entity name for error messages
   */
  protected abstract getEntityName(): string;

  /**
   * Validate create input
   * Can be overridden by concrete repositories for custom validation
   */
  protected async validateCreate(_input: TCreateInput): Promise<ValidationResult> {
    return {
      valid: true,
      errors: [],
      warnings: [],
    };
  }

  /**
   * Validate update input
   * Can be overridden by concrete repositories for custom validation
   */
  protected async validateUpdate(_id: string, _input: TUpdateInput): Promise<ValidationResult> {
    return {
      valid: true,
      errors: [],
      warnings: [],
    };
  }

  /**
   * Create a proposed entity from input (used in create proposal)
   * Can be overridden for more complex entity construction
   */
  protected createProposedEntity(input: TCreateInput): TEntity {
    return {
      id: 'proposed-id',
      ...input,
    } as TEntity;
  }

  /**
   * Merge update input with current state
   * Can be overridden for complex merge logic
   */
  protected mergeUpdate(current: TEntity, update: TUpdateInput): TEntity {
    return {
      ...current,
      ...update,
    };
  }

  /**
   * Detect side effects of a change
   * Can be overridden to detect relations, rollups, etc.
   */
  protected async detectSideEffects(
    _operation: 'create' | 'update',
    _current: TEntity | null,
    _proposed: TEntity
  ): Promise<SideEffect[]> {
    return [];
  }

  /**
   * Generate property-level diff between states
   */
  protected generateDiff(current: TEntity | null, proposed: TEntity): PropertyDiff[] {
    const diffs: PropertyDiff[] = [];

    if (!current) {
      // All properties are new
      Object.entries(proposed as any).forEach(([key, value]) => {
        if (key !== 'id') {
          diffs.push({
            property: key,
            oldValue: null,
            newValue: value,
            impact: this.assessImpact(key),
          });
        }
      });
    } else {
      // Compare properties
      Object.entries(proposed as any).forEach(([key, newValue]) => {
        const oldValue = (current as any)[key];
        if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
          diffs.push({
            property: key,
            oldValue,
            newValue,
            impact: this.assessImpact(key),
          });
        }
      });
    }

    return diffs;
  }

  /**
   * Assess the impact level of a property change
   * Can be overridden for domain-specific impact assessment
   */
  protected assessImpact(property: string): 'low' | 'medium' | 'high' {
    // Relations and status changes are high impact
    if (property.includes('Id') || property.includes('Ids') || property === 'status') {
      return 'high';
    }
    // Dates and priorities are medium impact
    if (property.includes('date') || property.includes('Date') || property === 'priority') {
      return 'medium';
    }
    // Everything else is low impact
    return 'low';
  }

  /**
   * Generate a unique proposal ID
   */
  protected generateProposalId(): string {
    return `proposal-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Extract title from Notion title property
   */
  protected extractTitle(properties: Record<string, any>, propertyName: string): string {
    const prop = properties[propertyName];
    if (prop?.type === 'title' && prop.title.length > 0) {
      return prop.title[0].plain_text;
    }
    return '';
  }

  /**
   * Extract select value from Notion select property
   */
  protected extractSelect(properties: Record<string, any>, propertyName: string): string | null {
    const prop = properties[propertyName];
    if (prop?.type === 'select' && prop.select) {
      return prop.select.name;
    }
    return null;
  }

  /**
   * Extract date from Notion date property
   */
  protected extractDate(properties: Record<string, any>, propertyName: string): string | null {
    const prop = properties[propertyName];
    if (prop?.type === 'date' && prop.date) {
      return prop.date.start;
    }
    return null;
  }

  /**
   * Extract checkbox from Notion checkbox property
   */
  protected extractCheckbox(properties: Record<string, any>, propertyName: string): boolean {
    const prop = properties[propertyName];
    if (prop?.type === 'checkbox') {
      return prop.checkbox;
    }
    return false;
  }

  /**
   * Extract relation IDs from Notion relation property
   */
  protected extractRelation(properties: Record<string, any>, propertyName: string): string[] {
    const prop = properties[propertyName];
    if (prop?.type === 'relation' && prop.relation) {
      return prop.relation.map((r: any) => r.id);
    }
    return [];
  }

  /**
   * Extract number from Notion number/formula/rollup property
   */
  protected extractNumber(properties: Record<string, any>, propertyName: string): number | undefined {
    const prop = properties[propertyName];
    if (prop?.type === 'number') {
      return prop.number ?? undefined;
    }
    if (prop?.type === 'formula' && prop.formula?.type === 'number') {
      return prop.formula.number ?? undefined;
    }
    if (prop?.type === 'rollup' && prop.rollup?.type === 'number') {
      return prop.rollup.number ?? undefined;
    }
    return undefined;
  }

  /**
   * Extract rich text from Notion rich text property
   */
  protected extractRichText(properties: Record<string, any>, propertyName: string): string {
    const prop = properties[propertyName];
    if (prop?.type === 'rich_text' && prop.rich_text.length > 0) {
      return prop.rich_text[0].plain_text;
    }
    return '';
  }
}
