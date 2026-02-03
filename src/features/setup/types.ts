/**
 * Setup Feature Types
 * Type definitions for the GoopSpec setup system
 * 
 * @module features/setup/types
 */

/**
 * Setup environment detection result
 */
export interface SetupEnvironment {
  /** Whether OpenCode config exists */
  hasOpenCodeConfig: boolean;
  /** Whether global GoopSpec config exists */
  hasGlobalGoopSpecConfig: boolean;
  /** Whether project GoopSpec config exists */
  hasProjectGoopSpecConfig: boolean;
  /** List of already installed MCPs */
  existingMcps: string[];
  /** Path to OpenCode config file */
  opencodeConfigPath: string;
  /** Path to global GoopSpec config file */
  globalConfigPath: string;
  /** Path to project GoopSpec config file */
  projectConfigPath: string;
}

/**
 * Setup input from user (interactive or CLI args)
 */
export interface SetupInput {
  /** Where to write configuration */
  scope: "global" | "project" | "both";
  /** Model configuration */
  models: {
    /** Orchestrator model (default: claude-opus-4-5) */
    orchestrator?: string;
    /** Default model for agents */
    default?: string;
  };
  /** MCP preset selection */
  mcpPreset: "core" | "recommended" | "none";
  /** Custom MCP selection (if preset is "custom") */
  mcpSelection?: {
    context7?: boolean;
    exa?: boolean;
    playwright?: boolean;
    memory?: boolean;
    github?: boolean;
    sqlite?: boolean;
  };
  /** Whether to enable orchestrator as default agent */
  enableOrchestrator?: boolean;
  /** Per-agent model configuration */
  agentModels?: Record<string, string>;
}

/**
 * Planned setup actions
 */
export interface SetupPlan {
  /** List of actions to perform */
  actions: SetupAction[];
  /** Human-readable summary */
  summary: string;
  /** MCPs that need to be installed */
  mcpsToInstall: string[];
  /** Configs that will be written */
  configsToWrite: ConfigWrite[];
  /** Per-agent model configuration */
  agentModels?: Record<string, string>;
}

/**
 * Individual setup action
 */
export interface SetupAction {
  /** Type of action */
  type: "write_config" | "install_mcp" | "update_schema";
  /** Target file or resource */
  target: string;
  /** Changes to apply */
  changes: Record<string, unknown>;
  /** Human-readable description */
  description: string;
}

/**
 * Configuration write operation
 */
export interface ConfigWrite {
  /** Path to config file */
  path: string;
  /** Scope of config */
  scope: "global" | "project" | "opencode";
  /** Config content to write */
  content: Record<string, unknown>;
}

/**
 * Setup execution result
 */
export interface SetupResult {
  /** Whether setup succeeded */
  success: boolean;
  /** List of config files written */
  configsWritten: string[];
  /** List of MCPs installed */
  mcpsInstalled: string[];
  /** Any errors encountered */
  errors: string[];
  /** Any warnings generated */
  warnings: string[];
}

/**
 * MCP preset definitions
 */
export const MCP_PRESETS = {
  core: ["context7", "exa"],
  recommended: ["context7", "exa", "playwright"],
  none: [],
} as const;

export type McpPreset = keyof typeof MCP_PRESETS;
