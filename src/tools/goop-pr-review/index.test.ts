/**
 * Tests for PR Review: types, spec-context detection, preflight, and resolver
 * @module tools/goop-pr-review/index.test
 */

import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import { mkdirSync, writeFileSync } from "fs";
import { join } from "path";
import {
  createMockPluginContext,
  createMockToolContext,
  setupTestEnvironment,
  type PluginContext,
} from "../../test-utils.js";
import { createGoopPrReviewTool } from "./index.js";
import {
  ghPreflight,
  resolvePr,
  parsePrInput,
  formatPrSummary,
  type ExecResult,
} from "./github.js";
import {
  PrMetadataSchema,
  createDefaultReport,
  createEmptyQualitySection,
  createEmptySecuritySection,
  createNoSpecSection,
  createEmptyChangeSummary,
  type PrMetadata,
  type ReviewReport,
  type QualitySection,
  type SecuritySection,
  type SpecSection,
  type ChangeSummarySection,
  type ReviewFinding,
  type FixCategory,
  FIX_CATEGORIES,
  FINDING_SEVERITIES,
  CHECK_STATUSES,
  REVIEW_VERDICTS,
} from "./types.js";
import { detectSpecContext, isSpecModeEnabled } from "./spec-context.js";

// ============================================================================
// Fixtures
// ============================================================================

function validPrMetadata(): PrMetadata {
  return {
    number: 42,
    title: "Add user authentication",
    author: "dev-user",
    sourceBranch: "feat/auth",
    targetBranch: "main",
    state: "open",
    url: "https://github.com/org/repo/pull/42",
    additions: 150,
    deletions: 30,
    changedFiles: 8,
  };
}

// ============================================================================
// Report Schema Tests
// ============================================================================

