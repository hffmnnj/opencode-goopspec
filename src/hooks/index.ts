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

/**
 * Create all GoopSpec hooks
 */
export function createHooks(ctx: PluginContext): Partial<Hooks> {
  const hooks: Partial<Hooks> = {
    event: createEventHandler(ctx),
    "chat.message": createChatMessageHook(ctx),
    ...createToolLifecycleHooks(ctx),
  };

  // Add system transform hook for memory injection if enabled
  if (ctx.memoryManager && ctx.config.memory?.injection?.enabled !== false) {
    // @ts-expect-error - experimental hook not in type definitions
    hooks["experimental.chat.system.transform"] = createSystemTransformHook(ctx);
  }

  return hooks;
}

export { createChatMessageHook } from "./chat-message.js";
export { createToolLifecycleHooks } from "./tool-lifecycle.js";
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
