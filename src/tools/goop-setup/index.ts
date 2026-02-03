/**
 * GoopSpec Setup Tool
 * Configuration tool for GoopSpec - works with agent-driven setup flow
 * 
 * @module tools/goop-setup
 */

import { tool, type ToolDefinition } from "@opencode-ai/plugin/tool";
import type { PluginContext, ToolContext } from "../../core/types.js";
import { detectEnvironment, planSetup, applySetup } from "../../features/setup/index.js";
import type { SetupInput } from "../../features/setup/types.js";

// ============================================================================
// Model Suggestions for each agent
// ============================================================================

export const AGENT_MODEL_SUGGESTIONS: Record<string, {
  suggestions: string[];
  description: string;
}> = {
  "goop-debugger": {
    suggestions: [
      "openai/gpt-5.2-codex",
      "anthropic/claude-opus-4-5",
      "opencode/kimi-k2.5-free",
    ],
    description: "Systematic debugging with hypothesis testing",
  },
  "goop-designer": {
    suggestions: [
      "anthropic/claude-opus-4-5",
      "opencode/kimi-k2.5-free",
      "google/antigravity-gemini-3-pro-high",
    ],
    description: "Visual design planning and UI/UX reasoning",
  },
  "goop-executor": {
    suggestions: [
      "openai/gpt-5.2-codex",
      "anthropic/claude-opus-4-5",
      "anthropic/claude-sonnet-4-5",
      "opencode/kimi-k2.5-free",
      "google/antigravity-gemini-3-pro-high",
      "opencode/glm-4.7-free",
    ],
    description: "Task execution with checkpoints and verification",
  },
  "goop-explorer": {
    suggestions: [
      "google/antigravity-gemini-3-flash",
      "anthropic/claude-haiku-4-5",
      "opencode/minimax-m2.1-free",
    ],
    description: "Fast codebase exploration and pattern extraction",
  },
  "goop-librarian": {
    suggestions: [
      "openai/gpt-5.2",
      "google/antigravity-gemini-3-flash",
      "anthropic/claude-sonnet-4-5",
    ],
    description: "Codebase search and documentation retrieval",
  },
  "goop-orchestrator": {
    suggestions: [
      "openai/gpt-5.2-codex",
      "anthropic/claude-opus-4-5",
      "opencode/kimi-k2.5-free",
      "anthropic/claude-sonnet-4-5",
    ],
    description: "Primary orchestrator - spec clarity and wave execution",
  },
  "goop-planner": {
    suggestions: [
      "openai/gpt-5.2-codex",
      "anthropic/claude-opus-4-5",
      "opencode/kimi-k2.5-free",
      "anthropic/claude-sonnet-4-5",
    ],
    description: "Detailed execution plans with architectural precision",
  },
  "goop-researcher": {
    suggestions: [
      "openai/gpt-5.2",
      "anthropic/claude-sonnet-4-5",
      "opencode/kimi-k2.5-free",
      "opencode/glm-4.7-free",
    ],
    description: "Comprehensive ecosystem research",
  },
  "goop-tester": {
    suggestions: [
      "anthropic/claude-sonnet-4-5",
      "opencode/kimi-k2.5-free",
      "google/antigravity-gemini-3-flash",
    ],
    description: "Web frontend testing with Playwright",
  },
  "goop-verifier": {
    suggestions: [
      "openai/gpt-5.2-codex",
      "anthropic/claude-opus-4-5",
    ],
    description: "Post-execution verification with security focus",
  },
  "goop-writer": {
    suggestions: [
      "google/antigravity-gemini-3-pro-high",
      "opencode/kimi-k2.5-free",
      "anthropic/claude-sonnet-4-5",
    ],
    description: "Comprehensive documentation generation",
  },
};

// List of all configurable agents
export const ALL_AGENTS = Object.keys(AGENT_MODEL_SUGGESTIONS);

/**
 * Format environment detection for display
 */
