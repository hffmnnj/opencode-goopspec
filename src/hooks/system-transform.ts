/**
 * System Transform Hook
 * Injects memory context into agent system prompts
 * 
 * @module hooks/system-transform
 */

import type { PluginContext } from "../core/types.js";
import { log, logError } from "../shared/logger.js";
import { createMemoryContextBuilder } from "../features/memory/context-builder.js";

type SystemTransformInput = {
  sessionID: string;
  agent?: string;
  model?: {
    providerID: string;
    modelID: string;
  };
};

type SystemTransformOutput = {
  system: string;
};

/**
 * Create the experimental.chat.system.transform hook
 * 
 * This hook injects relevant memory context into the system prompt
 * before each chat completion request.
 */
export function createSystemTransformHook(ctx: PluginContext) {
  return async (
    input: SystemTransformInput,
    output: SystemTransformOutput
  ): Promise<SystemTransformOutput> => {
    // Skip if memory is disabled or not available
    if (!ctx.memoryManager || ctx.config.memory?.injection?.enabled === false) {
      return output;
    }

    log("System transform hook triggered", {
      agent: input.agent,
      sessionID: input.sessionID,
    });

    try {
      // Create context builder with config
      const builder = createMemoryContextBuilder(ctx.memoryManager, {
        budgetTokens: ctx.config.memory?.injection?.budgetTokens ?? 800,
        format: (ctx.config.memory?.injection?.format ?? "structured") as "timeline" | "bullets" | "structured",
        priorityTypes: ctx.config.memory?.injection?.priorityTypes ?? ["decision", "observation", "todo"],
        includeDecisions: true,
        includeRecentActivity: true,
      });

      // Get the current phase for context
      const currentPhase = ctx.stateManager.getState().workflow.phase;

      // Build memory context
      let memoryContext: string;
      if (currentPhase) {
        // Phase-aware context
        memoryContext = await builder.buildPhaseContext(currentPhase);
      } else {
        // Recent context
        memoryContext = await builder.buildRecentContext(10);
      }

      // If no memory context, return unmodified
      if (!memoryContext || memoryContext.trim().length === 0) {
        log("No memory context to inject");
        return output;
      }

      // Inject memory context at the end of the system prompt
      const enhancedSystem = `${output.system}

## Persistent Memory Context

The following memories are relevant to this session. Use them to maintain continuity and avoid repeating mistakes.

${memoryContext}

Use the memory tools (memory_save, memory_search, memory_note, memory_decision) to store and retrieve information for future sessions.`;

      log("Memory context injected", {
        originalLength: output.system.length,
        contextLength: memoryContext.length,
        enhancedLength: enhancedSystem.length,
      });

      return {
        system: enhancedSystem,
      };
    } catch (error) {
      logError("Failed to inject memory context", error);
      // Return original on error - don't break the system
      return output;
    }
  };
}
