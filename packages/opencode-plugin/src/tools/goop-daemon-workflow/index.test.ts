/**
 * Tests for the goop_daemon_workflow tool
 * @module tools/goop-daemon-workflow/index.test
 */

import { describe, it, expect, beforeEach, afterEach, mock } from "bun:test";
import { createGoopDaemonWorkflowTool } from "./index.js";
import {
  createMockPluginContext,
  createMockToolContext,
  setupTestEnvironment,
  type PluginContext,
} from "../../test-utils.js";

const MOCK_SESSIONS = [
  {
    id: "sess-1",
    projectId: "proj-1",
    workflowId: "default",
    phase: "execute",
    currentWave: 2,
    totalWaves: 5,
    status: "running",
    activeAgent: "goop-executor-medium",
    startedAt: "2026-03-11T10:00:00Z",
    updatedAt: "2026-03-11T12:00:00Z",
  },
  {
    id: "sess-2",
    projectId: "proj-1",
    workflowId: "feat-auth",
    phase: "plan",
    currentWave: 0,
    totalWaves: 0,
    status: "pending",
    startedAt: "2026-03-11T11:00:00Z",
    updatedAt: "2026-03-11T11:00:00Z",
  },
  {
    id: "sess-3",
    projectId: "proj-2",
    workflowId: "default",
    phase: "accept",
    currentWave: 3,
    totalWaves: 3,
    status: "completed",
    startedAt: "2026-03-10T08:00:00Z",
    completedAt: "2026-03-10T16:00:00Z",
    updatedAt: "2026-03-10T16:00:00Z",
  },
];

describe("goop_daemon_workflow tool", () => {
  let ctx: PluginContext;
  let toolContext: ReturnType<typeof createMockToolContext>;
  let cleanup: () => void;
  let originalFetch: typeof globalThis.fetch;

  beforeEach(() => {
    const env = setupTestEnvironment("daemon-workflow-test");
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
      const tool = createGoopDaemonWorkflowTool(ctx);
      expect(tool.description).toContain("workflow");
    });

    it("has required args", () => {
      const tool = createGoopDaemonWorkflowTool(ctx);
      expect(tool.args).toHaveProperty("action");
    });
  });

  describe("status action", () => {
    it("returns active workflow sessions", async () => {
      globalThis.fetch = mock(async () =>
        new Response(
          JSON.stringify({ sessions: MOCK_SESSIONS }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        ),
      ) as unknown as typeof globalThis.fetch;

      const tool = createGoopDaemonWorkflowTool(ctx);
      const result = await tool.execute({ action: "status" }, toolContext);

      expect(result).toContain("Active Workflows");
      expect(result).toContain("sess-1");
      expect(result).toContain("running");
      // sess-3 is completed, should not appear in status
      expect(result).not.toContain("sess-3");
    });

    it("returns message when no active sessions", async () => {
      globalThis.fetch = mock(async () =>
        new Response(
          JSON.stringify({
            sessions: MOCK_SESSIONS.filter((s) => s.status === "completed"),
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        ),
      ) as unknown as typeof globalThis.fetch;

      const tool = createGoopDaemonWorkflowTool(ctx);
      const result = await tool.execute({ action: "status" }, toolContext);

      expect(result).toContain("No active workflow sessions");
    });

    it("filters by projectId", async () => {
      globalThis.fetch = mock(async () =>
        new Response(
          JSON.stringify({ sessions: MOCK_SESSIONS }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        ),
      ) as unknown as typeof globalThis.fetch;

      const tool = createGoopDaemonWorkflowTool(ctx);
      const result = await tool.execute(
        { action: "status", projectId: "proj-2" },
        toolContext,
      );

      // proj-2 only has a completed session, so no active
      expect(result).toContain("No active workflow sessions");
    });
  });

  describe("history action", () => {
    it("returns all sessions in table format", async () => {
      globalThis.fetch = mock(async () =>
        new Response(
          JSON.stringify({ sessions: MOCK_SESSIONS }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        ),
      ) as unknown as typeof globalThis.fetch;

      const tool = createGoopDaemonWorkflowTool(ctx);
      const result = await tool.execute({ action: "history" }, toolContext);

      expect(result).toContain("Workflow Sessions");
      expect(result).toContain("sess-1");
      expect(result).toContain("sess-2");
      expect(result).toContain("sess-3");
    });

    it("returns message when no sessions", async () => {
      globalThis.fetch = mock(async () =>
        new Response(
          JSON.stringify({ sessions: [] }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        ),
      ) as unknown as typeof globalThis.fetch;

      const tool = createGoopDaemonWorkflowTool(ctx);
      const result = await tool.execute({ action: "history" }, toolContext);

      expect(result).toContain("No workflow sessions found");
    });
  });

  describe("get action", () => {
    it("returns specific session details", async () => {
      globalThis.fetch = mock(async () =>
        new Response(
          JSON.stringify({ session: MOCK_SESSIONS[0] }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        ),
      ) as unknown as typeof globalThis.fetch;

      const tool = createGoopDaemonWorkflowTool(ctx);
      const result = await tool.execute(
        { action: "get", sessionId: "sess-1" },
        toolContext,
      );

      expect(result).toContain("sess-1");
      expect(result).toContain("execute");
      expect(result).toContain("running");
      expect(result).toContain("2/5");
      expect(result).toContain("goop-executor-medium");
    });

    it("returns error when sessionId is missing", async () => {
      const tool = createGoopDaemonWorkflowTool(ctx);
      const result = await tool.execute({ action: "get" }, toolContext);

      expect(result).toContain("Error");
      expect(result).toContain("sessionId");
    });
  });

  describe("daemon unavailable", () => {
    it("returns helpful message", async () => {
      globalThis.fetch = mock(async () => {
        throw new Error("Connection refused");
      }) as unknown as typeof globalThis.fetch;

      const tool = createGoopDaemonWorkflowTool(ctx);
      const result = await tool.execute({ action: "status" }, toolContext);

      expect(result).toContain("Daemon is not running");
      expect(result).toContain("bun run daemon");
    });
  });
});
