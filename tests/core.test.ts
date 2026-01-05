import { describe, it, expect } from "vitest";
import { DATABASE_IDS, MCP_DEFAULTS } from "../src/index.js";

describe("Core Types", () => {
  it("should export database IDs", () => {
    expect(DATABASE_IDS).toBeDefined();
    expect(DATABASE_IDS.TEAMS).toBe("2d5a4e63-bf23-816b-9f75-000b219f7713");
    expect(DATABASE_IDS.PROJECTS).toBe("2d5a4e63-bf23-8115-a70f-000bc1ef9d05");
    expect(DATABASE_IDS.TASKS).toBe("2d5a4e63-bf23-8137-8277-000b41c867c3");
  });

  it("should export MCP defaults", () => {
    expect(MCP_DEFAULTS).toBeDefined();
    expect(MCP_DEFAULTS.TIMEOUT).toBe(30000);
    expect(MCP_DEFAULTS.MAX_RETRIES).toBe(3);
    expect(MCP_DEFAULTS.RATE_LIMIT_PER_SECOND).toBe(3);
  });
});
