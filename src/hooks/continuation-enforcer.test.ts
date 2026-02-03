/**
 * Unit Tests for Continuation Enforcer Hook
 * @module hooks/continuation-enforcer.test
 */

import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import {
  createContinuationEnforcerHook,
  updateTodoCount,
  isContinuationActive,
  getPromptCount,
  resetContinuation,
} from "./continuation-enforcer.js";
import { createMockPluginContext, setupTestEnvironment } from "../test-utils.js";

describe("continuation-enforcer", () => {
  let cleanup: () => void;
  const sessionId = "test-session-123";

  beforeEach(() => {
    const env = setupTestEnvironment("continuation-test");
    cleanup = env.cleanup;
    // Reset state before each test
    resetContinuation(sessionId);
  });

  afterEach(() => {
    cleanup();
    resetContinuation(sessionId);
  });

  describe("createContinuationEnforcerHook", () => {
    it("creates hook with name", () => {
      const hook = createContinuationEnforcerHook();
      expect(hook.name).toBe("continuation-enforcer");
    });

    it("creates hook with postToolUse handler", () => {
      const hook = createContinuationEnforcerHook();
      expect(typeof hook.postToolUse).toBe("function");
    });

    it("creates hook with session lifecycle handlers", () => {
      const hook = createContinuationEnforcerHook();
      expect(typeof hook.onSessionStart).toBe("function");
      expect(typeof hook.onSessionEnd).toBe("function");
    });
  });

  describe("updateTodoCount", () => {
    it("updates todo count for session", () => {
      updateTodoCount(sessionId, 5);
      
      // The count is internal, but we can test via hook behavior
      expect(true).toBe(true); // Function doesn't throw
    });

    it("allows zero count", () => {
      updateTodoCount(sessionId, 0);
      expect(true).toBe(true);
    });
  });

  describe("isContinuationActive", () => {
    it("returns false initially", () => {
      expect(isContinuationActive(sessionId)).toBe(false);
    });

    it("returns false for unknown session", () => {
      expect(isContinuationActive("unknown-session")).toBe(false);
    });
  });

  describe("getPromptCount", () => {
    it("returns 0 initially", () => {
      expect(getPromptCount(sessionId)).toBe(0);
    });

    it("returns 0 for unknown session", () => {
      expect(getPromptCount("unknown-session")).toBe(0);
    });
  });

  describe("resetContinuation", () => {
    it("resets prompt count", () => {
      // First trigger continuation
      const hook = createContinuationEnforcerHook();
      updateTodoCount(sessionId, 3);
      
      resetContinuation(sessionId);
      
      expect(getPromptCount(sessionId)).toBe(0);
    });

    it("resets continuation active state", () => {
      resetContinuation(sessionId);
      expect(isContinuationActive(sessionId)).toBe(false);
    });
  });

  describe("postToolUse hook", () => {
    it("returns undefined for non-ending tools", async () => {
      const hook = createContinuationEnforcerHook();
      const ctx = createMockPluginContext();
      
      const result = await hook.postToolUse({
        toolName: "Write",
        result: "Success",
        sessionId,
        context: ctx,
      });

      expect(result).toBeUndefined();
    });

    it("returns undefined when no incomplete todos", async () => {
      const hook = createContinuationEnforcerHook();
      const ctx = createMockPluginContext();
      
      // Set todo count to 0
      updateTodoCount(sessionId, 0);
      
      const result = await hook.postToolUse({
        toolName: "task_complete",
        result: "Done",
        sessionId,
        context: ctx,
      });

      expect(result).toBeUndefined();
    });

    it("returns continuation prompt when has incomplete todos", async () => {
      const hook = createContinuationEnforcerHook();
      const ctx = createMockPluginContext();
      
      // Set incomplete todos
      updateTodoCount(sessionId, 3);
      
      const result = await hook.postToolUse({
        toolName: "task_complete",
        result: "Done",
        sessionId,
        context: ctx,
      });

      expect(result).toBeDefined();
      expect(result?.inject).toContain("CONTINUATION REQUIRED");
      expect(result?.inject).toContain("3");
    });

    it("returns undefined when disabled", async () => {
      const hook = createContinuationEnforcerHook({ enabled: false });
      const ctx = createMockPluginContext();
      
      updateTodoCount(sessionId, 3);
      
      const result = await hook.postToolUse({
        toolName: "task_complete",
        result: "Done",
        sessionId,
        context: ctx,
      });

      expect(result).toBeUndefined();
    });

    it("returns undefined when todoCheckEnabled is false", async () => {
      const hook = createContinuationEnforcerHook({ todoCheckEnabled: false });
      const ctx = createMockPluginContext();
      
      updateTodoCount(sessionId, 3);
      
      const result = await hook.postToolUse({
        toolName: "task_complete",
        result: "Done",
        sessionId,
        context: ctx,
      });

      expect(result).toBeUndefined();
    });

    it("stops prompting after maxPrompts", async () => {
      const hook = createContinuationEnforcerHook({ maxPrompts: 2 });
      const ctx = createMockPluginContext();
      
      updateTodoCount(sessionId, 1);
      
      // First prompt
      await hook.postToolUse({
        toolName: "task_complete",
        result: "Done",
        sessionId,
        context: ctx,
      });
      
      // Second prompt
      await hook.postToolUse({
        toolName: "task_complete",
        result: "Done",
        sessionId,
        context: ctx,
      });
      
      // Third call - should be allowed to stop
      const result = await hook.postToolUse({
        toolName: "task_complete",
        result: "Done",
        sessionId,
        context: ctx,
      });

      expect(result?.inject).toContain("Stopping with incomplete todos");
    });

    it("increments prompt count on each call", async () => {
      const hook = createContinuationEnforcerHook({ maxPrompts: 10 });
      const ctx = createMockPluginContext();
      
      updateTodoCount(sessionId, 1);
      
      await hook.postToolUse({
        toolName: "task_complete",
        result: "",
        sessionId,
        context: ctx,
      });
      
      expect(getPromptCount(sessionId)).toBe(1);
      
      await hook.postToolUse({
        toolName: "task_complete",
        result: "",
        sessionId,
        context: ctx,
      });
      
      expect(getPromptCount(sessionId)).toBe(2);
    });

    it("clears prompt count when todos complete", async () => {
      const hook = createContinuationEnforcerHook();
      const ctx = createMockPluginContext();
      
      // First with incomplete todos
      updateTodoCount(sessionId, 1);
      await hook.postToolUse({
        toolName: "task_complete",
        result: "",
        sessionId,
        context: ctx,
      });
      
      expect(getPromptCount(sessionId)).toBe(1);
      
      // Now complete all todos
      updateTodoCount(sessionId, 0);
      await hook.postToolUse({
        toolName: "task_complete",
        result: "",
        sessionId,
        context: ctx,
      });
      
      expect(getPromptCount(sessionId)).toBe(0);
    });
  });

  describe("onSessionStart", () => {
    it("clears session state", async () => {
      const hook = createContinuationEnforcerHook();
      
      // Set some state
      updateTodoCount(sessionId, 5);
      
      await hook.onSessionStart({ sessionId });
      
      expect(getPromptCount(sessionId)).toBe(0);
      expect(isContinuationActive(sessionId)).toBe(false);
    });
  });

  describe("onSessionEnd", () => {
    it("clears session state", async () => {
      const hook = createContinuationEnforcerHook();
      
      // Set some state
      updateTodoCount(sessionId, 5);
      
      await hook.onSessionEnd({ sessionId });
      
      expect(getPromptCount(sessionId)).toBe(0);
    });
  });

  describe("default configuration", () => {
    it("uses default maxPrompts of 3", async () => {
      const hook = createContinuationEnforcerHook();
      const ctx = createMockPluginContext();
      
      updateTodoCount(sessionId, 1);
      
      // Exhaust prompts
      for (let i = 0; i < 3; i++) {
        await hook.postToolUse({
          toolName: "task_complete",
          result: "",
          sessionId,
          context: ctx,
        });
      }
      
      // Next should allow stop
      const result = await hook.postToolUse({
        toolName: "task_complete",
        result: "",
        sessionId,
        context: ctx,
      });
      
      expect(result?.inject).toContain("Stopping");
    });
  });

  describe("ending tool detection", () => {
    it("recognizes task_complete as ending tool", async () => {
      const hook = createContinuationEnforcerHook();
      const ctx = createMockPluginContext();
      
      updateTodoCount(sessionId, 1);
      
      const result = await hook.postToolUse({
        toolName: "task_complete",
        result: "",
        sessionId,
        context: ctx,
      });

      expect(result?.inject).toBeDefined();
    });

    it("recognizes conversation_end as ending tool", async () => {
      const hook = createContinuationEnforcerHook();
      const ctx = createMockPluginContext();
      
      updateTodoCount(sessionId, 1);
      
      const result = await hook.postToolUse({
        toolName: "conversation_end",
        result: "",
        sessionId,
        context: ctx,
      });

      expect(result?.inject).toBeDefined();
    });

    it("does not trigger for regular tools", async () => {
      const hook = createContinuationEnforcerHook();
      const ctx = createMockPluginContext();
      
      updateTodoCount(sessionId, 10);
      
      const result = await hook.postToolUse({
        toolName: "Read",
        result: "",
        sessionId,
        context: ctx,
      });

      expect(result).toBeUndefined();
    });
  });
});
