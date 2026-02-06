/**
 * GoopSpec CLI - Init Command
 * Full interactive setup wizard
 */
import pc from "picocolors";

import {
  cancel,
  confirm,
  intro,
  isCancel,
  outro,
  sectionHeader,
  select,
  showBanner,
  showError,
  showSuccess,
  showWarning,
  spinner,
  text,
} from "../ui.js";
import { applyInit, detectEnvironment, planInit } from "../../features/setup/index.js";
import { AGENT_MODEL_SUGGESTIONS, ALL_AGENTS } from "../../features/setup/model-suggestions.js";
import { MCP_PRESETS } from "../../features/setup/types.js";
import type { MemorySetupInput, SetupInput } from "../../features/setup/types.js";

type SetupScope = SetupInput["scope"];
type McpPreset = SetupInput["mcpPreset"];
type MemoryProvider = NonNullable<NonNullable<MemorySetupInput["embeddings"]>["provider"]>;

function handleCancel<T>(value: T | symbol): asserts value is T {
  if (isCancel(value)) {
    cancel("Setup cancelled.");
    process.exit(0);
  }
}

function resolveText(value: string | symbol): string {
  handleCancel(value);
  return value;
}

function resolveBoolean(value: boolean | symbol): boolean {
  handleCancel(value);
  return value;
}

function resolveString(value: string | symbol): string {
  handleCancel(value);
  return value;
}

function toScope(value: string): SetupScope {
  if (value === "project" || value === "global" || value === "both") {
    return value;
  }
  throw new Error(`Invalid scope selection: ${value}`);
}

function toMcpPreset(value: string): McpPreset {
  if (value === "core" || value === "recommended" || value === "none") {
    return value;
  }
  throw new Error(`Invalid MCP preset selection: ${value}`);
}

function toMemoryProvider(value: string): MemoryProvider {
  if (value === "local" || value === "openai" || value === "ollama") {
    return value;
  }
  throw new Error(`Invalid memory provider selection: ${value}`);
}

