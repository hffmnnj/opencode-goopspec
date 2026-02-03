/**
 * Tests for Logger Utility
 * @module shared/logger.test
 */

import { describe, it, expect, beforeEach, afterEach, mock, spyOn } from "bun:test";
import { log, logError, setDebug } from "./logger.js";

describe("logger", () => {
  let consoleSpy: ReturnType<typeof spyOn>;
  let consoleErrorSpy: ReturnType<typeof spyOn>;

  beforeEach(() => {
    // Spy on console methods
    consoleSpy = spyOn(console, "log").mockImplementation(() => {});
    consoleErrorSpy = spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    // Restore console methods and disable debug
    consoleSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    setDebug(false);
  });

  describe("setDebug", () => {
    it("enables debug logging when set to true", () => {
      setDebug(true);
      
      log("test message");
      
      expect(consoleSpy).toHaveBeenCalled();
    });

    it("disables debug logging when set to false", () => {
      setDebug(false);
      
      log("test message");
      
      expect(consoleSpy).not.toHaveBeenCalled();
    });

    it("can toggle debug mode multiple times", () => {
      setDebug(true);
      log("message 1");
      expect(consoleSpy).toHaveBeenCalledTimes(1);

      setDebug(false);
      log("message 2");
      expect(consoleSpy).toHaveBeenCalledTimes(1); // Still 1

      setDebug(true);
      log("message 3");
      expect(consoleSpy).toHaveBeenCalledTimes(2);
    });
  });

  describe("log", () => {
    beforeEach(() => {
      setDebug(true);
    });

    it("does nothing when debug is disabled", () => {
      setDebug(false);
      
      log("test message");
      
      expect(consoleSpy).not.toHaveBeenCalled();
    });

    it("logs message with GoopSpec prefix when debug enabled", () => {
      log("test message");

      expect(consoleSpy).toHaveBeenCalled();
      const logCall = consoleSpy.mock.calls[0][0];
      expect(logCall).toContain("[GoopSpec");
      expect(logCall).toContain("test message");
    });

    it("includes timestamp in log output", () => {
      log("test message");

      const logCall = consoleSpy.mock.calls[0][0];
      // ISO timestamp format check (contains T and Z or timezone offset)
      expect(logCall).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    it("logs message without data", () => {
      log("simple message");

      expect(consoleSpy).toHaveBeenCalledTimes(1);
      // Should only have one argument (the message string)
      expect(consoleSpy.mock.calls[0]).toHaveLength(1);
    });

    it("logs message with data object", () => {
      const data = { key: "value", count: 42 };
      
      log("message with data", data);

      expect(consoleSpy).toHaveBeenCalledTimes(1);
      expect(consoleSpy.mock.calls[0]).toHaveLength(2);
      expect(consoleSpy.mock.calls[0][1]).toEqual(data);
    });

    it("logs message with nested data object", () => {
      const data = {
        nested: {
          deep: {
            value: "test",
          },
        },
        array: [1, 2, 3],
      };

      log("nested data", data);

      expect(consoleSpy.mock.calls[0][1]).toEqual(data);
    });

    it("logs message with empty data object", () => {
      log("empty data", {});

      expect(consoleSpy.mock.calls[0]).toHaveLength(2);
      expect(consoleSpy.mock.calls[0][1]).toEqual({});
    });
  });

  describe("logError", () => {
    it("always logs errors regardless of debug mode", () => {
      setDebug(false);
      
      logError("error message");
      
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it("logs error with GoopSpec ERROR prefix", () => {
      logError("test error");

      const logCall = consoleErrorSpy.mock.calls[0][0];
      expect(logCall).toContain("[GoopSpec ERROR");
      expect(logCall).toContain("test error");
    });

    it("includes timestamp in error output", () => {
      logError("test error");

      const logCall = consoleErrorSpy.mock.calls[0][0];
      expect(logCall).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    it("logs error message without error object", () => {
      logError("simple error");

      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    });

    it("logs error message with Error object", () => {
      const error = new Error("test error object");
      
      logError("error occurred", error);

      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
      expect(consoleErrorSpy.mock.calls[0]).toHaveLength(2);
      expect(consoleErrorSpy.mock.calls[0][1]).toBe(error);
    });

    it("logs error message with string error", () => {
      logError("error occurred", "string error");

      expect(consoleErrorSpy.mock.calls[0][1]).toBe("string error");
    });

    it("logs error message with unknown error type", () => {
      const weirdError = { custom: "error", code: 500 };
      
      logError("unknown error", weirdError);

      expect(consoleErrorSpy.mock.calls[0][1]).toEqual(weirdError);
    });

    it("logs error message with undefined error", () => {
      logError("error with undefined", undefined);

      expect(consoleErrorSpy.mock.calls[0][1]).toBeUndefined();
    });

    it("logs error message with null error", () => {
      logError("error with null", null);

      expect(consoleErrorSpy.mock.calls[0][1]).toBeNull();
    });
  });

  describe("concurrent logging", () => {
    it("handles multiple rapid log calls", () => {
      setDebug(true);

      for (let i = 0; i < 100; i++) {
        log(`message ${i}`);
      }

      expect(consoleSpy).toHaveBeenCalledTimes(100);
    });

    it("handles interleaved log and logError calls", () => {
      setDebug(true);

      log("log 1");
      logError("error 1");
      log("log 2");
      logError("error 2");

      expect(consoleSpy).toHaveBeenCalledTimes(2);
      expect(consoleErrorSpy).toHaveBeenCalledTimes(2);
    });
  });
});