function formatEnvironment(env: {
  hasOpenCodeConfig: boolean;
  hasGlobalGoopSpecConfig: boolean;
  hasProjectGoopSpecConfig: boolean;
  existingMcps: string[];
  opencodeConfigPath: string;
  globalConfigPath: string;
  projectConfigPath: string;
}): string {
  const lines = [
    "# GoopSpec Environment Detection",
    "",
    "## Existing Configuration",
    "",
    `- **OpenCode config**: ${env.hasOpenCodeConfig ? "Found" : "Not found"} (${env.opencodeConfigPath})`,
    `- **Global GoopSpec config**: ${env.hasGlobalGoopSpecConfig ? "Found" : "Not found"} (${env.globalConfigPath})`,
    `- **Project GoopSpec config**: ${env.hasProjectGoopSpecConfig ? "Found" : "Not found"} (${env.projectConfigPath})`,
    "",
    "## Installed MCPs",
    "",
  ];
  
  if (env.existingMcps.length > 0) {
    lines.push(...env.existingMcps.map(m => `- ${m}`));
  } else {
    lines.push("No MCPs detected");
  }
  
  lines.push("");
  lines.push("## Recommended Setup Options");
  lines.push("");
  lines.push("| Option | Values | Description |");
  lines.push("|--------|--------|-------------|");
  lines.push("| scope | `global`, `project`, `both` | Where to write configuration |");
  lines.push("| orchestratorModel | e.g., `anthropic/claude-opus-4-5` | Model for orchestrator |");
  lines.push("| defaultModel | e.g., `anthropic/claude-sonnet-4-5` | Default model for agents |");
  lines.push("| mcpPreset | `recommended`, `core`, `none` | Which MCPs to install |");
  lines.push("| enableOrchestrator | `true`, `false` | Set GoopSpec as default agent |");
  
  return lines.join("\n");
}

/**
 * Format model suggestions for display
 */
function formatModelSuggestions(): string {
  const lines = [
    "# GoopSpec Agent Model Configuration",
    "",
    "Configure models for each GoopSpec agent. Each agent has recommended models optimized for its role.",
    "",
    "## Available Agents and Recommended Models",
    "",
  ];
  
  for (const [agentName, config] of Object.entries(AGENT_MODEL_SUGGESTIONS)) {
    lines.push(`### ${agentName}`);
    lines.push(`*${config.description}*`);
    lines.push("");
    lines.push("**Suggestions:**");
    for (let i = 0; i < config.suggestions.length; i++) {
      const model = config.suggestions[i];
      lines.push(`${i + 1}. \`${model}\``);
    }
    lines.push("");
  }
  
  lines.push("---");
  lines.push("");
  lines.push("## Usage");
  lines.push("");
  lines.push("To configure agent models, use:");
  lines.push("```");
  lines.push('goop_setup(action: "apply", scope: "project", agentModels: {');
  lines.push('  "goop-orchestrator": "anthropic/claude-opus-4-5",');
  lines.push('  "goop-executor": "anthropic/claude-sonnet-4-5",');
  lines.push('  "goop-explorer": "anthropic/claude-haiku-4-5"');
  lines.push("})");
  lines.push("```");
  lines.push("");
  lines.push("You can also enter custom model names not in the suggestions list.");
  
  return lines.join("\n");
}

/**
 * Format plan for display
 */
function formatPlan(plan: { 
  summary: string; 
  mcpsToInstall: string[]; 
  configsToWrite: Array<{ path: string; scope: string }>;
  agentModels?: Record<string, string>;
}): string {
  const lines = [
    "# GoopSpec Setup Plan",
    "",
    "## Summary",
    plan.summary,
    "",
  ];
  
  if (plan.agentModels && Object.keys(plan.agentModels).length > 0) {
    lines.push("## Agent Models to Configure");
    lines.push("");
    lines.push("| Agent | Model |");
    lines.push("|-------|-------|");
    for (const [agent, model] of Object.entries(plan.agentModels)) {
      lines.push(`| ${agent} | \`${model}\` |`);
    }
    lines.push("");
  }
  
  if (plan.mcpsToInstall.length > 0) {
    lines.push("## MCPs to Install");
    lines.push(...plan.mcpsToInstall.map(m => `- ${m}`));
    lines.push("");
  }
  
  if (plan.configsToWrite.length > 0) {
    lines.push("## Configurations to Write");
    lines.push(...plan.configsToWrite.map(c => `- **${c.scope}**: ${c.path}`));
    lines.push("");
  }
  
  return lines.join("\n");
}

