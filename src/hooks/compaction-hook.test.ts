import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import { createCompactionHook } from "./compaction-hook.js";
import {
  setupTestEnvironment,
  createMockPluginContext,
  type PluginContext,
} from "../test-utils.js";

describe("compaction hook", () => {
  let cleanup: () => void;
  let testDir: string;
  let ctx: PluginContext;

  beforeEach(() => {
    const env = setupTestEnvironment("compaction-hook-test");
    cleanup = env.cleanup;
    testDir = env.testDir;
    ctx = createMockPluginContext({ testDir });
  });

  afterEach(() => {
    cleanup();
  });

  describe("registration and basic firing", () => {
    it("factory returns async function", () => {
      const hook = createCompactionHook(ctx);
      expect(typeof hook).toBe("function");
      expect(hook.constructor.name).toBe("AsyncFunction");
    });

    it("hook pushes at least one string to output.context", async () => {
      const hook = createCompactionHook(ctx);
      const output: { context: string[]; prompt?: string } = { context: [] };

      await hook(undefined, output);

      expect(output.context.length).toBeGreaterThan(0);
      for (const entry of output.context) {
        expect(typeof entry).toBe("string");
      }
      expect(output.prompt).toBeUndefined();
    });

    it("output.prompt is undefined after hook runs", async () => {
      const hook = createCompactionHook(ctx);
      const output: { context: string[]; prompt?: string } = { context: [] };

      await hook(undefined, output);

      expect(output.prompt).toBeUndefined();
    });

    it("hook does not throw with minimal mock context", async () => {
      const minimalCtx = createMockPluginContext({ testDir });
      const hook = createCompactionHook(minimalCtx);
      const output: { context: string[]; prompt?: string } = { context: [] };

      // Should complete without throwing
      await hook(undefined, output);

      expect(output.context.length).toBeGreaterThan(0);
      expect(output.prompt).toBeUndefined();
    });
  });
});
