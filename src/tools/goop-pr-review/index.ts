/**
 * GoopSpec PR Review Tool
 *
 * Validates GitHub CLI availability, resolves PR metadata, and
 * displays PR context before analysis. This is the foundation
 * for the full /goop-pr-review command.
 *
 * @module tools/goop-pr-review
 */

import { tool, type ToolDefinition } from "@opencode-ai/plugin/tool";
import type { PluginContext, ToolContext } from "../../core/types.js";
import { ghPreflight, resolvePr, formatPrSummary } from "./github.js";

/**
 * Create the goop_pr_review tool
 */
export function createGoopPrReviewTool(ctx: PluginContext): ToolDefinition {
  void ctx;

  return tool({
    description:
      "Review a GitHub pull request: validates gh CLI, resolves PR metadata, and displays context",
    args: {
      pr: tool.schema.string().optional(),
    },
    async execute(args, _context: ToolContext): Promise<string> {
      const lines: string[] = [];

      // Step 1: Preflight — verify gh is installed and authenticated
      const preflight = await ghPreflight();
      if (!preflight.ok) {
        lines.push("## ❌ GitHub CLI Preflight Failed");
        lines.push("");
        lines.push(`**Error:** ${preflight.error}`);
        if (preflight.remediation) {
          lines.push(`**Fix:** ${preflight.remediation}`);
        }
        return lines.join("\n");
      }

      // Step 2: Require PR input
      if (!args.pr) {
        lines.push("## PR Review");
        lines.push("");
        lines.push("Provide a PR number or URL to review.");
        lines.push("");
        lines.push("**Usage:** `goop_pr_review({ pr: \"42\" })` or `goop_pr_review({ pr: \"https://github.com/owner/repo/pull/42\" })`");
        return lines.join("\n");
      }

      // Step 3: Resolve PR metadata
      const result = await resolvePr(args.pr);
      if (!result.ok || !result.pr) {
        lines.push("## ❌ PR Resolution Failed");
        lines.push("");
        lines.push(`**Error:** ${result.error}`);
        if (result.remediation) {
          lines.push(`**Fix:** ${result.remediation}`);
        }
        return lines.join("\n");
      }

      // Step 4: Display PR summary
      lines.push(formatPrSummary(result.pr));
      lines.push("");
      lines.push("---");
      lines.push("");
      lines.push("PR resolved successfully. Ready for review analysis.");

      return lines.join("\n");
    },
  });
}
