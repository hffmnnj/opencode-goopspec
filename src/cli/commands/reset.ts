/**
 * GoopSpec CLI - Reset Command
 * Reset GoopSpec configuration with confirmation
 */
import pc from "picocolors";

import { resetSetup } from "../../features/setup/index.js";
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
} from "../ui.js";

type ResetScope = "global" | "project" | "both";

function handleCancel<T>(value: T | symbol): asserts value is T {
  if (isCancel(value)) {
    cancel("Reset cancelled.");
    process.exit(0);
  }
}

export async function runReset(): Promise<void> {
  const projectDir = process.cwd();

  showBanner();
  console.log();
  intro(pc.bold("Reset GoopSpec Configuration"));

  showWarning("This will reset your GoopSpec configuration.");
  console.log();

  sectionHeader("Reset Scope", "📁");
  const scope = await select({
    message: "What do you want to reset?",
    options: [
      { value: "project", label: "Project config only", hint: ".goopspec/config.json" },
      { value: "global", label: "Global config only", hint: "~/.config/goopspec/" },
      { value: "both", label: "Both", hint: "Global + project configs" },
    ],
    initialValue: "project",
  });
  handleCancel(scope);

  sectionHeader("Data Preservation", "💾");
  const preserveData = await confirm({
    message: "Preserve user data (memories, history, checkpoints)?",
    initialValue: true,
  });
  handleCancel(preserveData);

  console.log();
  sectionHeader("Summary", "📋");
  console.log(pc.dim(`  Scope: ${scope}`));
  console.log(pc.dim(`  Preserve data: ${preserveData ? "yes" : "no"}`));

  if (!preserveData) {
    showWarning("This will DELETE memories, history, and checkpoints!");
  }
  console.log();

  const confirmReset = await confirm({
    message: pc.bold("Are you sure you want to reset?"),
    initialValue: false,
  });
  handleCancel(confirmReset);

  if (!confirmReset) {
    outro("Reset cancelled.");
    return;
  }

  const s = spinner();
  s.start("Resetting configuration...");

  try {
    const result = await resetSetup(projectDir, {
      scope: scope as ResetScope,
      preserveData,
      confirmed: true,
    });

    s.stop("Reset complete.");
    console.log();

    if (result.success) {
      if (result.reset.length > 0) {
        sectionHeader("Reset", "🔄");
        for (const item of result.reset) {
          console.log(pc.dim(`  ${item}`));
        }
        console.log();
      }

      if (result.preserved.length > 0) {
        sectionHeader("Preserved", "💾");
        for (const item of result.preserved) {
          console.log(pc.dim(`  ${item}`));
        }
        console.log();
      }

      showSuccess("Configuration reset successfully.");
      outro("Run 'goopspec init' to set up again.");
      return;
    }

    for (const error of result.errors) {
      showError(error);
    }
    outro(pc.red("Reset completed with errors."));
  } catch (error) {
    s.stop("Reset failed!");
    const message = error instanceof Error ? error.message : String(error);
    showError(message, "Check permissions and try again");
    process.exit(1);
  }
}
