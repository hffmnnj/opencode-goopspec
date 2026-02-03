/**
 * GoopSpec Status Tool
 * Shows current workflow state, phase, and pending tasks
 * 
 * @module tools/goop-status
 */

import { tool, type ToolDefinition } from "@opencode-ai/plugin/tool";
import type { PluginContext, GoopState, ToolContext } from "../../core/types.js";

/**
 * Generate a text progress bar
 */
function generateProgressBar(progress: number, width: number = 10): string {
  const filled = Math.round(progress * width);
  const empty = width - filled;
  return `[${"█".repeat(filled)}${"░".repeat(empty)}]`;
}

/**
 * Get suggested next steps based on current phase
 */
function getNextSteps(phase: string, specLocked: boolean): string[] {
  const steps: Record<string, string[]> = {
    idle: [
      "`/goop-plan` - Start planning a new feature",
      "`/goop-quick` - Quick task for small fixes",
    ],
    plan: [
      "`/goop-research` - Research implementation approaches",
      "Define requirements and success criteria",
    ],
    research: [
      "`/goop-specify` - Lock the specification",
      "Review RESEARCH.md findings",
    ],
    specify: specLocked ? [
      "`/goop-execute` - Start implementation",
      "`/goop-amend` - Request spec changes",
    ] : [
      "Confirm specification to lock it",
      "Review must-haves and out-of-scope",
    ],
    execute: [
      "Complete current wave tasks",
      "`/goop-pause` - Save checkpoint",
    ],
    accept: [
      "Verify all requirements met",
      "`/goop-complete` - Archive and finish",
    ],
  };
  
  return steps[phase] || ["`/goop-status` - Check current state"];
}

/**
 * Format workflow status for display
 */
function formatStatus(state: GoopState | null, verbose: boolean, ctx: PluginContext): string {
  const lines: string[] = [];
  
  lines.push("# GoopSpec Status\n");
  
  // Handle missing or incomplete state
  if (!state) {
    lines.push("**Status:** Not initialized");
    lines.push("\nRun `/goop-plan` to start a new project.");
    return lines.join("\n");
  }
  
  // Project info
  const projectName = state.project?.name || "Unknown";
  const initialized = state.project?.initialized || "Not set";
  lines.push(`**Project:** ${projectName}`);
  lines.push(`**Initialized:** ${initialized}\n`);
  
  // Workflow status with new fields
  const workflow = state.workflow || { 
    phase: "idle", 
    mode: "standard",
    specLocked: false,
    acceptanceConfirmed: false,
    currentWave: 0,
    totalWaves: 0,
    lastActivity: "Never" 
  };
  
  lines.push("## Workflow");
  
  // Phase display with visual indicator
  const phaseIcons: Record<string, string> = {
    idle: "⚪",
    plan: "📝",
    research: "🔍",
    specify: "📋",
    execute: "🔨",
    accept: "✅",
  };
  const phaseIcon = phaseIcons[workflow.phase] || "⚪";
  lines.push(`- **Phase:** ${phaseIcon} ${workflow.phase || "idle"}`);
  
  // Mode
  const modeIcons: Record<string, string> = {
    quick: "⚡",
    standard: "📦",
    comprehensive: "🏗️",
    milestone: "🎯",
  };
  const modeIcon = modeIcons[workflow.mode] || "📦";
  lines.push(`- **Mode:** ${modeIcon} ${workflow.mode || "standard"}`);
  
  // Contract gates
  lines.push(`- **Spec Locked:** ${workflow.specLocked ? "🔒 Yes" : "🔓 No"}`);
  lines.push(`- **Accepted:** ${workflow.acceptanceConfirmed ? "✅ Yes" : "⏳ Pending"}`);
  
  // Wave progress (only show if in execute phase or has waves)
  if (workflow.totalWaves > 0) {
    const progress = workflow.currentWave / workflow.totalWaves;
    const progressBar = generateProgressBar(progress);
    lines.push(`- **Wave Progress:** ${workflow.currentWave}/${workflow.totalWaves} ${progressBar}`);
  }
  
  lines.push(`- **Last Activity:** ${workflow.lastActivity || "Never"}\n`);
  
  // Execution state
  const execution = state.execution || { 
    completedPhases: [], 
    activeCheckpointId: null, 
    pendingTasks: [],
    currentMilestone: undefined
  };
  
  lines.push("## Execution");
  
  if (execution.currentMilestone) {
    lines.push(`- **Current Milestone:** ${execution.currentMilestone}`);
  }
  
  lines.push(`- **Completed Phases:** ${
    execution.completedPhases?.length > 0 
      ? execution.completedPhases.join(" → ") 
      : "None"
  }`);
  lines.push(`- **Active Checkpoint:** ${execution.activeCheckpointId || "None"}`);
  lines.push(`- **Pending Tasks:** ${execution.pendingTasks?.length || 0}`);
  
  // Verbose: show pending tasks
  if (verbose && execution.pendingTasks?.length > 0) {
    lines.push("\n### Pending Tasks");
    for (const task of execution.pendingTasks) {
      const statusIcon = {
        pending: "⏳",
        in_progress: "🔄",
        completed: "✅",
        failed: "❌",
      }[task.status] || "⏳";
      lines.push(`- ${statusIcon} ${task.name} (${task.phase}/${task.plan})`);
    }
  }
  
  // Recent memory (if available and verbose)
  if (verbose && ctx.memoryManager) {
    lines.push("\n## Recent Memory");
    // Would fetch recent memories here
    lines.push("- Use `memory_search` to find relevant context");
  }
  
  // Quick actions based on current state
  lines.push("\n## Next Steps");
  const nextSteps = getNextSteps(workflow.phase, workflow.specLocked);
  for (const step of nextSteps) {
    lines.push(`- ${step}`);
  }
  
  return lines.join("\n");
}

/**
 * Create the goop_status tool
 */
export function createGoopStatusTool(ctx: PluginContext): ToolDefinition {
  return tool({
    description: "Show current GoopSpec workflow state, phase, and pending tasks",
    args: {
      verbose: tool.schema.boolean().optional(),
    },
    async execute(args, _context: ToolContext): Promise<string> {
      const state = ctx.stateManager.getState();
      return formatStatus(state, args.verbose ?? false, ctx);
    },
  });
}
