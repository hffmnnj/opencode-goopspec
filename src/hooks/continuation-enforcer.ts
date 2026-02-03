/**
 * Continuation Enforcer Hook
 * Prevents agents from ending conversations with incomplete todos
 * 
 * @module hooks/continuation-enforcer
 */

import type { PluginContext } from "../core/types.js";
import { log } from "../shared/logger.js";

export interface ContinuationConfig {
  enabled: boolean;
  maxPrompts: number;  // Max times to prompt before allowing stop
  todoCheckEnabled: boolean;
}

const DEFAULT_CONFIG: ContinuationConfig = {
  enabled: true,
  maxPrompts: 3,
  todoCheckEnabled: true,
};

// Track continuation prompts per session
const sessionPromptCounts = new Map<string, number>();

// Track incomplete todo counts per session
// This will be populated by tool hooks when todoread/todowrite are called
const sessionTodoCounts = new Map<string, number>();

/**
 * Check if there are incomplete todos
 * This integrates with the todoread/todowrite tool tracking
 */
function hasIncompleteTodos(sessionId: string): boolean {
  const incompleteCount = sessionTodoCounts.get(sessionId) ?? 0;
  return incompleteCount > 0;
}

/**
 * Get incomplete todo count for a session
 */
function getIncompleteTodoCount(sessionId: string): number {
  return sessionTodoCounts.get(sessionId) ?? 0;
}

/**
 * Update incomplete todo count for a session
 * Called by tool hooks when todos are read/written
 */
export function updateTodoCount(sessionId: string, incompleteCount: number): void {
  sessionTodoCounts.set(sessionId, incompleteCount);
  log("Updated todo count", { sessionId, incompleteCount });
}

/**
 * Generate a continuation prompt
 */
function generateContinuationPrompt(incompleteCount: number): string {
  return `
⚠️ **CONTINUATION REQUIRED**

You have ${incompleteCount} incomplete todo(s). You cannot stop until all todos are complete.

Please continue working on the remaining tasks. If you're blocked:
1. Use \`todoread\` to see pending items
2. Address each incomplete task
3. Mark tasks complete as you finish them

Only checkpoints (\`/goop-pause\`) allow pausing with incomplete work.
`;
}

/**
 * Create the continuation enforcer hook
 */
export function createContinuationEnforcerHook(config: Partial<ContinuationConfig> = {}) {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  
  return {
    name: "continuation-enforcer",
    
    /**
     * PostToolUse hook - check after each tool use
     */
    async postToolUse(params: {
      toolName: string;
      result: unknown;
      sessionId: string;
      context: PluginContext;
    }): Promise<{ inject?: string } | void> {
      if (!cfg.enabled || !cfg.todoCheckEnabled) {
        return;
      }
      
      // Check if this looks like an ending action
      const endingTools = ["task_complete", "conversation_end"];
      const isEndingAction = endingTools.includes(params.toolName);
      
      if (!isEndingAction) {
        return;
      }
      
      // Check for incomplete todos
      const hasIncomplete = hasIncompleteTodos(params.sessionId);
      
      if (!hasIncomplete) {
        // All todos complete, allow ending
        sessionPromptCounts.delete(params.sessionId);
        return;
      }
      
      // Track prompt count
      const currentCount = sessionPromptCounts.get(params.sessionId) || 0;
      
      if (currentCount >= cfg.maxPrompts) {
        // Max prompts reached, allow stopping but warn
        log("Max continuation prompts reached, allowing stop", { 
          sessionId: params.sessionId,
          promptCount: currentCount 
        });
        sessionPromptCounts.delete(params.sessionId);
        return {
          inject: "⚠️ Stopping with incomplete todos (max continuation prompts reached)."
        };
      }
      
      // Increment prompt count
      sessionPromptCounts.set(params.sessionId, currentCount + 1);
      
      log("Injecting continuation prompt", {
        sessionId: params.sessionId,
        promptCount: currentCount + 1,
        maxPrompts: cfg.maxPrompts
      });
      
      // Inject continuation prompt
      const incompleteCount = getIncompleteTodoCount(params.sessionId);
      return {
        inject: generateContinuationPrompt(incompleteCount)
      };
    },
    
    /**
     * Reset prompt count when session starts
     */
    async onSessionStart(params: { sessionId: string }): Promise<void> {
      sessionPromptCounts.delete(params.sessionId);
      sessionTodoCounts.delete(params.sessionId);
    },
    
    /**
     * Cleanup on session end
     */
    async onSessionEnd(params: { sessionId: string }): Promise<void> {
      sessionPromptCounts.delete(params.sessionId);
      sessionTodoCounts.delete(params.sessionId);
    },
  };
}

/**
 * Check if continuation is currently being enforced
 */
export function isContinuationActive(sessionId: string): boolean {
  return sessionPromptCounts.has(sessionId);
}

/**
 * Get current prompt count for a session
 */
export function getPromptCount(sessionId: string): number {
  return sessionPromptCounts.get(sessionId) || 0;
}

/**
 * Manually reset continuation state
 */
export function resetContinuation(sessionId: string): void {
  sessionPromptCounts.delete(sessionId);
  sessionTodoCounts.delete(sessionId);
}
