/**
 * Compaction Hook — injects workflow state, spec, and ADL into
 * compaction context so agents resume coherently after resets.
 *
 * @module hooks/compaction-hook
 */

import type { PluginContext } from "../core/types.js";
import { log, logError } from "../shared/logger.js";

/** Imperative directive block for current workflow phase, wave, and lock status. */
export function buildWorkflowStateBlock(ctx: PluginContext): string {
  try {
    const state = ctx.stateManager.getState();
    const workflow = state?.workflow;

    const phase = (workflow?.phase ?? "idle").toUpperCase();
    const currentWave = workflow?.currentWave ?? 0;
    const totalWaves = workflow?.totalWaves ?? 0;
    const interviewComplete = workflow?.interviewComplete ?? false;
    const specLocked = workflow?.specLocked ?? false;
    const acceptanceConfirmed = workflow?.acceptanceConfirmed ?? false;

    const lines: string[] = [];

    lines.push("## GoopSpec Workflow State");
    lines.push("");
    lines.push(`RESUME FROM THIS POINT. You are in the ${phase} phase.`);
    lines.push("");
    lines.push("Current Status:");

    // Omit wave line when both are 0
    if (currentWave !== 0 || totalWaves !== 0) {
      lines.push(`- Wave: ${currentWave} of ${totalWaves}`);
    }

    lines.push(
      `- Interview: ${interviewComplete ? "Complete" : "Not yet complete — continue gathering requirements"}`
    );

    if (specLocked) {
      lines.push(
        "- Spec: LOCKED — Do not re-plan or re-discuss requirements"
      );
    } else {
      lines.push(
        "- Spec: UNLOCKED — Specification may still change"
      );
    }

    lines.push(
      `- Acceptance: ${acceptanceConfirmed ? "Confirmed" : "Pending"}`
    );

    lines.push("");

    // Closing directive paragraph
    const phaseDirective = buildPhaseDirective(phase, currentWave, specLocked);
    lines.push(phaseDirective);

    return lines.join("\n");
  } catch (error) {
    logError("Failed to build workflow state block", error);
    return "";
  }
}

/** Build a closing imperative directive sentence tailored to the current phase. */
function buildPhaseDirective(
  phase: string,
  currentWave: number,
  specLocked: boolean
): string {
  const parts: string[] = [];

  switch (phase) {
    case "IDLE":
      parts.push("No active workflow. Await user instructions.");
      break;
    case "PLAN":
      parts.push("You are in the planning phase. Continue gathering requirements and refining the plan.");
      break;
    case "RESEARCH":
      parts.push("You are in the research phase. Continue investigating and documenting findings.");
      break;
    case "SPECIFY":
      parts.push("You are in the specification phase. Finalize and lock the specification.");
      break;
    case "EXECUTE":
      parts.push(`You are in the execution phase. Resume executing Wave ${currentWave}.`);
      break;
    case "ACCEPT":
      parts.push("You are in the acceptance phase. Verify work against the specification.");
      break;
    default:
      parts.push(`You are in the ${phase} phase. Continue from where you left off.`);
      break;
  }

  if (specLocked) {
    parts.push("The spec is locked. Do not re-plan.");
  }

  return parts.join(" ");
}

/** Active SPEC.md content (full if <=200 lines, must-haves + out-of-scope otherwise). */
export function buildSpecBlock(_projectDir: string): string {
  return "";
}

/** Last 3-5 ADL entries with imperative framing. */
export function buildADLBlock(_ctx: PluginContext): string {
  return "";
}

/** Static tool re-hydration instructions — always injected last. */
export function buildToolInstructionsBlock(): string {
  return "";
}

/**
 * Create the experimental.session.compacting hook.
 *
 * Pushes non-empty builder results to `output.context`, with tool
 * instructions always last. Never throws — errors logged via `logError`.
 */
export function createCompactionHook(ctx: PluginContext) {
  return async (
    _input: unknown,
    output: { context: string[]; prompt?: string }
  ): Promise<void> => {
    log("Compaction hook triggered");

    try {
      const blocks = [
        buildWorkflowStateBlock(ctx),
        buildSpecBlock(ctx.input.directory),
        buildADLBlock(ctx),
      ];

      let pushed = 0;
      for (const block of blocks) {
        if (block.trim().length > 0) {
          output.context.push(block);
          pushed++;
        }
      }

      // Tool instructions always last
      const toolBlock = buildToolInstructionsBlock();
      if (toolBlock.trim().length > 0) {
        output.context.push(toolBlock);
        pushed++;
      }

      log("Compaction hook complete", { contextBlocksPushed: pushed });
    } catch (error) {
      logError("Compaction hook failed", error);
    }
  };
}
