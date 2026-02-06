/**
 * GoopSpec CLI - Models Command
 * Interactive agent model configuration
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

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
  showSuccess,
  text,
} from "../ui.js";
import { getSetupStatus } from "../../features/setup/index.js";
import { AGENT_MODEL_SUGGESTIONS, ALL_AGENTS } from "../../features/setup/model-suggestions.js";

function handleCancel<T>(value: T | symbol): asserts value is T {
  if (isCancel(value)) {
    cancel("Model configuration cancelled.");
    process.exit(0);
  }
}

async function loadCurrentConfig(projectDir: string): Promise<Record<string, unknown>> {
  const configPath = join(projectDir, ".goopspec", "config.json");
  if (existsSync(configPath)) {
    try {
      return JSON.parse(readFileSync(configPath, "utf-8")) as Record<string, unknown>;
    } catch {
      return {};
    }
  }
  return {};
}

async function saveConfig(projectDir: string, config: Record<string, unknown>): Promise<void> {
  const configPath = join(projectDir, ".goopspec", "config.json");
  const dir = dirname(configPath);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  writeFileSync(configPath, JSON.stringify(config, null, 2));
}

async function selectAgents(): Promise<string[]> {
  const selected: string[] = [];

  for (const agent of ALL_AGENTS) {
    const config = AGENT_MODEL_SUGGESTIONS[agent];
    const include = await confirm({
      message: `Configure ${agent}?`,
      initialValue: false,
    });
    handleCancel(include);
    if (include) {
      selected.push(agent);
      if (config) {
        console.log(pc.dim(`  ${config.description}`));
      }
    }
  }

  return selected;
}

export async function runModels(): Promise<void> {
  const projectDir = process.cwd();

  showBanner();
  console.log();
  intro(pc.bold("Agent Model Configuration"));

  const status = await getSetupStatus(projectDir);
  const currentModels = status.agentModels;

  sectionHeader("Current Models", "🤖");
  if (Object.keys(currentModels).length === 0) {
    console.log(pc.dim("  No custom models configured (using defaults)"));
  } else {
    for (const [agent, model] of Object.entries(currentModels)) {
      console.log(`  ${pc.dim(agent)}: ${model}`);
    }
  }
  console.log();

  const action = await select({
    message: "What would you like to do?",
    options: [
      { value: "configure", label: "Configure specific agents" },
      { value: "configure_all", label: "Configure all agents" },
      { value: "reset", label: "Reset to defaults" },
      { value: "view", label: "View suggestions only" },
    ],
    initialValue: "configure",
  });
  handleCancel(action);

  if (action === "view") {
    console.log();
    sectionHeader("Model Suggestions", "📋");
    for (const agentName of ALL_AGENTS) {
      const config = AGENT_MODEL_SUGGESTIONS[agentName];
      if (!config) {
        continue;
      }
      console.log();
      console.log(pc.bold(`  ${agentName}`));
      console.log(pc.dim(`  ${config.description}`));
      console.log(pc.dim(`  Suggestions: ${config.suggestions.join(", ")}`));
    }
    console.log();
    outro("Run 'goopspec models' again to configure.");
    return;
  }

  if (action === "reset") {
    const confirmReset = await confirm({
      message: "Reset all agent models to defaults?",
      initialValue: false,
    });
    handleCancel(confirmReset);

    if (confirmReset) {
      const config = await loadCurrentConfig(projectDir);
      delete config.agents;
      await saveConfig(projectDir, config);
      showSuccess("Agent models reset to defaults.");
    }
    outro("Done.");
    return;
  }

  const agentsToConfig = action === "configure_all" ? ALL_AGENTS : await selectAgents();
  const newModels: Record<string, string> = {};

  for (const agentName of agentsToConfig) {
    const config = AGENT_MODEL_SUGGESTIONS[agentName];
    if (!config) {
      continue;
    }

    console.log();
    sectionHeader(agentName, "🤖");
    console.log(pc.dim(`  ${config.description}`));

    const currentModel = currentModels[agentName];
    if (currentModel) {
      console.log(pc.dim(`  Current: ${currentModel}`));
    }

    const options = config.suggestions.map((model) => ({
      value: model,
      label: model,
    }));
    options.push({ value: "__custom__", label: "Custom model ID..." });
    options.push({ value: "__skip__", label: "Skip (keep current)" });

    const selected = await select({
      message: `Model for ${agentName}:`,
      options,
      initialValue: currentModel ?? config.suggestions[0],
    });
    handleCancel(selected);

    if (selected === "__skip__") {
      if (currentModel) {
        newModels[agentName] = currentModel;
      }
      continue;
    }

    if (selected === "__custom__") {
      const custom = await text({
        message: "Enter custom model ID:",
        placeholder: "provider/model-name",
        validate: (value) => {
          if (!value.trim()) {
            return "Model ID required";
          }
          return undefined;
        },
      });
      handleCancel(custom);
      newModels[agentName] = custom.trim();
    } else {
      newModels[agentName] = selected;
    }
  }

  if (Object.keys(newModels).length > 0) {
    const config = await loadCurrentConfig(projectDir);
    const existingAgents =
      typeof config.agents === "object" && config.agents !== null
        ? (config.agents as Record<string, { model: string }>)
        : {};
    config.agents = existingAgents;

    for (const [agent, model] of Object.entries(newModels)) {
      existingAgents[agent] = { model };
    }

    await saveConfig(projectDir, config);

    console.log();
    showSuccess(`Configured ${Object.keys(newModels).length} agent(s).`);
  }

  outro("Model configuration complete.");
}
