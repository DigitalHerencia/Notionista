import { describe, it, expect } from "vitest";
import { DATABASE_IDS, MCP_DEFAULTS } from "../src/index.js";

describe("Core Types", () => {
  it("should export database IDs", () => {
    expect(DATABASE_IDS).toBeDefined();
    expect(DATABASE_IDS.TEAMS).toBe("2d5a4e63-bf23-8151-9b98-c81833668844");
    expect(DATABASE_IDS.PROJECTS).toBe("2d5a4e63-bf23-81b1-b507-f5ac308958e6");
    expect(DATABASE_IDS.TASKS).toBe("2d5a4e63-bf23-816f-a217-ef754ce4a70e");
  });

  it("should export MCP defaults", () => {
    expect(MCP_DEFAULTS).toBeDefined();
    expect(MCP_DEFAULTS.TIMEOUT).toBe(30000);
    expect(MCP_DEFAULTS.MAX_RETRIES).toBe(3);
    expect(MCP_DEFAULTS.RATE_LIMIT_PER_SECOND).toBe(3);
  });
});
