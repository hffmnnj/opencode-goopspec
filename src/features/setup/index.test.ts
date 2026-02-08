import { afterEach, describe, expect, it } from "bun:test";
import { mkdtempSync, readFileSync, rmSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";

import { applySetup } from "./index.js";
import type { SetupPlan } from "./types.js";

describe("setup applySetup path handling", () => {
  const tempDirs: string[] = [];

  afterEach(() => {
    while (tempDirs.length > 0) {
      const dir = tempDirs.pop();
      if (dir) {
        rmSync(dir, { recursive: true, force: true });
      }
    }
  });

  it("writes config file into a nested directory", async () => {
    const baseDir = mkdtempSync(join(tmpdir(), "goopspec-setup-test-"));
    tempDirs.push(baseDir);
    const configPath = join(baseDir, ".config", "opencode", "goopspec.json");

    const plan: SetupPlan = {
      actions: [],
      summary: "",
      mcpsToInstall: [],
      configsToWrite: [
        {
          path: configPath,
          scope: "global",
          content: { test: true },
        },
      ],
      dirsToCreate: [],
    };

    const result = await applySetup(plan);

    expect(result.success).toBe(true);
    expect(result.configsWritten).toEqual([configPath]);
    expect(JSON.parse(readFileSync(configPath, "utf-8"))).toEqual({ test: true });
  });

  it("handles Unix-style paths without mkdir('') errors", async () => {
    const baseDir = mkdtempSync(join(tmpdir(), "goopspec-setup-test-"));
    tempDirs.push(baseDir);
    const configPath = `${baseDir}/deep/nested/goopspec.json`;

    const plan: SetupPlan = {
      actions: [],
      summary: "",
      mcpsToInstall: [],
      configsToWrite: [
        {
          path: configPath,
          scope: "project",
          content: { nested: true },
        },
      ],
      dirsToCreate: [],
    };

    const result = await applySetup(plan);

    expect(result.success).toBe(true);
    expect(result.errors).toEqual([]);
    expect(JSON.parse(readFileSync(configPath, "utf-8"))).toEqual({ nested: true });
  });
});
