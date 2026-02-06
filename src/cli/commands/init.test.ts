import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { existsSync, mkdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { applyInit, detectEnvironment, planInit } from "../../features/setup/index.js";
import { AGENT_MODEL_SUGGESTIONS, ALL_AGENTS } from "../../features/setup/model-suggestions.js";
import { MCP_PRESETS } from "../../features/setup/types.js";
import type { SetupInput } from "../../features/setup/types.js";

describe("init command dependencies", () => {
  let testDir = "";

  beforeEach(() => {
    testDir = join(tmpdir(), `goopspec-init-test-${Date.now()}-${Math.random().toString(16).slice(2)}`);
    mkdirSync(testDir, { recursive: true });
  });

  afterEach(() => {
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }
  });

  it("detects environment for uninitialized directory", async () => {
    const env = await detectEnvironment(testDir);

    expect(env.hasGoopspecDir).toBe(false);
    expect(env.hasStateFile).toBe(false);
    expect(env.goopspecDir).toContain(".goopspec");
  });

  it("creates plan for new project", async () => {
    const env = await detectEnvironment(testDir);
    const input: SetupInput = {
      scope: "project",
      projectName: "test-project",
      models: {},
      mcpPreset: "none",
    };

    const plan = await planInit(testDir, input, env);

    expect(plan.isInit).toBe(true);
    expect(plan.projectName).toBe("test-project");
    expect(plan.dirsToCreate).toBeDefined();
    expect(plan.dirsToCreate?.length).toBeGreaterThan(0);
  });

  it("applies init plan and creates files", async () => {
    const env = await detectEnvironment(testDir);
    const input: SetupInput = {
      scope: "project",
      projectName: "test-project",
      models: {},
      mcpPreset: "none",
    };

    const plan = await planInit(testDir, input, env);
    const result = await applyInit(testDir, plan);

    expect(result.success).toBe(true);
    expect(result.projectName).toBe("test-project");
    expect(result.created.length).toBeGreaterThan(0);

    const goopspecDir = join(testDir, ".goopspec");
    expect(existsSync(goopspecDir)).toBe(true);
    expect(existsSync(join(goopspecDir, "state.json"))).toBe(true);
  });
});

describe("init command data dependencies", () => {
  it("has all 11 agents in model suggestions", () => {
    expect(ALL_AGENTS.length).toBe(11);
    expect(AGENT_MODEL_SUGGESTIONS["goop-orchestrator"]).toBeDefined();
    expect(AGENT_MODEL_SUGGESTIONS["goop-executor"]).toBeDefined();
  });

  it("has valid MCP presets", () => {
    expect(MCP_PRESETS.core).toContain("context7");
    expect(MCP_PRESETS.recommended.length).toBeGreaterThan(MCP_PRESETS.core.length);
    expect(MCP_PRESETS.none).toHaveLength(0);
  });
});
