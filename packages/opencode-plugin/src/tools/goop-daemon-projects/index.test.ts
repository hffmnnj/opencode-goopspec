/**
 * Tests for the goop_daemon_projects tool
 * @module tools/goop-daemon-projects/index.test
 */

import { describe, it, expect, beforeEach, afterEach, mock } from "bun:test";
import { createGoopDaemonProjectsTool } from "./index.js";
import {
  createMockPluginContext,
  createMockToolContext,
  setupTestEnvironment,
  type PluginContext,
} from "../../test-utils.js";

describe("goop_daemon_projects tool", () => {
  let ctx: PluginContext;
  let toolContext: ReturnType<typeof createMockToolContext>;
  let cleanup: () => void;
  let originalFetch: typeof globalThis.fetch;

  beforeEach(() => {
    const env = setupTestEnvironment("daemon-projects-test");
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
      const tool = createGoopDaemonProjectsTool(ctx);
      expect(tool.description).toContain("project");
    });

    it("has required args", () => {
      const tool = createGoopDaemonProjectsTool(ctx);
      expect(tool.args).toHaveProperty("action");
    });
  });

  describe("list action", () => {
    it("returns formatted project list", async () => {
      globalThis.fetch = mock(async () =>
        new Response(
          JSON.stringify({
            projects: [
              {
                id: "proj-1",
                name: "my-app",
                path: "/home/user/my-app",
                createdAt: "2026-03-11T12:00:00Z",
                updatedAt: "2026-03-11T12:00:00Z",
              },
              {
                id: "proj-2",
                name: "other-app",
                path: "/home/user/other-app",
                createdAt: "2026-03-11T12:00:00Z",
                updatedAt: "2026-03-11T12:00:00Z",
              },
            ],
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        ),
      ) as unknown as typeof globalThis.fetch;

      const tool = createGoopDaemonProjectsTool(ctx);
      const result = await tool.execute({ action: "list" }, toolContext);

      expect(result).toContain("Registered Projects");
      expect(result).toContain("my-app");
      expect(result).toContain("other-app");
    });

    it("returns message when no projects", async () => {
      globalThis.fetch = mock(async () =>
        new Response(
          JSON.stringify({ projects: [] }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        ),
      ) as unknown as typeof globalThis.fetch;

      const tool = createGoopDaemonProjectsTool(ctx);
      const result = await tool.execute({ action: "list" }, toolContext);

      expect(result).toContain("No projects registered");
    });
  });

  describe("register action", () => {
    it("registers project with daemon", async () => {
      globalThis.fetch = mock(async () =>
        new Response(
          JSON.stringify({
            project: {
              id: "proj-new",
              name: "test-project",
              path: ctx.input.directory,
              createdAt: "2026-03-11T12:00:00Z",
              updatedAt: "2026-03-11T12:00:00Z",
            },
          }),
          { status: 201, headers: { "Content-Type": "application/json" } },
        ),
      ) as unknown as typeof globalThis.fetch;

      const tool = createGoopDaemonProjectsTool(ctx);
      const result = await tool.execute(
        { action: "register", name: "test-project" },
        toolContext,
      );

      expect(result).toContain("Project registered");
      expect(result).toContain("test-project");
      expect(result).toContain("proj-new");
    });

    it("uses project name from state when not provided", async () => {
      let capturedBody: string | undefined;
      globalThis.fetch = mock(async (_url: string, init?: RequestInit) => {
        capturedBody = init?.body as string;
        return new Response(
          JSON.stringify({
            project: {
              id: "proj-auto",
              name: "test-project",
              path: ctx.input.directory,
              createdAt: "2026-03-11T12:00:00Z",
              updatedAt: "2026-03-11T12:00:00Z",
            },
          }),
          { status: 201, headers: { "Content-Type": "application/json" } },
        );
      }) as unknown as typeof globalThis.fetch;

      const tool = createGoopDaemonProjectsTool(ctx);
      await tool.execute({ action: "register" }, toolContext);

      expect(capturedBody).toBeDefined();
      const parsed = JSON.parse(capturedBody!);
      expect(parsed.name).toBe("test-project");
    });
  });

  describe("deregister action", () => {
    it("deregisters project by id", async () => {
      globalThis.fetch = mock(async () =>
        new Response(null, { status: 204 }),
      ) as unknown as typeof globalThis.fetch;

      const tool = createGoopDaemonProjectsTool(ctx);
      const result = await tool.execute(
        { action: "deregister", id: "proj-1" },
        toolContext,
      );

      expect(result).toContain("deregistered");
      expect(result).toContain("proj-1");
    });

    it("returns error when id is missing", async () => {
      const tool = createGoopDaemonProjectsTool(ctx);
      const result = await tool.execute(
        { action: "deregister" },
        toolContext,
      );

      expect(result).toContain("Error");
      expect(result).toContain("id");
    });
  });

  describe("daemon unavailable", () => {
    it("returns helpful message for all actions", async () => {
      globalThis.fetch = mock(async () => {
        throw new Error("Connection refused");
      }) as unknown as typeof globalThis.fetch;

      const tool = createGoopDaemonProjectsTool(ctx);

      for (const action of ["list", "register", "deregister"] as const) {
        const result = await tool.execute(
          { action, id: "proj-1", name: "test" },
          toolContext,
        );
        expect(result).toContain("Daemon is not running");
      }
    });
  });
});
