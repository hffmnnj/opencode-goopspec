import type { SessionIndex, SessionInfo } from "../../core/types.js";

export type { SessionInfo, SessionIndex };

export const SESSION_ID_PATTERN = /^[a-z0-9][a-z0-9-]*[a-z0-9]$/;

export const SHARED_RESOURCES = ["memory.db", "config.json", "archive/"] as const;

export const SESSION_SCOPED_FILES = [
  "state.json",
  "SPEC.md",
  "BLUEPRINT.md",
  "CHRONICLE.md",
  "RESEARCH.md",
  "REQUIREMENTS.md",
  "HANDOFF.md",
  "checkpoints/",
  "history/",
] as const;

export function validateSessionId(sessionId: string): boolean {
  return sessionId.length <= 50 && SESSION_ID_PATTERN.test(sessionId);
}
