/**
 * GoopSpec Slash Command Tool
 * Load and execute slash commands
 * 
 * @module tools/slashcommand
 */

import { tool, type ToolDefinition } from "@opencode-ai/plugin/tool";
import type { PluginContext, CommandDefinition, ToolContext } from "../../core/types.js";

/**
 * Build description with available commands
 */
function buildDescription(ctx: PluginContext): string {
  const commands = ctx.resolver.resolveAll("command");
  
  const commandList = commands
    .map(c => {
      const hint = c.frontmatter["argument-hint"] || "";
      const desc = c.frontmatter.description || "";
      return `- /${c.name}${hint ? ` ${hint}` : ""}: ${desc}`;
    })
    .join("\n");
  
  return `Execute a GoopSpec slash command. Available commands:\n\n${commandList}`;
}

/**
 * Create the slashcommand tool
 */
export function createSlashcommandTool(ctx: PluginContext): ToolDefinition {
  // Cache description
  let cachedDescription: string | null = null;
  
  const getDescription = () => {
    if (!cachedDescription) {
      cachedDescription = buildDescription(ctx);
    }
    return cachedDescription;
  };
  
  return tool({
    get description() {
      return getDescription();
    },
    args: {
      command: tool.schema.string(),
    },
    async execute(args, _context: ToolContext): Promise<string> {
      const commands = ctx.resolver.resolveAll("command");
      
      // Normalize command name
      const cmdName = args.command.replace(/^\//, "").toLowerCase();
      
      // Find matching command
      const command = commands.find(
        c => c.name.toLowerCase() === cmdName
      );
      
      if (!command) {
        // Try partial match
        const partialMatches = commands.filter(
          c => c.name.toLowerCase().includes(cmdName)
        );
        
        if (partialMatches.length > 0) {
          const suggestions = partialMatches.map(c => `/${c.name}`).join(", ");
          return `Command "/${cmdName}" not found. Did you mean: ${suggestions}?`;
        }
        
        const available = commands.map(c => `/${c.name}`).join(", ");
        return `Command "/${cmdName}" not found.\n\nAvailable commands: ${available}`;
      }
      
      // Build command output
      const cmdDef: CommandDefinition = {
        name: command.name,
        description: command.frontmatter.description as string || "",
        argumentHint: command.frontmatter["argument-hint"] as string | undefined,
        model: command.frontmatter.model as string | undefined,
        agent: command.frontmatter.agent as string | undefined,
        content: command.body,
      };
      
      const lines = [
        `# /${cmdDef.name} Command`,
        "",
      ];
      
      if (cmdDef.description) {
        lines.push(`**Description:** ${cmdDef.description}`, "");
      }
      
      if (cmdDef.argumentHint) {
        lines.push(`**Usage:** /${cmdDef.name} ${cmdDef.argumentHint}`, "");
      }
      
      if (cmdDef.model) {
        lines.push(`**Model:** ${cmdDef.model}`, "");
      }
      
      if (cmdDef.agent) {
        lines.push(`**Agent:** ${cmdDef.agent}`, "");
      }
      
      lines.push("---", "", "## Instructions", "", cmdDef.content);
      
      return lines.join("\n");
    },
  });
}
