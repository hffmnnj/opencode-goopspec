/**
 * GoopSpec Setup Module
 * Core setup logic: detect environment, plan changes, apply configuration
 * 
 * @module features/setup
 */

import { existsSync } from "fs";
import { getGlobalConfigPath, getProjectGoopspecDir, joinPath } from "../../shared/paths.js";
import { hasOpenCodeConfig, getOpenCodeConfigPath, readOpenCodeConfig, getExistingMcps } from "../../core/opencode-config.js";
import { DEFAULT_CONFIG } from "../../core/config.js";
import { installMcps } from "./mcp-installer.js";
import { log } from "../../shared/logger.js";
import type { 
  SetupEnvironment, 
  SetupInput, 
  SetupPlan, 
  SetupAction, 
  SetupResult,
  ConfigWrite,
} from "./types.js";
import { MCP_PRESETS } from "./types.js";
import { writeFileSync, mkdirSync } from "fs";

/**
 * Detect current setup environment
 * Checks for existing configs and MCPs
 */
export async function detectEnvironment(projectDir: string): Promise<SetupEnvironment> {
  const globalConfigPath = getGlobalConfigPath();
  const projectGoopspecDir = getProjectGoopspecDir(projectDir);
  const projectConfigPath = joinPath(projectGoopspecDir, "config.json");
  const opencodeConfigPath = getOpenCodeConfigPath();
  
  const hasGlobal = existsSync(globalConfigPath);
  const hasProject = existsSync(projectConfigPath);
  const hasOpenCode = hasOpenCodeConfig();
  
  let existingMcps: string[] = [];
  if (hasOpenCode) {
    try {
      const config = readOpenCodeConfig();
      existingMcps = getExistingMcps(config);
    } catch {
      // Ignore errors reading config
    }
  }
  
  log("Detected environment", {
    hasGlobal,
    hasProject,
    hasOpenCode,
    existingMcps,
  });
  
  return {
    hasOpenCodeConfig: hasOpenCode,
    hasGlobalGoopSpecConfig: hasGlobal,
    hasProjectGoopSpecConfig: hasProject,
    existingMcps,
    opencodeConfigPath,
    globalConfigPath,
    projectConfigPath,
  };
}

/**
 * Plan setup actions based on user input
 * Returns a plan describing what will be changed
 */
export async function planSetup(input: SetupInput, env: SetupEnvironment): Promise<SetupPlan> {
  const actions: SetupAction[] = [];
  const configsToWrite: ConfigWrite[] = [];
  
  // Determine which MCPs to install
  const mcpsToInstall: string[] = [];
  if (input.mcpPreset !== "none") {
    const presetMcps = MCP_PRESETS[input.mcpPreset];
    for (const mcp of presetMcps) {
      if (!env.existingMcps.includes(mcp)) {
        mcpsToInstall.push(mcp);
      }
    }
  }
  
  // Plan global config write
  if (input.scope === "global" || input.scope === "both") {
    const globalConfig: Record<string, unknown> = {
      ...DEFAULT_CONFIG,
      defaultModel: input.models.default ?? DEFAULT_CONFIG.defaultModel,
      orchestrator: {
        model: input.models.orchestrator ?? "anthropic/claude-opus-4-5",
        thinkingBudget: 32000,
      },
      mcp: {
        ...DEFAULT_CONFIG.mcp,
      },
    };
    
    // Add MCP preset to config
    if (input.mcpPreset !== "none") {
      const presetMcps = MCP_PRESETS[input.mcpPreset];
      for (const mcp of presetMcps) {
        (globalConfig.mcp as Record<string, boolean>)[mcp] = true;
      }
    }
    
    // Add agent model overrides to global config
    if (input.agentModels && Object.keys(input.agentModels).length > 0) {
      globalConfig.agents = {};
      for (const [agentName, model] of Object.entries(input.agentModels)) {
        (globalConfig.agents as Record<string, { model: string }>)[agentName] = { model };
      }
    }
    
    actions.push({
      type: "write_config",
      target: env.globalConfigPath,
      changes: globalConfig,
      description: "Write global GoopSpec configuration",
    });
    
    configsToWrite.push({
      path: env.globalConfigPath,
      scope: "global",
      content: globalConfig,
    });
  }
  
  // Plan project config write
  if (input.scope === "project" || input.scope === "both") {
    const projectConfig: Record<string, unknown> = {
      orchestrator: {
        enableAsDefault: input.enableOrchestrator ?? false,
        phaseGates: "ask",
        waveExecution: "sequential",
      },
    };
    
    // Add agent model overrides to project config
    if (input.agentModels && Object.keys(input.agentModels).length > 0) {
      projectConfig.agents = {};
      for (const [agentName, model] of Object.entries(input.agentModels)) {
        (projectConfig.agents as Record<string, { model: string }>)[agentName] = { model };
      }
    }
    
    actions.push({
      type: "write_config",
      target: env.projectConfigPath,
      changes: projectConfig,
      description: "Write project GoopSpec configuration",
    });
    
    configsToWrite.push({
      path: env.projectConfigPath,
      scope: "project",
      content: projectConfig,
    });
  }
  
  // Plan MCP installation
  if (mcpsToInstall.length > 0) {
    actions.push({
      type: "install_mcp",
      target: "OpenCode MCPs",
      changes: { mcps: mcpsToInstall },
      description: `Install ${mcpsToInstall.length} MCP(s): ${mcpsToInstall.join(", ")}`,
    });
  }
  
  // Build summary
  const summary = [
    `GoopSpec will be configured for: ${input.scope}`,
    input.models.orchestrator && `Orchestrator model: ${input.models.orchestrator}`,
    input.mcpPreset !== "none" && `MCP preset: ${input.mcpPreset}`,
    input.enableOrchestrator && "GoopSpec will be set as default agent",
  ]
    .filter(Boolean)
    .join("\n");
  
  return {
    actions,
    summary,
    mcpsToInstall,
    configsToWrite,
  };
}

/**
 * Apply setup plan
 * Executes all planned actions
 */
export async function applySetup(plan: SetupPlan): Promise<SetupResult> {
  const result: SetupResult = {
    success: true,
    configsWritten: [],
    mcpsInstalled: [],
    errors: [],
    warnings: [],
  };
  
  try {
    // Write all config files
    for (const configWrite of plan.configsToWrite) {
      try {
        const dir = configWrite.path.substring(0, configWrite.path.lastIndexOf("/"));
        if (!existsSync(dir)) {
          mkdirSync(dir, { recursive: true });
        }
        
        writeFileSync(configWrite.path, JSON.stringify(configWrite.content, null, 2));
        result.configsWritten.push(configWrite.path);
        log(`Wrote config: ${configWrite.path}`);
      } catch (error) {
        const errorMsg = `Failed to write ${configWrite.scope} config: ${error instanceof Error ? error.message : String(error)}`;
        result.errors.push(errorMsg);
        result.success = false;
      }
    }
    
    // Install MCPs
    if (plan.mcpsToInstall.length > 0) {
      try {
        const installed = await installMcps(plan.mcpsToInstall);
        result.mcpsInstalled = installed;
        log(`Installed ${installed.length} MCPs`);
      } catch (error) {
        const errorMsg = `MCP installation failed: ${error instanceof Error ? error.message : String(error)}`;
        result.errors.push(errorMsg);
        result.warnings.push("You may need to install MCPs manually");
        // Don't mark as failed - configs are still written
      }
    }
  } catch (error) {
    result.success = false;
    result.errors.push(error instanceof Error ? error.message : String(error));
  }
  
  return result;
}