describe("report-schema", () => {
  describe("PrMetadataSchema validation", () => {
    it("accepts valid PR metadata", () => {
      const result = PrMetadataSchema.safeParse(validPrMetadata());
      expect(result.success).toBe(true);
    });

    it("rejects missing required fields", () => {
      const result = PrMetadataSchema.safeParse({ number: 1 });
      expect(result.success).toBe(false);
    });

    it("rejects invalid state value", () => {
      const data = { ...validPrMetadata(), state: "draft" };
      const result = PrMetadataSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("defaults additions/deletions/changedFiles to 0", () => {
      const minimal = {
        number: 1,
        title: "Test",
        author: "user",
        sourceBranch: "feat/x",
        targetBranch: "main",
        state: "open",
        url: "https://github.com/org/repo/pull/1",
      };
      const result = PrMetadataSchema.safeParse(minimal);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.additions).toBe(0);
        expect(result.data.deletions).toBe(0);
        expect(result.data.changedFiles).toBe(0);
      }
    });
  });

  describe("constant arrays", () => {
    it("defines expected finding severities", () => {
      expect(FINDING_SEVERITIES).toContain("critical");
      expect(FINDING_SEVERITIES).toContain("info");
      expect(FINDING_SEVERITIES.length).toBe(5);
    });

    it("defines expected check statuses", () => {
      expect(CHECK_STATUSES).toContain("pass");
      expect(CHECK_STATUSES).toContain("fail");
      expect(CHECK_STATUSES.length).toBe(4);
    });

    it("defines expected review verdicts", () => {
      expect(REVIEW_VERDICTS).toContain("approve");
      expect(REVIEW_VERDICTS).toContain("request-changes");
      expect(REVIEW_VERDICTS.length).toBe(3);
    });

    it("defines expected fix categories", () => {
      expect(FIX_CATEGORIES).toContain("lint");
      expect(FIX_CATEGORIES).toContain("tests");
      expect(FIX_CATEGORIES).toContain("comments");
      expect(FIX_CATEGORIES).toContain("requirements");
      expect(FIX_CATEGORIES.length).toBe(4);
    });
  });

  describe("factory helpers", () => {
    it("creates empty quality section", () => {
      const section: QualitySection = createEmptyQualitySection();
      expect(section.checks).toEqual([]);
      expect(section.findings).toEqual([]);
      expect(section.summary).toBeTruthy();
    });

    it("creates empty security section", () => {
      const section: SecuritySection = createEmptySecuritySection();
      expect(section.findings).toEqual([]);
      expect(section.summary).toBeTruthy();
    });

    it("creates no-spec section with available=false", () => {
      const section: SpecSection = createNoSpecSection();
      expect(section.available).toBe(false);
      expect(section.requirements).toEqual([]);
      expect(section.summary).toContain("skipped");
    });

    it("creates empty change summary", () => {
      const section: ChangeSummarySection = createEmptyChangeSummary();
      expect(section.filesChanged).toEqual([]);
      expect(section.additions).toBe(0);
      expect(section.deletions).toBe(0);
    });
  });

  describe("createDefaultReport", () => {
    it("creates report with spec mode enabled", () => {
      const pr = validPrMetadata();
      const report: ReviewReport = createDefaultReport(pr, true);

      expect(report.pr).toEqual(pr);
      expect(report.spec.available).toBe(true);
      expect(report.verdict).toBe("comment");
      expect(report.fixOptions).toEqual([]);
      expect(report.generatedAt).toBeTruthy();
      expect(report.changeSummary.additions).toBe(150);
      expect(report.changeSummary.deletions).toBe(30);
    });

    it("creates report with spec mode disabled", () => {
      const pr = validPrMetadata();
      const report: ReviewReport = createDefaultReport(pr, false);

      expect(report.spec.available).toBe(false);
      expect(report.spec.summary).toContain("skipped");
    });

    it("populates change summary from PR metadata", () => {
      const pr = validPrMetadata();
      const report = createDefaultReport(pr, false);

      expect(report.changeSummary.summary).toContain("8 file(s)");
      expect(report.changeSummary.summary).toContain("+150");
      expect(report.changeSummary.summary).toContain("-30");
    });
  });

  describe("type contracts", () => {
    it("ReviewFinding supports optional fields", () => {
      const finding: ReviewFinding = {
        severity: "high",
        category: "security",
        message: "Hardcoded secret detected",
      };
      expect(finding.file).toBeUndefined();
      expect(finding.line).toBeUndefined();
      expect(finding.suggestion).toBeUndefined();
    });

    it("ReviewFinding supports all optional fields populated", () => {
      const finding: ReviewFinding = {
        severity: "medium",
        category: "quality",
        message: "Unused import",
        file: "src/index.ts",
        line: 5,
        suggestion: "Remove unused import",
      };
      expect(finding.file).toBe("src/index.ts");
      expect(finding.line).toBe(5);
      expect(finding.suggestion).toBeTruthy();
    });

    it("FixCategory values match spec requirements", () => {
      const categories: FixCategory[] = [...FIX_CATEGORIES];
      expect(categories).toContain("lint");
      expect(categories).toContain("tests");
      expect(categories).toContain("comments");
      expect(categories).toContain("requirements");
    });
  });
});

// ============================================================================
// Spec Context Tests
// ============================================================================

