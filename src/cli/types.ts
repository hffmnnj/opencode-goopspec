export const CLI_COMMANDS = ["init", "models", "memory", "status", "verify", "reset"] as const;

export type CliCommand = (typeof CLI_COMMANDS)[number];

export interface CliArgs {
  command: CliCommand | null;
  flags: Record<string, string | boolean>;
  args: string[];
}
