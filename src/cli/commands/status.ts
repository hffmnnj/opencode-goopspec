/**
 * GoopSpec CLI - Status Command
 * Shows current configuration summary
 */
import pc from "picocolors";

import { getSetupStatus } from "../../features/setup/index.js";
import { formatTable, sectionHeader, showInfo, showWarning } from "../ui.js";

export async function runStatus(): Promise<void> {
  const projectDir = process.cwd();
  const status = await getSetupStatus(projectDir);

  if (!status.initialized) {
    showInfo("GoopSpec is not initialized in this directory.");
    console.log(pc.dim("  → Run: goopspec init"));
    return;
  }

  sectionHeader("Project", "📦");
  if (status.projectName) {
    console.log(pc.dim(`  Name: ${pc.bold(status.projectName)}`));
  }
  console.log(pc.dim(`  Initialized: ${pc.green("✓")}`));
  console.log();

  sectionHeader("Configuration", "⚙️");
  console.log(`  Global config: ${status.scope.hasGlobal ? pc.green("✓") : pc.dim("✗")}`);
  console.log(`  Project config: ${status.scope.hasProject ? pc.green("✓") : pc.dim("✗")}`);
  console.log();

  sectionHeader("Memory System", "🧠");
  console.log(`  Configured: ${status.memory.configured ? pc.green("✓") : pc.dim("✗")}`);
  console.log(`  Enabled: ${status.memory.enabled ? pc.green("✓") : pc.dim("✗")}`);
  if (status.memory.provider) {
    console.log(`  Provider: ${status.memory.provider}`);
  }
  if (status.memory.workerRunning !== undefined) {
    console.log(`  Worker: ${status.memory.workerRunning ? pc.green("running") : pc.yellow("stopped")}`);
  }
  console.log();

  sectionHeader("MCP Servers", "🔌");
  if (status.mcps.installed.length > 0) {
    console.log(`  Installed: ${status.mcps.installed.join(", ")}`);
  } else {
    console.log(pc.dim("  No MCPs installed"));
  }
  if (status.mcps.missing.length > 0) {
    showWarning(`Recommended: ${status.mcps.missing.join(", ")}`);
  }
  console.log();

  const configuredAgents = Object.entries(status.agentModels);
  if (configuredAgents.length > 0) {
    sectionHeader("Agent Models", "🤖");
    const rows = configuredAgents.map(([agent, model]) => [agent, model]);
    console.log(formatTable(["Agent", "Model"], rows));
  }
}