export async function runInit(): Promise<void> {
  const projectDir = process.cwd();

  showBanner();
  console.log();
  intro(pc.bold("GoopSpec Setup Wizard"));

  const env = await detectEnvironment(projectDir);

  if (env.hasGoopspecDir && env.hasStateFile) {
    const overwrite = resolveBoolean(await confirm({
      message: "GoopSpec is already initialized. Reconfigure?",
      initialValue: false,
    }));
    if (!overwrite) {
      outro("Setup cancelled. Existing configuration preserved.");
      return;
    }
  }

  sectionHeader("Project", "📦");
  const projectName = resolveText(await text({
    message: "Project name:",
    placeholder: "my-awesome-project",
    defaultValue: env.hasStateFile ? undefined : "goopspec-project",
    validate: (value) => {
      if (!value.trim()) return "Project name is required";
      return undefined;
    },
  }));

  sectionHeader("Configuration Scope", "📁");
  const scope = toScope(resolveString(await select({
    message: "Where should GoopSpec store configuration?",
    options: [
      { value: "project", label: "Project only", hint: ".goopspec/ in this directory" },
      { value: "global", label: "Global only", hint: "~/.config/goopspec/" },
      { value: "both", label: "Both", hint: "Global defaults + project overrides" },
    ],
    initialValue: "project",
  })));

  sectionHeader("MCP Servers", "🔌");
  const mcpPreset = toMcpPreset(resolveString(await select({
    message: "Which MCP servers should be installed?",
    options: [
      { value: "recommended", label: "Recommended", hint: "context7, exa, playwright" },
      { value: "core", label: "Core only", hint: "context7, exa" },
      { value: "none", label: "None", hint: "Skip MCP installation" },
    ],
    initialValue: "recommended",
  })));

  sectionHeader("Agent Models", "🤖");
  console.log(pc.dim(`  ${ALL_AGENTS.length} agent roles available`));
  const configureModels = resolveBoolean(await confirm({
    message: "Configure custom models for agents? (or use defaults)",
    initialValue: false,
  }));

  const agentModels: Record<string, string> = {};
  if (configureModels) {
    const keyAgents = ["goop-orchestrator", "goop-executor", "goop-planner"];
    for (const agentName of keyAgents) {
      const config = AGENT_MODEL_SUGGESTIONS[agentName];
      if (!config) {
        continue;
      }

      const options = config.suggestions.map((model) => ({
        value: model,
        label: model,
      }));
      options.push({ value: "__custom__", label: "Custom model ID..." });

      const selected = resolveString(await select({
        message: `Model for ${agentName}:`,
        options,
        initialValue: config.suggestions[0],
      }));

      if (selected === "__custom__") {
        const custom = resolveText(await text({
          message: `Enter custom model ID for ${agentName}:`,
          placeholder: "provider/model-name",
          validate: (value) => {
            if (!value.trim()) return "Model ID is required";
            return undefined;
          },
        }));
        agentModels[agentName] = custom;
      } else {
        agentModels[agentName] = selected;
      }
    }
  }

  sectionHeader("Memory System", "🧠");
  const enableMemory = resolveBoolean(await confirm({
    message: "Enable persistent memory system?",
    initialValue: true,
  }));

  let memoryConfig: MemorySetupInput | undefined;
  if (enableMemory) {
    const memoryProvider = toMemoryProvider(resolveString(await select({
      message: "Embedding provider:",
      options: [
        { value: "local", label: "Local", hint: "Free, uses ONNX runtime" },
        { value: "openai", label: "OpenAI", hint: "Requires API key" },
        { value: "ollama", label: "Ollama", hint: "Local Ollama server" },
      ],
      initialValue: "local",
    })));

    memoryConfig = {
      enabled: true,
      embeddings: { provider: memoryProvider },
    };
  }

  sectionHeader("Orchestrator", "🎭");
  const enableOrchestrator = resolveBoolean(await confirm({
    message: "Enable GoopSpec orchestrator as default agent?",
    initialValue: false,
  }));

  const input: SetupInput = {
    scope,
    projectName,
    models: {},
    mcpPreset,
    enableOrchestrator,
    agentModels: Object.keys(agentModels).length > 0 ? agentModels : undefined,
    memory: memoryConfig,
  };

  console.log();
  sectionHeader("Summary", "📋");
  console.log(pc.dim(`  Project: ${input.projectName}`));
  console.log(pc.dim(`  Scope: ${input.scope}`));
  console.log(pc.dim(`  MCP preset: ${input.mcpPreset}`));
  console.log(pc.dim(`  MCPs selected: ${MCP_PRESETS[input.mcpPreset].join(", ") || "none"}`));
  console.log(pc.dim(`  Models configured: ${Object.keys(agentModels).length}`));
  console.log(pc.dim(`  Memory: ${memoryConfig ? "enabled" : "disabled"}`));
  console.log(pc.dim(`  Orchestrator: ${input.enableOrchestrator ? "enabled" : "disabled"}`));
  console.log();

  const proceed = resolveBoolean(await confirm({
    message: "Proceed with setup?",
    initialValue: true,
  }));

  if (!proceed) {
    outro("Setup cancelled.");
    return;
  }

  const s = spinner();
  s.start("Initializing GoopSpec...");

  try {
    const plan = await planInit(projectDir, input, env);
    const result = await applyInit(projectDir, plan);

    s.stop("Setup complete!");

    if (result.success) {
      console.log();
      showSuccess(`Project "${result.projectName}" initialized!`);

      if (result.created.length > 0) {
        console.log(pc.dim(`  Created: ${result.created.length} files/directories`));
      }
      if (result.mcpsInstalled.length > 0) {
        console.log(pc.dim(`  MCPs installed: ${result.mcpsInstalled.join(", ")}`));
      }
      if (result.memorySetup) {
        const mem = result.memorySetup;
        if (mem.vectorSearch.enabled) {
          console.log(pc.dim("  Vector search: enabled"));
        }
        if (mem.localEmbeddings.enabled) {
          console.log(pc.dim("  Local embeddings: enabled"));
        }
        if (mem.degradedFeatures.length > 0) {
          for (const feature of mem.degradedFeatures) {
            showWarning(feature);
          }
        }
      }

      if (result.warnings.length > 0) {
        console.log();
        for (const warning of result.warnings) {
          showWarning(warning);
        }
      }

      console.log();
      outro(pc.green("GoopSpec is ready! Run 'goopspec status' to see your configuration."));
      return;
    }

    console.log();
    for (const error of result.errors) {
      showError(error);
    }
    outro(pc.red("Setup completed with errors. Run 'goopspec verify' for details."));
  } catch (error) {
    s.stop("Setup failed!");
    const message = error instanceof Error ? error.message : String(error);
    showError(message, "Check permissions and try again");
    process.exit(1);
  }
}
