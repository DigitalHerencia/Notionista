import { describe, it, expect } from "vitest";
import { McpClient } from "../src/index.js";

describe("Tool Wrappers", () => {
  it("should initialize all tool wrappers", () => {
    const client = new McpClient({
      notionToken: "test-token",
    });

    expect(client.databases).toBeDefined();
    expect(client.pages).toBeDefined();
    expect(client.blocks).toBeDefined();
    expect(client.search).toBeDefined();
    expect(client.comments).toBeDefined();
    expect(client.users).toBeDefined();
  });

  it("should have database tool methods", () => {
    const client = new McpClient({
      notionToken: "test-token",
    });

    expect(typeof client.databases.queryDatabase).toBe("function");
    expect(typeof client.databases.getDatabase).toBe("function");
    expect(typeof client.databases.listTemplates).toBe("function");
  });

  it("should have page tool methods", () => {
    const client = new McpClient({
      notionToken: "test-token",
    });

    expect(typeof client.pages.createPage).toBe("function");
    expect(typeof client.pages.updatePage).toBe("function");
    expect(typeof client.pages.getPage).toBe("function");
    expect(typeof client.pages.movePage).toBe("function");
  });

  it("should have search tool methods", () => {
    const client = new McpClient({
      notionToken: "test-token",
    });

    expect(typeof client.search.search).toBe("function");
    expect(typeof client.search.searchPages).toBe("function");
    expect(typeof client.search.searchDatabases).toBe("function");
  });
});