describe("spec-context", () => {
  let testDir: string;
  let cleanup: () => void;

  beforeEach(() => {
    const env = setupTestEnvironment("pr-review-spec-ctx");
    testDir = env.testDir;
    cleanup = env.cleanup;
  });

  afterEach(() => {
    cleanup();
  });

  describe("detectSpecContext", () => {
    it("detects both files present", () => {
      writeFileSync(join(testDir, ".goopspec", "SPEC.md"), "# Spec");
      writeFileSync(join(testDir, ".goopspec", "BLUEPRINT.md"), "# Blueprint");

      const result = detectSpecContext(testDir);

      expect(result.specExists).toBe(true);
      expect(result.blueprintExists).toBe(true);
      expect(result.specPath).toContain("SPEC.md");
      expect(result.blueprintPath).toContain("BLUEPRINT.md");
    });

    it("detects only SPEC.md present", () => {
      writeFileSync(join(testDir, ".goopspec", "SPEC.md"), "# Spec");

      const result = detectSpecContext(testDir);

      expect(result.specExists).toBe(true);
      expect(result.blueprintExists).toBe(false);
    });

    it("detects only BLUEPRINT.md present", () => {
      writeFileSync(join(testDir, ".goopspec", "BLUEPRINT.md"), "# Blueprint");

      const result = detectSpecContext(testDir);

      expect(result.specExists).toBe(false);
      expect(result.blueprintExists).toBe(true);
    });

    it("detects neither file present", () => {
      const result = detectSpecContext(testDir);

      expect(result.specExists).toBe(false);
      expect(result.blueprintExists).toBe(false);
    });

    it("handles missing .goopspec directory", () => {
      const emptyDir = join(testDir, "empty-project");
      mkdirSync(emptyDir, { recursive: true });

      const result = detectSpecContext(emptyDir);

      expect(result.specExists).toBe(false);
      expect(result.blueprintExists).toBe(false);
    });

    it("returns correct absolute paths", () => {
      const result = detectSpecContext(testDir);

      expect(result.specPath).toBe(join(testDir, ".goopspec", "SPEC.md"));
      expect(result.blueprintPath).toBe(join(testDir, ".goopspec", "BLUEPRINT.md"));
    });
  });

  describe("isSpecModeEnabled", () => {
    it("returns true when SPEC.md exists", () => {
      writeFileSync(join(testDir, ".goopspec", "SPEC.md"), "# Spec");
      const availability = detectSpecContext(testDir);

      expect(isSpecModeEnabled(availability)).toBe(true);
    });

    it("returns true when both files exist", () => {
      writeFileSync(join(testDir, ".goopspec", "SPEC.md"), "# Spec");
      writeFileSync(join(testDir, ".goopspec", "BLUEPRINT.md"), "# Blueprint");
      const availability = detectSpecContext(testDir);

      expect(isSpecModeEnabled(availability)).toBe(true);
    });

    it("returns false when only BLUEPRINT.md exists", () => {
      writeFileSync(join(testDir, ".goopspec", "BLUEPRINT.md"), "# Blueprint");
      const availability = detectSpecContext(testDir);

      expect(isSpecModeEnabled(availability)).toBe(false);
    });

    it("returns false when no spec files exist", () => {
      const availability = detectSpecContext(testDir);

      expect(isSpecModeEnabled(availability)).toBe(false);
    });
  });
});

// ============================================================================
// Test Helpers for gh mock
// ============================================================================

function mockExec(overrides: Partial<ExecResult> = {}): (cmd: string) => Promise<ExecResult> {
  return async () => ({
    stdout: "",
    stderr: "",
    exitCode: 0,
    ...overrides,
  });
}

function mockExecByCommand(
  handlers: Record<string, Partial<ExecResult>>,
): (cmd: string) => Promise<ExecResult> {
  return async (cmd: string) => {
    for (const [pattern, result] of Object.entries(handlers)) {
      if (cmd.includes(pattern)) {
        return { stdout: "", stderr: "", exitCode: 0, ...result };
      }
    }
    return { stdout: "", stderr: "unknown command", exitCode: 1 };
  };
}

const SAMPLE_PR_JSON: string = JSON.stringify({
  number: 42,
  title: "Add user authentication",
  author: { login: "octocat" },
  state: "OPEN",
  headRefName: "feat/auth",
  baseRefName: "main",
  url: "https://github.com/owner/repo/pull/42",
  additions: 150,
  deletions: 30,
  changedFiles: 8,
  isDraft: false,
});

// ============================================================================
// parsePrInput
// ============================================================================

describe("parsePrInput", () => {
  it("parses plain number", () => {
    expect(parsePrInput("42")).toBe(42);
  });

  it("parses number with whitespace", () => {
    expect(parsePrInput("  42  ")).toBe(42);
  });

  it("parses GitHub URL", () => {
    expect(parsePrInput("https://github.com/owner/repo/pull/99")).toBe(99);
  });

  it("parses GitHub URL with trailing slash", () => {
    expect(parsePrInput("https://github.com/owner/repo/pull/7/")).toBe(7);
  });

  it("parses GitHub URL with extra path segments", () => {
    expect(parsePrInput("https://github.com/owner/repo/pull/7/files")).toBe(7);
  });

  it("returns null for non-numeric text", () => {
    expect(parsePrInput("not-a-number")).toBeNull();
  });

  it("returns null for empty string", () => {
    expect(parsePrInput("")).toBeNull();
  });

  it("returns null for URL without pull segment", () => {
    expect(parsePrInput("https://github.com/owner/repo/issues/5")).toBeNull();
  });
});

// ============================================================================
// ghPreflight
// ============================================================================

