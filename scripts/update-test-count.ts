/// <reference types="bun-types" />

type CliOptions = {
  dryRun: boolean;
  help: boolean;
};

type TestSummary = {
  passCount: number;
  fileCount: number;
};

type UpdateResult = {
  content: string;
  changeCount: number;
  previousCount?: number;
};

class UsageError extends Error {
  override name = "UsageError";
}

const USAGE = `Usage: bun scripts/update-test-count.ts [--dry-run]

Options:
  --dry-run    Preview changes without writing
  --help       Show this help message

Examples:
  bun scripts/update-test-count.ts --dry-run
`;

const README_PATH = "README.md";
const BADGE_PATTERN = /(tests-)(\d+)(%20passing)/;
const PASS_PATTERN = /(^|\n)\s*(\d+)\s+pass\b/m;
const FILE_LINE_PATTERN = /(^|\n)\s*(\d+)\s+files\b/m;
const FILE_SUMMARY_PATTERN = /across\s+(\d+)\s+files\b/i;

const knownFlags = new Set(["--dry-run", "--help", "-h"]);
const supportsColor = Boolean(process.stdout.isTTY) && !process.env.NO_COLOR;
const colorize = {
  green: (value: string) => (supportsColor ? `\x1b[32m${value}\x1b[0m` : value),
  yellow: (value: string) => (supportsColor ? `\x1b[33m${value}\x1b[0m` : value),
  red: (value: string) => (supportsColor ? `\x1b[31m${value}\x1b[0m` : value),
  dim: (value: string) => (supportsColor ? `\x1b[2m${value}\x1b[0m` : value),
};

function parseArgs(args: string[]): CliOptions {
  let dryRun = false;
  let help = false;

  for (const arg of args) {
    if (arg === "--dry-run") {
      dryRun = true;
      continue;
    }
    if (arg === "--help" || arg === "-h") {
      help = true;
      continue;
    }
    if (arg.startsWith("-")) {
      if (!knownFlags.has(arg)) {
        throw new UsageError(`Unknown flag: ${arg}`);
      }
      continue;
    }
    throw new UsageError(`Unexpected argument: ${arg}`);
  }

  return { dryRun, help };
}

function printUsageError(message: string): void {
  console.error(colorize.red(`Error: ${message}`));
  console.error("");
  console.error(USAGE);
}

async function runTests(): Promise<string> {
  const processHandle = Bun.spawn(["bun", "test"], {
    stdout: "pipe",
    stderr: "pipe",
  });

  const [stdout, stderr, exitCode] = await Promise.all([
    new Response(processHandle.stdout).text(),
    new Response(processHandle.stderr).text(),
    processHandle.exited,
  ]);

  const output = `${stdout}\n${stderr}`.trim();
  if (exitCode !== 0) {
    throw new Error(`bun test failed with exit code ${exitCode}.`);
  }

  return output;
}

function parseTestSummary(output: string): TestSummary {
  const passMatch = PASS_PATTERN.exec(output);
  if (!passMatch) {
    throw new Error("Unable to parse passing test count from bun test output.");
  }

  const fileLineMatch = FILE_LINE_PATTERN.exec(output);
  const fileSummaryMatch = FILE_SUMMARY_PATTERN.exec(output);
  const fileCountText = fileLineMatch?.[2] ?? fileSummaryMatch?.[1];
  if (!fileCountText) {
    throw new Error("Unable to parse file count from bun test output.");
  }

  const passCount = Number.parseInt(passMatch[2], 10);
  const fileCount = Number.parseInt(fileCountText, 10);

  if (!Number.isFinite(passCount) || !Number.isFinite(fileCount)) {
    throw new Error("Parsed invalid numbers from bun test output.");
  }

  return { passCount, fileCount };
}

function updateReadmeBadge(content: string, passCount: number): UpdateResult {
  let changeCount = 0;
  let previousCount: number | undefined;

  const updated = content.replace(
    BADGE_PATTERN,
    (_match, prefix: string, count: string, suffix: string) => {
      const parsed = Number.parseInt(count, 10);
      if (Number.isFinite(parsed)) {
        previousCount = parsed;
      }
      if (count === String(passCount)) {
        return `${prefix}${count}${suffix}`;
      }
      changeCount += 1;
      return `${prefix}${passCount}${suffix}`;
    },
  );

  if (previousCount === undefined) {
    throw new Error("Unable to find README tests badge pattern: tests-NNNN%20passing");
  }

  return { content: updated, changeCount, previousCount };
}

async function run(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    console.log(USAGE);
    return;
  }

  console.log(colorize.dim("Running bun test to capture latest counts..."));
  const output = await runTests();
  const summary = parseTestSummary(output);
  console.log(`Parsed passing tests: ${colorize.green(String(summary.passCount))}`);
  console.log(`Parsed test files: ${colorize.green(String(summary.fileCount))}`);

  const readmeFile = Bun.file(README_PATH);
  if (!(await readmeFile.exists())) {
    throw new Error(`${README_PATH} not found.`);
  }
  const original = await readmeFile.text();
  const result = updateReadmeBadge(original, summary.passCount);

  const oldValue = result.previousCount ?? summary.passCount;
  const newValue = summary.passCount;

  if (args.dryRun) {
    if (result.changeCount > 0) {
      console.log(colorize.yellow("Dry run preview:"));
      console.log(
        `${colorize.yellow("- Would update")}: tests-${oldValue}%20passing -> tests-${newValue}%20passing`,
      );
    } else {
      console.log(colorize.yellow("Dry run: README badge already up to date."));
    }
    console.log(colorize.yellow("Dry run: no files were written."));
    return;
  }

  if (result.changeCount === 0) {
    console.log(colorize.yellow("No changes needed. README badge is already current."));
    return;
  }

  await Bun.write(README_PATH, result.content);
  console.log(
    `${colorize.green("Updated")}: tests-${oldValue}%20passing -> tests-${newValue}%20passing`,
  );
}

try {
  await run();
} catch (error) {
  if (error instanceof UsageError) {
    printUsageError(error.message);
    process.exit(1);
  }
  const message = error instanceof Error ? error.message : String(error);
  console.error(colorize.red(`Error: ${message}`));
  process.exit(1);
}

export {};
