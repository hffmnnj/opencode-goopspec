/**
 * Command Processor Hook
 * Intercepts slash command tool output to trigger phase transitions
 * 
 * @module hooks/command-processor
 */

import { join } from "path";
import type { PluginContext, WorkflowPhase, ADLEntry } from "../core/types.js";
import { scaffoldPhaseDocuments } from "../features/enforcement/scaffolder.js";
import { log, logError } from "../shared/logger.js";

type ToolExecuteAfterInput = {
  tool: string;
  sessionID: string;
  callID: string;
};

type ToolExecuteAfterOutput = {
  title: string;
  output: string;
  metadata: unknown;
};

const COMMAND_PHASES: Record<string, WorkflowPhase> = {
  "goop-plan": "plan",
  "goop-research": "research",
  "goop-specify": "specify",
  "goop-execute": "execute",
  "goop-accept": "accept",
};

/**
 * Create command processor hook
 */
export function createCommandProcessor(ctx: PluginContext) {
  return {
    "tool.execute.after": async (
      input: ToolExecuteAfterInput,
      output: ToolExecuteAfterOutput
    ): Promise<void> => {
      if (input.tool !== "slashcommand") {
        return;
      }

      const commandText = getCommandText(output);
      const parsed = commandText ? parseCommandText(commandText) : null;
      if (!parsed) {
        return;
      }

      const phase = COMMAND_PHASES[parsed.name];
      if (!phase) {
        return;
      }

      const transitioned = ctx.stateManager.transitionPhase(phase);
      let scaffoldResult: Awaited<ReturnType<typeof scaffoldPhaseDocuments>> | null = null;
      let phaseName = "";

      if (parsed.name === "goop-plan") {
        phaseName = parsed.args || "plan";
        scaffoldResult = await scaffoldPhaseDocuments(ctx, phaseName, "plan");
      }

      if (!transitioned) {
        logError(`Command processor failed to transition to ${phase}`);
      }

      if (scaffoldResult && !scaffoldResult.success) {
        logError("Command processor failed to scaffold phase documents", scaffoldResult.errors);
      }

      const files = scaffoldResult
        ? scaffoldResult.documentsCreated.map((doc) => join(scaffoldResult!.phaseDir, doc))
        : undefined;

      const actionParts = [`Transitioned to ${phase}`];
      if (scaffoldResult) {
        const scaffoldStatus = scaffoldResult.success ? "scaffolded" : "failed to scaffold";
        const docCount = scaffoldResult.documentsCreated.length;
        const namePart = phaseName ? ` for phase "${phaseName}"` : "";
        actionParts.push(`${scaffoldStatus} ${docCount} documents${namePart}`);
        if (!scaffoldResult.success && scaffoldResult.errors.length > 0) {
          actionParts.push(`errors: ${scaffoldResult.errors.join("; ")}`);
        }
      }

      const adlEntry: ADLEntry = {
        timestamp: new Date().toISOString(),
        type: "observation",
        description: `Slash command "/${parsed.name}" processed`,
        action: transitioned ? actionParts.join("; ") : `Transition to ${phase} rejected`,
        files,
      };

      ctx.stateManager.appendADL(adlEntry);
      log("Command processor handled slash command", {
        command: parsed.name,
        phase,
        transitioned,
        phaseName: phaseName || undefined,
      });
    },
  };
}

function getCommandText(output: ToolExecuteAfterOutput): string | null {
  const metadataCommand = extractCommandFromMetadata(output.metadata);
  if (metadataCommand) {
    return metadataCommand;
  }

  return extractCommandFromOutput(output.output);
}

function extractCommandFromMetadata(metadata: unknown): string | null {
  if (!metadata || typeof metadata !== "object") {
    return null;
  }

  const record = metadata as Record<string, unknown>;
  if (typeof record.command === "string") {
    return record.command;
  }

  const args = record.args;
  if (args && typeof args === "object") {
    const argsRecord = args as Record<string, unknown>;
    if (typeof argsRecord.command === "string") {
      return argsRecord.command;
    }
  }

  return null;
}

function extractCommandFromOutput(output: string): string | null {
  if (!output) {
    return null;
  }

  const match = output.match(/^#\s*\/([^\s]+)\s+Command/m);
  if (!match) {
    return null;
  }

  return match[1];
}

function parseCommandText(raw: string): { name: string; args: string } | null {
  const trimmed = raw.trim();
  if (!trimmed) {
    return null;
  }

  const normalized = trimmed.replace(/^\//, "");
  const [name, ...rest] = normalized.split(/\s+/);
  if (!name) {
    return null;
  }

  return {
    name: name.toLowerCase(),
    args: rest.join(" ").trim(),
  };
}