describe("preflight", () => {
  it("succeeds when gh is installed and authenticated", async () => {
    const run = mockExecByCommand({
      "gh --version": { stdout: "gh version 2.45.0 (2024-01-01)" },
      "gh auth status": { stdout: "Logged in to github.com" },
    });

    const result = await ghPreflight(run);

    expect(result.ok).toBe(true);
    expect(result.ghVersion).toBe("2.45.0");
    expect(result.authenticated).toBe(true);
  });

  it("fails when gh is not installed", async () => {
    const run = mockExec({ exitCode: 127, stderr: "command not found: gh" });

    const result = await ghPreflight(run);

    expect(result.ok).toBe(false);
    expect(result.error).toContain("not installed");
    expect(result.remediation).toContain("https://cli.github.com/");
  });

  it("fails when gh is not authenticated", async () => {
    const run = mockExecByCommand({
      "gh --version": { stdout: "gh version 2.45.0 (2024-01-01)" },
      "gh auth status": { exitCode: 1, stderr: "not logged in" },
    });

    const result = await ghPreflight(run);

    expect(result.ok).toBe(false);
    expect(result.authenticated).toBe(false);
    expect(result.error).toContain("not authenticated");
    expect(result.remediation).toContain("gh auth login");
  });

  it("extracts version even with multi-line output", async () => {
    const run = mockExecByCommand({
      "gh --version": {
        stdout: "gh version 2.50.0 (2024-06-01)\nhttps://github.com/cli/cli/releases/tag/v2.50.0",
      },
      "gh auth status": { stdout: "Logged in" },
    });

    const result = await ghPreflight(run);

    expect(result.ok).toBe(true);
    expect(result.ghVersion).toBe("2.50.0");
  });
});

// ============================================================================
// resolvePr
// ============================================================================

describe("resolver", () => {
  it("resolves an open PR by number", async () => {
    const run = mockExecByCommand({
      "gh pr view": { stdout: SAMPLE_PR_JSON },
    });

    const result = await resolvePr("42", run);

    expect(result.ok).toBe(true);
    expect(result.pr).toBeDefined();
    expect(result.pr!.number).toBe(42);
    expect(result.pr!.title).toBe("Add user authentication");
    expect(result.pr!.author).toBe("octocat");
    expect(result.pr!.state).toBe("open");
    expect(result.pr!.sourceBranch).toBe("feat/auth");
    expect(result.pr!.targetBranch).toBe("main");
    expect(result.pr!.additions).toBe(150);
    expect(result.pr!.deletions).toBe(30);
    expect(result.pr!.changedFiles).toBe(8);
  });

  it("resolves a PR from a GitHub URL", async () => {
    const run = mockExecByCommand({
      "gh pr view": { stdout: SAMPLE_PR_JSON },
    });

    const result = await resolvePr("https://github.com/owner/repo/pull/42", run);

    expect(result.ok).toBe(true);
    expect(result.pr!.number).toBe(42);
  });

  it("rejects invalid input format", async () => {
    const run = mockExec();

    const result = await resolvePr("not-valid", run);

    expect(result.ok).toBe(false);
    expect(result.error).toContain("Invalid PR reference");
    expect(result.remediation).toContain("Examples");
  });

  it("handles PR not found", async () => {
    const run = mockExecByCommand({
      "gh pr view": {
        exitCode: 1,
        stderr: "Could not resolve to a PullRequest",
      },
    });

    const result = await resolvePr("9999", run);

    expect(result.ok).toBe(false);
    expect(result.error).toContain("not found");
    expect(result.remediation).toContain("Verify the PR number");
  });

  it("handles closed PR", async () => {
    const closedPr = JSON.stringify({
      number: 10,
      title: "Old feature",
      author: { login: "dev" },
      state: "CLOSED",
      headRefName: "feat/old",
      baseRefName: "main",
      url: "https://github.com/owner/repo/pull/10",
      additions: 5,
      deletions: 2,
      changedFiles: 1,
      isDraft: false,
    });

    const run = mockExecByCommand({
      "gh pr view": { stdout: closedPr },
    });

    const result = await resolvePr("10", run);

    expect(result.ok).toBe(false);
    expect(result.error).toContain("closed");
    expect(result.remediation).toContain("Reopen");
  });

  it("handles merged PR", async () => {
    const mergedPr = JSON.stringify({
      number: 11,
      title: "Merged feature",
      author: { login: "dev" },
      state: "MERGED",
      headRefName: "feat/done",
      baseRefName: "main",
      url: "https://github.com/owner/repo/pull/11",
      additions: 20,
      deletions: 5,
      changedFiles: 3,
      isDraft: false,
    });

    const run = mockExecByCommand({
      "gh pr view": { stdout: mergedPr },
    });

    const result = await resolvePr("11", run);

    expect(result.ok).toBe(false);
    expect(result.error).toContain("merged");
    expect(result.remediation).toContain("open PR");
  });

  it("handles gh command failure", async () => {
    const run = mockExecByCommand({
      "gh pr view": {
        exitCode: 1,
        stderr: "HTTP 500: Internal Server Error",
      },
    });

    const result = await resolvePr("42", run);

    expect(result.ok).toBe(false);
    expect(result.error).toContain("Failed to fetch");
    expect(result.remediation).toContain("network");
  });

  it("handles malformed JSON from gh", async () => {
    const run = mockExecByCommand({
      "gh pr view": { stdout: "not json {{{" },
    });

    const result = await resolvePr("42", run);

    expect(result.ok).toBe(false);
    expect(result.error).toContain("parse");
  });

  it("handles missing author gracefully", async () => {
    const noAuthor = JSON.stringify({
      number: 42,
      title: "No author PR",
      author: null,
      state: "OPEN",
      headRefName: "feat/x",
      baseRefName: "main",
      url: "https://github.com/owner/repo/pull/42",
      additions: 1,
      deletions: 0,
      changedFiles: 1,
      isDraft: false,
    });

    const run = mockExecByCommand({
      "gh pr view": { stdout: noAuthor },
    });

    const result = await resolvePr("42", run);

    expect(result.ok).toBe(true);
    expect(result.pr!.author).toBe("unknown");
  });
});

