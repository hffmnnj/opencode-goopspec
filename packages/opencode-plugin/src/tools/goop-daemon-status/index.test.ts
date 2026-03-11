/**
 * Tests for the goop_daemon_status tool
 * @module tools/goop-daemon-status/index.test
 */

import { describe, it, expect, beforeEach, afterEach, mock } from "bun:test";
import { createGoopDaemonStatusTool } from "./index.js";
import {
  createMockPluginContext,
  createMockToolContext,
  setupTestEnvironment,
  type PluginContext,
} from "../../test-utils.js";

describe("goop_daemon_status tool", () => {
  let ctx: PluginContext;
  let toolContext: ReturnType<typeof createMockToolContext>;
  let cleanup: () => void;
  let originalFetch: typeof globalThis.fetch;

  beforeEach(() => {
    const env = setupTestEnvironment("daemon-status-test");
    cleanup = env.cleanup;
    ctx = createMockPluginContext({ testDir: env.testDir });
    toolContext = createMockToolContext({ directory: env.testDir });
    originalFetch = globalThis.fetch;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    cleanup();
  });

  describe("tool creation", () => {
    it("creates tool with correct description", () => {
      const tool = createGoopDaemonStatusTool(ctx);
      expect(tool.description).toContain("daemon");
    });
  });

  describe("daemon available", () => {
    it("returns formatted health when daemon is running", async () => {
      globalThis.fetch = mock(async () =>
        new Response(
          JSON.stringify({
            status: "ok",
            uptime: 3661,
            version: "0.1.0",
            projectCount: 3,
            activeWorkflows: 1,
            timestamp: "2026-03-11T12:00:00Z",
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        ),
      ) as unknown as typeof globalThis.fetch;

      const tool = createGoopDaemonStatusTool(ctx);
      const result = await tool.execute({}, toolContext);

      expect(result).toContain("GoopSpec Daemon");
      expect(result).toContain("✅ ok");
      expect(result).toContain("0.1.0");
      expect(result).toContain("1h");
      expect(result).toContain("3");
      expect(result).toContain("1");
    });

    it("shows degraded status with warning icon", async () => {
      globalThis.fetch = mock(async () =>
        new Response(
          JSON.stringify({
            status: "degraded",
            uptime: 60,
            version: "0.1.0",
            projectCount: 0,
            activeWorkflows: 0,
            timestamp: "2026-03-11T12:00:00Z",
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        ),
      ) as unknown as typeof globalThis.fetch;

      const tool = createGoopDaemonStatusTool(ctx);
      const result = await tool.execute({}, toolContext);

      expect(result).toContain("⚠️ degraded");
    });
  });

  describe("daemon unavailable", () => {
    it("returns helpful message when daemon is not running", async () => {
      globalThis.fetch = mock(async () => {
        throw new Error("Connection refused");
      }) as unknown as typeof globalThis.fetch;

      const tool = createGoopDaemonStatusTool(ctx);
      const result = await tool.execute({}, toolContext);

      expect(result).toContain("Daemon is not running");
      expect(result).toContain("bun run daemon");
    });
  });

  describe("daemon error", () => {
    it("returns error message on non-2xx response", async () => {
      globalThis.fetch = mock(async () =>
        new Response("Internal Server Error", { status: 500 }),
      ) as unknown as typeof globalThis.fetch;

      const tool = createGoopDaemonStatusTool(ctx);
      const result = await tool.execute({}, toolContext);

      expect(result).toContain("error");
    });
  });
});