/**
 * Format result for display
 */
function formatResult(result: { success: boolean; configsWritten: string[]; mcpsInstalled: string[]; errors: string[]; warnings: string[] }): string {
  const lines = ["# GoopSpec Setup Result", ""];
  
  if (result.success) {
    lines.push("✅ Setup completed successfully!");
    lines.push("");
  } else {
    lines.push("⚠️ Setup completed with errors");
    lines.push("");
  }
  
  if (result.configsWritten.length > 0) {
    lines.push("## Configurations Written");
    lines.push(...result.configsWritten.map(c => `- ${c}`));
    lines.push("");
  }
  
  if (result.mcpsInstalled.length > 0) {
    lines.push("## MCPs Installed");
    lines.push(...result.mcpsInstalled.map(m => `- ${m}`));
    lines.push("");
  }
  
  if (result.warnings.length > 0) {
    lines.push("## Warnings");
    lines.push(...result.warnings.map(w => `- ⚠️ ${w}`));
    lines.push("");
  }
  
  if (result.errors.length > 0) {
    lines.push("## Errors");
    lines.push(...result.errors.map(e => `- ❌ ${e}`));
    lines.push("");
  }
  
  if (result.success) {
    lines.push("## Next Steps");
    lines.push("- Run `/goop-status` to verify your configuration");
    lines.push("- Start using GoopSpec for spec-driven development");
    lines.push("- Try `/goop-discuss` to begin a new project");
  }
  
  return lines.join("\n");
}

/**
 * Create the goop-setup tool
 */
export function createGoopSetupTool(_ctx: PluginContext): ToolDefinition {
  return tool({
    description: `GoopSpec configuration tool. Use 'detect' to check current setup, 'plan' to preview changes, 'apply' to write configuration, or 'models' to see agent model suggestions.`,
    args: {
      action: tool.schema.enum(["detect", "plan", "apply", "models"]),
      scope: tool.schema.enum(["global", "project", "both"]).optional(),
      orchestratorModel: tool.schema.string().optional(),
      defaultModel: tool.schema.string().optional(),
      mcpPreset: tool.schema.enum(["core", "recommended", "none"]).optional(),
      enableOrchestrator: tool.schema.boolean().optional(),
      agentModels: tool.schema.record(tool.schema.string(), tool.schema.string()).optional(),
    },
    async execute(args, toolCtx: ToolContext): Promise<string> {
      try {
        // Models action: show model suggestions for all agents
        if (args.action === "models") {
          return formatModelSuggestions();
        }
        
        // Detect environment
        const env = await detectEnvironment(toolCtx.directory);
        
        // Detect action: just show current state
        if (args.action === "detect") {
          return formatEnvironment(env);
        }
        
        // For plan/apply, we need scope
        if (!args.scope) {
          return "Error: 'scope' is required for plan/apply actions. Use scope='global', 'project', or 'both'.";
        }
        
        // Build setup input from args
        const input: SetupInput = {
          scope: args.scope,
          models: {
            orchestrator: args.orchestratorModel,
            default: args.defaultModel,
          },
          mcpPreset: args.mcpPreset ?? "recommended",
          enableOrchestrator: args.enableOrchestrator,
          agentModels: args.agentModels,
        };
        
        // Generate plan
        const plan = await planSetup(input, env);
        
        // Add agent models to plan if provided
        if (args.agentModels) {
          plan.agentModels = args.agentModels;
        }
        
        // Plan action: show what would change
        if (args.action === "plan") {
          return formatPlan(plan);
        }
        
        // Apply action: execute the plan
        const result = await applySetup(plan);
        return formatResult(result);
        
      } catch (error) {
        return `Setup failed: ${error instanceof Error ? error.message : String(error)}`;
      }
    },
  });
}

// Export for use in commands
export { AGENT_MODEL_SUGGESTIONS as agentModelSuggestions };