// ============================================================================
// formatPrSummary
// ============================================================================

describe("formatPrSummary", () => {
  const pr: PrMetadata = {
    number: 42,
    title: "Add user authentication",
    author: "octocat",
    state: "open",
    sourceBranch: "feat/auth",
    targetBranch: "main",
    url: "https://github.com/owner/repo/pull/42",
    additions: 150,
    deletions: 30,
    changedFiles: 8,
  };

  it("includes PR number and title", () => {
    const summary = formatPrSummary(pr);
    expect(summary).toContain("PR #42");
    expect(summary).toContain("Add user authentication");
  });

  it("includes author", () => {
    const summary = formatPrSummary(pr);
    expect(summary).toContain("octocat");
  });

  it("includes branch info", () => {
    const summary = formatPrSummary(pr);
    expect(summary).toContain("feat/auth");
    expect(summary).toContain("main");
  });

  it("includes change stats", () => {
    const summary = formatPrSummary(pr);
    expect(summary).toContain("+150");
    expect(summary).toContain("-30");
    expect(summary).toContain("8 files");
  });

  it("includes URL", () => {
    const summary = formatPrSummary(pr);
    expect(summary).toContain("https://github.com/owner/repo/pull/42");
  });
});

// ============================================================================
// Tool Integration
// ============================================================================

describe("createGoopPrReviewTool", () => {
  let ctx: PluginContext;
  let toolContext: ReturnType<typeof createMockToolContext>;
  let cleanup: () => void;

  beforeEach(() => {
    const env = setupTestEnvironment("goop-pr-review-test");
    cleanup = env.cleanup;
    ctx = createMockPluginContext({ testDir: env.testDir });
    toolContext = createMockToolContext({ directory: env.testDir });
  });

  afterEach(() => {
    cleanup();
  });

  it("creates tool with correct description", () => {
    const t = createGoopPrReviewTool(ctx);
    expect(t.description).toContain("pull request");
  });

  it("creates tool with pr arg", () => {
    const t = createGoopPrReviewTool(ctx);
    expect(t.args).toHaveProperty("pr");
  });

  it("returns a string result when executed without args", async () => {
    const t = createGoopPrReviewTool(ctx);
    const result = await t.execute({}, toolContext);

    // Either preflight fails (no gh in CI) or it asks for PR input
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
  });
});
