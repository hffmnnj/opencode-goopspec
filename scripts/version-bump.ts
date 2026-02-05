/// <reference types="bun-types" />

type CliOptions = {
  version?: string;
  dryRun: boolean;
  help: boolean;
};

type UpdateResult = {
  content: string;
  changeCount: number;
};

type UpdatePattern = {
  name: string;
  apply: (content: string, fromVersion: string, toVersion: string) => UpdateResult;
};

const USAGE = `Usage: bun scripts/version-bump.ts <version> [--dry-run]

Options:
  --dry-run    Preview changes without writing
  --help       Show this help message

Examples:
  bun scripts/version-bump.ts 0.1.6 --dry-run
`;

const FILE_PATTERNS = [
  "*.example.json",
  "agents/**/*.md",
  "skills/**/*.md",
  "references/**/*.md",
  "templates/**/*.md",
  "commands/**/*.md",
  "src/**/*.ts",
];

const EXPLICIT_FILES = ["package.json", "README.md"];

const updatePatterns: UpdatePattern[] = [];

const knownFlags = new Set(["--dry-run", "--help", "-h"]);

function parseArgs(args: string[]): CliOptions {
  let version: string | undefined;
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
        throw new Error(`Unknown flag: ${arg}`);
      }
      continue;
    }
    if (!version) {
      version = arg;
    }
  }

  return { version, dryRun, help };
}

function normalizePath(path: string): string {
  return path.replace(/\\/g, "/");
}

function shouldExclude(path: string): boolean {
  const normalized = normalizePath(path);
  if (normalized.includes("/node_modules/")) {
    return true;
  }
  if (normalized.includes("/dist/")) {
    return true;
  }
  if (normalized.includes("/.goopspec/archive/")) {
    return true;
  }
  if (normalized.endsWith(".test.ts")) {
    return true;
  }
  return false;
}

async function readPackageVersion(): Promise<string> {
  const packageFile = Bun.file("package.json");
  if (!(await packageFile.exists())) {
    throw new Error("package.json not found");
  }
  const text = await packageFile.text();
  const parsed = JSON.parse(text) as { version?: string };
  if (!parsed.version) {
    throw new Error("package.json missing version field");
  }
  return parsed.version;
}

async function discoverFiles(): Promise<string[]> {
  const discovered = new Set<string>();

  for (const file of EXPLICIT_FILES) {
    if (!shouldExclude(file)) {
      discovered.add(file);
    }
  }

  for (const pattern of FILE_PATTERNS) {
    const glob = new Bun.Glob(pattern);
    for await (const file of glob.scan({ cwd: ".", onlyFiles: true })) {
      if (!shouldExclude(file)) {
        discovered.add(file);
      }
    }
  }

  return Array.from(discovered).sort();
}

function applyPatterns(
  content: string,
  fromVersion: string,
  toVersion: string,
  patterns: UpdatePattern[],
): UpdateResult {
  let updated = content;
  let changeCount = 0;

  for (const pattern of patterns) {
    const result = pattern.apply(updated, fromVersion, toVersion);
    updated = result.content;
    changeCount += result.changeCount;
  }

  return { content: updated, changeCount };
}

async function run(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    console.log(USAGE);
    return;
  }

  if (!args.version) {
    console.error("Error: version argument is required.\n");
    console.log(USAGE);
    process.exit(1);
  }

  const currentVersion = await readPackageVersion();
  const targetVersion = args.version;

  console.log(`Current version: ${currentVersion}`);
  console.log(`Target version: ${targetVersion}`);

  const files = await discoverFiles();
  console.log(`Discovered ${files.length} files.`);

  if (updatePatterns.length === 0) {
    console.log("No update patterns configured yet.");
    return;
  }

  let updatedFiles = 0;
  let totalChanges = 0;

  for (const filePath of files) {
    const file = Bun.file(filePath);
    const original = await file.text();
    const { content: updated, changeCount } = applyPatterns(
      original,
      currentVersion,
      targetVersion,
      updatePatterns,
    );

    if (changeCount > 0) {
      updatedFiles += 1;
      totalChanges += changeCount;
      if (!args.dryRun) {
        await Bun.write(filePath, updated);
      }
    }
  }

  console.log(`Files updated: ${updatedFiles}`);
  console.log(`Total changes: ${totalChanges}`);
  if (args.dryRun) {
    console.log("Dry run: no files were written.");
  }
}

try {
  await run();
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Error: ${message}`);
  process.exit(1);
}

export {};
