/**
 * Tests for the goop_daemon_items tool
 * @module tools/goop-daemon-items/index.test
 */

import { describe, it, expect, beforeEach, afterEach, mock } from "bun:test";
import { createGoopDaemonItemsTool } from "./index.js";
import {
  createMockPluginContext,
  createMockToolContext,
  setupTestEnvironment,
  type PluginContext,
} from "../../test-utils.js";

const MOCK_ITEMS = [
  {
    id: "item-1",
    projectId: "proj-1",
    title: "Add OAuth login",
    description: "Support Google and GitHub OAuth",
    type: "feature" as const,
    status: "in_progress" as const,
    priority: "high" as const,
    tags: ["auth", "oauth"],
    orderIndex: 0,
    createdAt: "2026-03-11T10:00:00Z",
    updatedAt: "2026-03-11T12:00:00Z",
  },
  {
    id: "item-2",
    projectId: "proj-1",
    title: "Fix login redirect",
    type: "bug" as const,
    status: "todo" as const,
    priority: "critical" as const,
    tags: ["auth"],
    orderIndex: 1,
    createdAt: "2026-03-11T11:00:00Z",
    updatedAt: "2026-03-11T11:00:00Z",
  },
];

describe("goop_daemon_items tool", () => {
  let ctx: PluginContext;
  let toolContext: ReturnType<typeof createMockToolContext>;
  let cleanup: () => void;
  let originalFetch: typeof globalThis.fetch;

  beforeEach(() => {
    const env = setupTestEnvironment("daemon-items-test");
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
      const tool = createGoopDaemonItemsTool(ctx);
      expect(tool.description).toContain("work items");
    });

    it("has required args", () => {
      const tool = createGoopDaemonItemsTool(ctx);
      expect(tool.args).toHaveProperty("action");
      expect(tool.args).toHaveProperty("projectId");
    });
  });

  describe("list action", () => {
    it("returns formatted item list", async () => {
      globalThis.fetch = mock(async () =>
        new Response(
          JSON.stringify({ items: MOCK_ITEMS }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        ),
      ) as unknown as typeof globalThis.fetch;

      const tool = createGoopDaemonItemsTool(ctx);
      const result = await tool.execute(
        { action: "list", projectId: "proj-1" },
        toolContext,
      );

      expect(result).toContain("Work Items");
      expect(result).toContain("Add OAuth login");
      expect(result).toContain("Fix login redirect");
      expect(result).toContain("feature");
      expect(result).toContain("bug");
    });

    it("returns message when no items", async () => {
      globalThis.fetch = mock(async () =>
        new Response(
          JSON.stringify({ items: [] }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        ),
      ) as unknown as typeof globalThis.fetch;

      const tool = createGoopDaemonItemsTool(ctx);
      const result = await tool.execute(
        { action: "list", projectId: "proj-1" },
        toolContext,
      );

      expect(result).toContain("No work items found");
    });
  });

  describe("get action", () => {
    it("returns specific item details", async () => {
      globalThis.fetch = mock(async () =>
        new Response(
          JSON.stringify({ item: MOCK_ITEMS[0] }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        ),
      ) as unknown as typeof globalThis.fetch;

      const tool = createGoopDaemonItemsTool(ctx);
      const result = await tool.execute(
        { action: "get", projectId: "proj-1", itemId: "item-1" },
        toolContext,
      );

      expect(result).toContain("Add OAuth login");
      expect(result).toContain("feature");
      expect(result).toContain("in_progress");
      expect(result).toContain("high");
      expect(result).toContain("auth, oauth");
    });

    it("returns error when itemId is missing", async () => {
      const tool = createGoopDaemonItemsTool(ctx);
      const result = await tool.execute(
        { action: "get", projectId: "proj-1" },
        toolContext,
      );

      expect(result).toContain("Error");
      expect(result).toContain("itemId");
    });
  });

  describe("create action", () => {
    it("creates a new work item", async () => {
      globalThis.fetch = mock(async () =>
        new Response(
          JSON.stringify({
            item: {
              id: "item-new",
              projectId: "proj-1",
              title: "New feature",
              type: "feature",
              status: "backlog",
              priority: "medium",
              tags: ["ui"],
              orderIndex: 2,
              createdAt: "2026-03-11T13:00:00Z",
              updatedAt: "2026-03-11T13:00:00Z",
            },
          }),
          { status: 201, headers: { "Content-Type": "application/json" } },
        ),
      ) as unknown as typeof globalThis.fetch;

      const tool = createGoopDaemonItemsTool(ctx);
      const result = await tool.execute(
        {
          action: "create",
          projectId: "proj-1",
          title: "New feature",
          type: "feature",
          priority: "medium",
          tags: ["ui"],
        },
        toolContext,
      );

      expect(result).toContain("Work item created");
      expect(result).toContain("New feature");
      expect(result).toContain("item-new");
    });

    it("returns error when title is missing", async () => {
      const tool = createGoopDaemonItemsTool(ctx);
      const result = await tool.execute(
        { action: "create", projectId: "proj-1" },
        toolContext,
      );

      expect(result).toContain("Error");
      expect(result).toContain("title");
    });
  });

  describe("update action", () => {
    it("updates an existing work item", async () => {
      globalThis.fetch = mock(async () =>
        new Response(
          JSON.stringify({
            item: {
              ...MOCK_ITEMS[0],
              status: "review",
            },
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        ),
      ) as unknown as typeof globalThis.fetch;

      const tool = createGoopDaemonItemsTool(ctx);
      const result = await tool.execute(
        {
          action: "update",
          projectId: "proj-1",
          itemId: "item-1",
          status: "review",
        },
        toolContext,
      );

      expect(result).toContain("Work item updated");
      expect(result).toContain("Add OAuth login");
    });

    it("returns error when itemId is missing", async () => {
      const tool = createGoopDaemonItemsTool(ctx);
      const result = await tool.execute(
        { action: "update", projectId: "proj-1", status: "done" },
        toolContext,
      );

      expect(result).toContain("Error");
      expect(result).toContain("itemId");
    });
  });

  describe("daemon unavailable", () => {
    it("returns helpful message for all actions", async () => {
      globalThis.fetch = mock(async () => {
        throw new Error("Connection refused");
      }) as unknown as typeof globalThis.fetch;

      const tool = createGoopDaemonItemsTool(ctx);

      const result = await tool.execute(
        { action: "list", projectId: "proj-1" },
        toolContext,
      );
      expect(result).toContain("Daemon is not running");
    });
  });

  describe("API error handling", () => {
    it("returns API error details on non-2xx", async () => {
      globalThis.fetch = mock(async () =>
        new Response("Not Found", { status: 404 }),
      ) as unknown as typeof globalThis.fetch;

      const tool = createGoopDaemonItemsTool(ctx);
      const result = await tool.execute(
        { action: "get", projectId: "proj-1", itemId: "nonexistent" },
        toolContext,
      );

      expect(result).toContain("Daemon API error");
      expect(result).toContain("404");
    });
  });
});
