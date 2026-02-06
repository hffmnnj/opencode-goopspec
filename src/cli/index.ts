#!/usr/bin/env node

import pc from "picocolors";

import { CLI_COMMANDS, type CliArgs, type CliCommand } from "./types.js";

const VERSION = "0.1.6";

function isCliCommand(value: string): value is CliCommand {
  return CLI_COMMANDS.includes(value as CliCommand);
}

function isFlag(value: string): boolean {
  return value.startsWith("--");
}

export function parseArgs(argv: string[]): CliArgs {
  const flags: Record<string, string | boolean> = {};
  const positional: string[] = [];

  for (const token of argv) {
    if (isFlag(token)) {
      const flagBody = token.slice(2);
      if (!flagBody) {
        continue;
      }

      const equalsIndex = flagBody.indexOf("=");
      if (equalsIndex === -1) {
        flags[flagBody] = true;
        continue;
      }

      const key = flagBody.slice(0, equalsIndex);
      const value = flagBody.slice(equalsIndex + 1);
      if (key) {
        flags[key] = value;
      }
      continue;
    }

    positional.push(token);
  }

  const commandInput = positional[0];
  const command = commandInput && isCliCommand(commandInput) ? commandInput : null;

  return {
    command,
    flags,
    args: positional.slice(1),
  };
}

export function showHelp(): void {
  const commands = CLI_COMMANDS.map((command) => `  - ${command}`).join("\n");

  console.log(pc.bold(pc.cyan("goopspec")) + pc.gray(" - interactive setup CLI"));
  console.log();
  console.log(pc.bold("Usage:"));
  console.log("  goopspec <command> [options]");
  console.log();
  console.log(pc.bold("Commands:"));
  console.log(commands);
  console.log();
  console.log(pc.bold("Options:"));
  console.log("  --help      Show help");
  console.log("  --version   Show version");
}

export function showVersion(): void {
  console.log(`goopspec v${VERSION}`);
}

function levenshteinDistance(a: string, b: string): number {
  const rows = a.length + 1;
  const cols = b.length + 1;
  const matrix: number[][] = Array.from({ length: rows }, () => Array<number>(cols).fill(0));

  for (let i = 0; i < rows; i += 1) {
    matrix[i][0] = i;
  }
  for (let j = 0; j < cols; j += 1) {
    matrix[0][j] = j;
  }

  for (let i = 1; i < rows; i += 1) {
    for (let j = 1; j < cols; j += 1) {
      const substitutionCost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + substitutionCost,
      );
    }
  }

  return matrix[a.length][b.length];
}

export function suggestCommand(input: string): string | null {
  if (!input.trim()) {
    return null;
  }

  let bestMatch: CliCommand | null = null;
  let bestDistance = Number.POSITIVE_INFINITY;

  for (const command of CLI_COMMANDS) {
    const distance = levenshteinDistance(input, command);
    if (distance < bestDistance) {
      bestDistance = distance;
      bestMatch = command;
    }
  }

  const threshold = Math.max(2, Math.floor(input.length / 2));
  return bestDistance <= threshold ? bestMatch : null;
}

export async function main(): Promise<void> {
  const argv = process.argv.slice(2);

  try {
    const parsed = parseArgs(argv);
    const commandInput = argv.find((arg) => !isFlag(arg));

    if (parsed.flags.help || !commandInput) {
      showHelp();
      return;
    }

    if (parsed.flags.version) {
      showVersion();
      return;
    }

    if (parsed.command) {
      console.log(pc.yellow(`Command '${parsed.command}' not yet implemented`));
      return;
    }

    const suggestion = suggestCommand(commandInput);
    console.error(pc.red(`Unknown command: ${commandInput}`));
    if (suggestion) {
      console.error(pc.gray(`Did you mean '${suggestion}'?`));
    }
    process.exit(1);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(pc.red(`Error: ${message}`));
    process.exit(1);
  }
}

void main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(pc.red(`Unexpected error: ${message}`));
  process.exit(1);
});
