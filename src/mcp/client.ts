import type { DatabaseId } from '../core/constants/databases';
import type { McpClientOptions } from '../core/types/mcp';
import type { NotionPage, PageProperties, QueryParams } from '../core/types/notion';

/**
 * Declarative MCP Operation Intent
 * Represents the intent to perform an MCP operation without execution
 *
 * This is a declarative control layer - operations are described as intents
 * for Copilot reasoning, not for runtime execution.
 */
export interface McpOperationIntent {
  /** The MCP tool name to invoke */
  tool:
    | 'query-data-source'
    | 'retrieve-a-page'
    | 'post-page'
    | 'patch-page'
    | 'delete-a-block'
    | 'post-search';

  /** The parameters for the MCP tool call */
  params: Record<string, unknown>;

  /** Human-readable description of the intent */
  description: string;

  /** Validation result for this operation (simple structure for consistency) */
  validation?: {
    valid: boolean;
    errors: string[];
    warnings: string[];
  };
}

/**
 * Declarative MCP Client Interface
 *
 * This interface describes MCP operations as declarative intents,
 * not as executable functions. No network calls or side effects occur.
 *
 * Used for:
 * - Type checking and IntelliSense
 * - Copilot reasoning about Notion operations
 * - Schema definition and validation
 * - Documentation generation
 *
 * NOT used for:
 * - Executing actual MCP operations (delegated to VS Code)
 * - Managing network connections
 * - Handling responses or errors
 */
export interface IMcpClient {
  /**
   * Describes intent to query a database
   * Returns the operation intent, not actual results
   */
  queryDatabase(params: QueryParams): McpOperationIntent;

  /**
   * Describes intent to retrieve a page by ID
   * Returns the operation intent, not the actual page
   */
  getPage(pageId: string): McpOperationIntent;

  /**
   * Describes intent to create a page
   * Returns the operation intent, not the created page
   */
  createPage(databaseId: DatabaseId, properties: PageProperties): McpOperationIntent;

  /**
   * Describes intent to update a page
   * Returns the operation intent, not the updated page
   */
  updatePage(pageId: string, properties: PageProperties): McpOperationIntent;

  /**
   * Describes intent to delete a page
   * Returns the operation intent, not execution result
   */
  deletePage(pageId: string): McpOperationIntent;

  /**
   * Describes intent to search pages
   * Returns the operation intent, not search results
   */
  search(query: string): McpOperationIntent;
}

/**
 * Declarative MCP Client
 *
 * Generates declarative operation intents for MCP tool calls.
 * Does NOT execute operations or perform network calls.
 *
 * This class exists purely for:
 * - Schema definition and type safety
 * - Generating operation intents for Copilot reasoning
 * - Documentation of available MCP operations
 *
 * Execution of these intents is delegated to VS Code's MCP infrastructure.
 *
 * @param _options - Client options (not currently used as this is declarative only)
 */
export class McpClient implements IMcpClient {
  constructor(_options: McpClientOptions) {
    // Options are intentionally unused in declarative mode
    // This class generates intents, not executes operations
    // Execution configuration is handled by external MCP host
  }

  /**
   * Generate intent to query a database
   */
  queryDatabase(params: QueryParams): McpOperationIntent {
    return {
      tool: 'query-data-source',
      params: {
        data_source_id: params.database_id,
        filter: params.filter,
        sorts: params.sorts,
        page_size: params.page_size,
        start_cursor: params.start_cursor,
      },
      description: `Query database ${params.database_id}${params.filter ? ' with filters' : ''}`,
      validation: this.validateQueryParams(params),
    };
  }

  /**
   * Generate intent to retrieve a page
   */
  getPage(pageId: string): McpOperationIntent {
    return {
      tool: 'retrieve-a-page',
      params: { page_id: pageId },
      description: `Retrieve page ${pageId}`,
      validation: this.validatePageId(pageId),
    };
  }

  /**
   * Generate intent to create a page
   */
  createPage(databaseId: DatabaseId, properties: PageProperties): McpOperationIntent {
    return {
      tool: 'post-page',
      params: {
        parent: { database_id: databaseId },
        properties,
      },
      description: `Create page in database ${databaseId}`,
      validation: this.validateCreateParams(databaseId, properties),
    };
  }

  /**
   * Generate intent to update a page
   */
  updatePage(pageId: string, properties: PageProperties): McpOperationIntent {
    return {
      tool: 'patch-page',
      params: {
        page_id: pageId,
        properties,
      },
      description: `Update page ${pageId}`,
      validation: this.validateUpdateParams(pageId, properties),
    };
  }

  /**
   * Generate intent to delete a page
   */
  deletePage(pageId: string): McpOperationIntent {
    return {
      tool: 'delete-a-block',
      params: { block_id: pageId },
      description: `Delete page ${pageId}`,
      validation: this.validatePageId(pageId),
    };
  }

