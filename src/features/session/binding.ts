import type { PluginContext, StateManager } from "../../core/types.js";
import { ensureSessionDir } from "../../shared/paths.js";
import { logError } from "../../shared/logger.js";
import { createStateManager } from "../state-manager/manager.js";
import { validateSessionId } from "./types.js";

function getProjectName(ctx: PluginContext): string {
  return ctx.config.projectName || ctx.input.project.name;
}

function createBoundStateManager(ctx: PluginContext, sessionId?: string): StateManager {
  return createStateManager(
    ctx.input.directory,
    getProjectName(ctx),
    ctx.config,
    sessionId,
  );
}

export function setSession(ctx: PluginContext, sessionId: string): void {
  if (!validateSessionId(sessionId)) {
    throw new Error(`Invalid session ID: ${sessionId}`);
  }

  ctx.stateManager = createBoundStateManager(ctx, sessionId);
  ctx.sessionId = sessionId;

  void ensureSessionDir(ctx.input.directory, sessionId).catch((error) => {
    logError(`Failed to ensure session directory for ${sessionId}`, error);
  });
}

export function clearSession(ctx: PluginContext): void {
  ctx.stateManager = createBoundStateManager(ctx);
  ctx.sessionId = undefined;
}
