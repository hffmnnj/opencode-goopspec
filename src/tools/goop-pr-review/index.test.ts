/**
 * Tests for PR Review types and spec-context detection
 * @module tools/goop-pr-review/index.test
 */

import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import { mkdirSync, writeFileSync } from "fs";
import { join } from "path";
import {
  setupTestEnvironment,
} from "../../test-utils.js";
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