  /**
   * Generate intent to search pages
   */
  search(query: string): McpOperationIntent {
    return {
      tool: 'post-search',
      params: { query },
      description: `Search for "${query}"`,
      validation: this.validateSearchQuery(query),
    };
  }

  // Validation helpers (pure functions, no side effects)

  private validateQueryParams(params: QueryParams) {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!params.database_id) {
      errors.push('database_id is required');
    }

    if (params.page_size && (params.page_size < 1 || params.page_size > 100)) {
      warnings.push('page_size should be between 1 and 100');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  private validatePageId(pageId: string) {
    const errors: string[] = [];

    if (!pageId || pageId.trim().length === 0) {
      errors.push('pageId is required');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings: [],
    };
  }

  private validateCreateParams(databaseId: DatabaseId, properties: PageProperties) {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!databaseId) {
      errors.push('databaseId is required');
    }

    if (!properties || Object.keys(properties).length === 0) {
      warnings.push('Creating page with no properties');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  private validateUpdateParams(pageId: string, properties: PageProperties) {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!pageId || pageId.trim().length === 0) {
      errors.push('pageId is required');
    }

    if (!properties || Object.keys(properties).length === 0) {
      warnings.push('Updating page with no properties');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  private validateSearchQuery(query: string) {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!query || query.trim().length === 0) {
      errors.push('Search query is required');
    }

    if (query.length > 1000) {
      warnings.push('Search query is very long (>1000 characters)');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }
}

/**
 * Mock MCP Client for Testing
 *
 * Provides in-memory simulation of MCP operation intents.
 * Used for testing repository and workflow logic without actual MCP calls.
 *
 * Like the main McpClient, this returns operation intents, not execution results.
 * However, it also maintains internal state for testing convenience.
 */
export class MockMcpClient implements IMcpClient {
  private pages: Map<string, NotionPage> = new Map();

  queryDatabase(params: QueryParams): McpOperationIntent {
    // For testing: simulate querying internal state
    const matchingPages = Array.from(this.pages.values()).filter(
      (page) => page.parent.database_id === params.database_id
    );

    return {
      tool: 'query-data-source',
      params: {
        data_source_id: params.database_id,
        filter: params.filter,
      },
      description: `Query database ${params.database_id} (mock: found ${matchingPages.length} pages)`,
      validation: { valid: true, errors: [], warnings: [] },
    };
  }

  getPage(pageId: string): McpOperationIntent {
    const exists = this.pages.has(pageId);

    return {
      tool: 'retrieve-a-page',
      params: { page_id: pageId },
      description: `Retrieve page ${pageId} (mock: ${exists ? 'exists' : 'not found'})`,
      validation: { valid: true, errors: [], warnings: exists ? [] : ['Page not found in mock'] },
    };
  }

  createPage(databaseId: DatabaseId, properties: PageProperties): McpOperationIntent {
    // For testing: simulate creating a page
    const mockPageId = `mock-${Date.now()}`;

    return {
      tool: 'post-page',
      params: {
        parent: { database_id: databaseId },
        properties,
      },
      description: `Create page in database ${databaseId} (mock: would create ${mockPageId})`,
      validation: { valid: true, errors: [], warnings: [] },
    };
  }

  updatePage(pageId: string, properties: PageProperties): McpOperationIntent {
    const exists = this.pages.has(pageId);

    return {
      tool: 'patch-page',
      params: {
        page_id: pageId,
        properties,
      },
      description: `Update page ${pageId} (mock: ${exists ? 'exists' : 'not found'})`,
      validation: { valid: true, errors: [], warnings: exists ? [] : ['Page not found in mock'] },
    };
  }

  deletePage(pageId: string): McpOperationIntent {
    const exists = this.pages.has(pageId);

    return {
      tool: 'delete-a-block',
      params: { block_id: pageId },
      description: `Delete page ${pageId} (mock: ${exists ? 'exists' : 'not found'})`,
      validation: { valid: true, errors: [], warnings: exists ? [] : ['Page not found in mock'] },
    };
  }

  search(query: string): McpOperationIntent {
    // For testing: simulate search
    const matchingPages = Array.from(this.pages.values()).filter((page) => {
      const titleProp = Object.values(page.properties).find((p: any) => p.type === 'title');
      if (titleProp && 'title' in titleProp) {
        return titleProp.title.some((t: any) => t.plain_text?.includes(query));
      }
      return false;
    });

    return {
      tool: 'post-search',
      params: { query },
      description: `Search for "${query}" (mock: found ${matchingPages.length} pages)`,
      validation: { valid: true, errors: [], warnings: [] },
    };
  }

  // Test helper methods (not part of IMcpClient interface)

  /**
   * Add a mock page for testing
   */
  addMockPage(page: NotionPage): void {
    this.pages.set(page.id, page);
  }

  /**
   * Clear all mock pages
   */
  clearMockPages(): void {
    this.pages.clear();
  }

  /**
   * Get mock page by ID (for test assertions)
   */
  getMockPage(pageId: string): NotionPage | undefined {
    return this.pages.get(pageId);
  }
}
