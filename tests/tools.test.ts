import { describe, expect, it } from 'vitest';
import { MockMcpClient } from '../src/index.js';

describe('Tool Wrappers', () => {
  it('should initialize MockMcpClient', () => {
    const client = new MockMcpClient();

    expect(client).toBeDefined();
    expect(typeof client.queryDatabase).toBe('function');
    expect(typeof client.getPage).toBe('function');
    expect(typeof client.createPage).toBe('function');
    expect(typeof client.updatePage).toBe('function');
    expect(typeof client.deletePage).toBe('function');
    expect(typeof client.search).toBe('function');
  });

  it('should support database operations', () => {
    const client = new MockMcpClient();

    expect(typeof client.queryDatabase).toBe('function');
  });

  it('should support page operations', () => {
    const client = new MockMcpClient();

    expect(typeof client.createPage).toBe('function');
    expect(typeof client.updatePage).toBe('function');
    expect(typeof client.getPage).toBe('function');
  });

  it('should support search operations', () => {
    const client = new MockMcpClient();

    expect(typeof client.search).toBe('function');
  });
});
