/**
 * PR Review Fix Orchestrator
 *
 * Routes selected fix categories to deterministic handlers and/or
 * delegated executor agents while tracking auditable execution status.
 *
 * @module tools/goop-pr-review/fix-orchestrator
 */

import { log, logError } from "../../shared/logger.js";
import { FIX_CATEGORIES, type FixCategory, type ReviewContext } from "./types.js";

export const FIX_EXECUTION_STATUSES = ["applied", "skipped", "failed"] as const;
export type FixExecutionStatus = (typeof FIX_EXECUTION_STATUSES)[number];

export interface FixDelegationRequest {
  category: FixCategory;
  agent: "goop-executor-low" | "goop-executor-medium" | "goop-executor-high" | "goop-executor-frontend";
  reason: string;
}

export interface FixDelegationResult {
  status: FixExecutionStatus;
  message: string;
}

export interface FixExecutionResult {
  category: FixCategory;
  status: FixExecutionStatus;
  message: string;
  delegated?: FixDelegationRequest;
}

export interface FixOrchestrationSummary {
  applied: FixCategory[];
  skipped: FixCategory[];
  failed: FixCategory[];
}

export interface FixOrchestrationResult {
  selected: FixCategory[];
  results: FixExecutionResult[];
  summary: FixOrchestrationSummary;
}

export interface FixOrchestratorContext {
  category: FixCategory;
  reviewContext: ReviewContext;
}

export type FixHandler = (
  context: FixOrchestratorContext,
) => Promise<Omit<FixExecutionResult, "category">>;

export interface FixOrchestratorOptions {
  handlers?: Partial<Record<FixCategory, FixHandler>>;
  delegateFix?: (request: FixDelegationRequest) => Promise<FixDelegationResult>;
  stopOnFailure?: boolean;
}

const DEFAULT_DELEGATION_AGENTS: Record<FixCategory, FixDelegationRequest["agent"]> = {
  lint: "goop-executor-medium",
  tests: "goop-executor-high",
  comments: "goop-executor-medium",
  requirements: "goop-executor-high",
};

const DEFAULT_DELEGATION_REASONS: Record<FixCategory, string> = {
  lint: "Lint and format remediation often spans related modules and requires deterministic cleanup.",
  tests: "Failing test remediation can require implementation-level code changes.",
  comments: "Review comment remediation may involve code and architecture adjustments.",
  requirements: "Requirement remediation may require implementation work against missing must-haves.",
};

const DELEGATED_CATEGORIES = new Set<FixCategory>(["tests", "comments", "requirements"]);

function dedupeSelectedCategories(selectedCategories: FixCategory[]): FixCategory[] {
  const seen = new Set<FixCategory>();
  const deduped: FixCategory[] = [];

  for (const category of selectedCategories) {
    if (!seen.has(category)) {
      seen.add(category);
      deduped.push(category);
    }
  }

  return deduped;
}

function createNotImplementedHandler(category: FixCategory): FixHandler {
  return async () => ({
    status: "skipped",
    message: `Fix handler for '${category}' is not implemented yet.`,
  });
}

function createDelegationHandler(
  category: FixCategory,
  delegateFix?: (request: FixDelegationRequest) => Promise<FixDelegationResult>,
): FixHandler {
  return async () => {
    const request: FixDelegationRequest = {
      category,
      agent: DEFAULT_DELEGATION_AGENTS[category],
      reason: DEFAULT_DELEGATION_REASONS[category],
    };

    if (!delegateFix) {
      return {
        status: "skipped",
        message: `Delegation requested for '${category}' but no delegate function is configured.`,
        delegated: request,
      };
    }

    const delegationResult = await delegateFix(request);
    return {
      status: delegationResult.status,
      message: delegationResult.message,
      delegated: request,
    };
  };
}

function buildDispatcher(options: FixOrchestratorOptions): Record<FixCategory, FixHandler> {
  const handlers = options.handlers ?? {};

  const dispatcher: Record<FixCategory, FixHandler> = {
    lint: handlers.lint ?? createNotImplementedHandler("lint"),
    tests: handlers.tests ?? createDelegationHandler("tests", options.delegateFix),
    comments: handlers.comments ?? createDelegationHandler("comments", options.delegateFix),
    requirements:
      handlers.requirements ?? createDelegationHandler("requirements", options.delegateFix),
  };

  for (const category of FIX_CATEGORIES) {
    if (!dispatcher[category]) {
      dispatcher[category] = createNotImplementedHandler(category);
    }
  }

  return dispatcher;
}

function summarizeResults(results: FixExecutionResult[]): FixOrchestrationSummary {
  const summary: FixOrchestrationSummary = {
    applied: [],
    skipped: [],
    failed: [],
  };

  for (const result of results) {
    if (result.status === "applied") {
      summary.applied.push(result.category);
    } else if (result.status === "skipped") {
      summary.skipped.push(result.category);
    } else {
      summary.failed.push(result.category);
    }
  }

  return summary;
}

/**
 * Execute selected fix categories through a deterministic dispatcher.
 */
export async function orchestrateFixes(
  selectedCategories: FixCategory[],
  reviewContext: ReviewContext,
  options: FixOrchestratorOptions = {},
): Promise<FixOrchestrationResult> {
  const selected = dedupeSelectedCategories(selectedCategories);
  const dispatcher = buildDispatcher(options);
  const results: FixExecutionResult[] = [];

  log("Starting fix orchestration", {
    prNumber: reviewContext.pr.number,
    selected,
  });

  for (const category of selected) {
    const handler = dispatcher[category] ?? createNotImplementedHandler(category);

    try {
      const outcome = await handler({ category, reviewContext });
      const result: FixExecutionResult = {
        category,
        status: outcome.status,
        message: outcome.message,
        delegated: outcome.delegated,
      };

      results.push(result);

      log("Fix category processed", {
        prNumber: reviewContext.pr.number,
        category,
        status: outcome.status,
        delegated: Boolean(outcome.delegated),
      });

      if (options.stopOnFailure && outcome.status === "failed") {
        break;
      }
    } catch (error) {
      logError("Fix category processing failed", error);

      const failureResult: FixExecutionResult = {
        category,
        status: "failed",
        message: error instanceof Error ? error.message : "Unknown fix execution error.",
      };
      results.push(failureResult);

      if (options.stopOnFailure) {
        break;
      }
    }
  }

  const summary = summarizeResults(results);

  for (const category of selected) {
    if (!results.some((result) => result.category === category)) {
      summary.skipped.push(category);
    }
  }

  for (const result of results) {
    if (!DELEGATED_CATEGORIES.has(result.category)) {
      continue;
    }
    if (!result.delegated && !options.handlers?.[result.category]) {
      result.message = `${result.message} Delegation path expected for this category.`;
    }
  }

  return {
    selected,
    results,
    summary,
  };
}
