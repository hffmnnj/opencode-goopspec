import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { existsSync, readFileSync } from "fs";
import { join } from "path";

import { createStateManager } from "../state-manager/manager.js";
import {
  createMockPluginContext,
  setupTestEnvironment,
  type PluginContext,
  waitFor,
} from "../../test-utils.js";

import { clearSession, setSession } from "./binding.js";

describe("session binding", () => {
  let testDir: string;
  let cleanup: () => void;
  let ctx: PluginContext;

  beforeEach(() => {
    const env = setupTestEnvironment("session-binding");
    testDir = env.testDir;
    cleanup = env.cleanup;

    ctx = createMockPluginContext({ testDir });
    ctx.stateManager = createStateManager(testDir, "test-project", ctx.config);
    ctx.sessionId = undefined;
  });

  afterEach(() => {
    cleanup();
  });

  it("sets a session and rebinds state manager to session scope", async () => {
    setSession(ctx, "feature-alpha");

    expect(ctx.sessionId).toBe("feature-alpha");

    await waitFor(() => existsSync(join(testDir, ".goopspec", "sessions", "feature-alpha")));
    expect(existsSync(join(testDir, ".goopspec", "sessions", "feature-alpha", "checkpoints"))).toBe(true);
    expect(existsSync(join(testDir, ".goopspec", "sessions", "feature-alpha", "history"))).toBe(true);

    ctx.stateManager.setState({
      project: {
        name: "feature-alpha-project",
        initialized: new Date().toISOString(),
      },
    });

    expect(existsSync(join(testDir, ".goopspec", "sessions", "feature-alpha", "state.json"))).toBe(true);
    expect(existsSync(join(testDir, ".goopspec", "state.json"))).toBe(false);
  });

  it("clears a session and reverts state manager to root scope", () => {
    setSession(ctx, "feature-clear");

    ctx.stateManager.setState({
      project: {
        name: "feature-clear-project",
        initialized: new Date().toISOString(),
      },
    });
    expect(existsSync(join(testDir, ".goopspec", "sessions", "feature-clear", "state.json"))).toBe(true);

    clearSession(ctx);
    expect(ctx.sessionId).toBeUndefined();

    ctx.stateManager.setState({
      project: {
        name: "root-project",
        initialized: new Date().toISOString(),
      },
    });

    expect(existsSync(join(testDir, ".goopspec", "state.json"))).toBe(true);
  });

  it("supports multiple session rebinds with different IDs", () => {
    setSession(ctx, "feature-one");
    ctx.stateManager.setState({
      project: {
        name: "feature-one",
        initialized: new Date().toISOString(),
      },
    });

    setSession(ctx, "feature-two");
    ctx.stateManager.setState({
      project: {
        name: "feature-two",
        initialized: new Date().toISOString(),
      },
    });

    const featureOneStatePath = join(testDir, ".goopspec", "sessions", "feature-one", "state.json");
    const featureTwoStatePath = join(testDir, ".goopspec", "sessions", "feature-two", "state.json");

    expect(ctx.sessionId).toBe("feature-two");
    expect(existsSync(featureOneStatePath)).toBe(true);
    expect(existsSync(featureTwoStatePath)).toBe(true);

    const featureOneState = JSON.parse(readFileSync(featureOneStatePath, "utf-8")) as {
      project: { name: string };
    };
    const featureTwoState = JSON.parse(readFileSync(featureTwoStatePath, "utf-8")) as {
      project: { name: string };
    };

    expect(featureOneState.project.name).toBe("feature-one");
    expect(featureTwoState.project.name).toBe("feature-two");
  });
});
