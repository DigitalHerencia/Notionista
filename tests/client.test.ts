import { describe, it, expect } from "vitest";
import { McpClient } from "../src/index.js";

describe("McpClient", () => {
  it("should create a client instance", () => {
    const client = new McpClient({
      notionToken: "test-token",
    });

    expect(client).toBeDefined();
    expect(client.isConnected()).toBe(false);
  });

  it("should accept custom options", () => {
    const client = new McpClient({
      notionToken: "test-token",
      timeout: 60000,
      maxRetries: 5,
      rateLimitPerSecond: 2,
      enableCache: false,
      enableLogging: false,
    });

    expect(client).toBeDefined();
  });
});
