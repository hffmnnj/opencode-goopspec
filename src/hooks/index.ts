/**
 * Hooks barrel export and factory
 * @module hooks
 */

import type { Hooks } from "@opencode-ai/plugin";
import type { PluginContext } from "../core/types.js";
import { createChatMessageHook } from "./chat-message.js";
import { createToolLifecycleHooks } from "./tool-lifecycle.js";
import { createEventHandler } from "./event-handler.js";
import { createSystemTransformHook } from "./system-transform.js";
import { createCommandProcessor } from "./command-processor.js";

/**
 * Create all GoopSpec hooks
 */
export function createHooks(ctx: PluginContext): Partial<Hooks> {
  const toolLifecycleHooks = createToolLifecycleHooks(ctx);
  const commandProcessorHooks = createCommandProcessor(ctx);
  const toolExecuteAfterHooks = [
    toolLifecycleHooks["tool.execute.after"],
    commandProcessorHooks["tool.execute.after"],
  ].filter(
    (hook): hook is NonNullable<Hooks["tool.execute.after"]> => Boolean(hook)
  );

  const hooks: Partial<Hooks> = {
    event: createEventHandler(ctx),
    "chat.message": createChatMessageHook(ctx),
    ...toolLifecycleHooks,
    ...commandProcessorHooks,
  };

  if (toolExecuteAfterHooks.length > 0) {
    hooks["tool.execute.after"] = async (input, output) => {
      for (const hook of toolExecuteAfterHooks) {
        await hook(input, output);
      }
    };
  }

  // Add system transform hook for memory injection if enabled
  if (ctx.memoryManager && ctx.config.memory?.injection?.enabled !== false) {
    // @ts-expect-error - experimental hook not in type definitions
    hooks["experimental.chat.system.transform"] = createSystemTransformHook(ctx);
  }

  return hooks;
}

export { createChatMessageHook } from "./chat-message.js";
export { createToolLifecycleHooks } from "./tool-lifecycle.js";
export { createCommandProcessor } from "./command-processor.js";
export { createEventHandler } from "./event-handler.js";
export { createSystemTransformHook } from "./system-transform.js";
export { 
  createContinuationEnforcerHook,
  isContinuationActive,
  getPromptCount,
  resetContinuation,
  updateTodoCount
} from "./continuation-enforcer.js";
export type { ContinuationConfig } from "./continuation-enforcer.js";
export { 
  createCommentCheckerHook,
  analyzeComments,
  formatAnalysis
} from "./comment-checker.js";
export type { CommentCheckerConfig, CommentAnalysis } from "./comment-checker.js";
