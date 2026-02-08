import { tmpdir } from "os";
import {
  basename,
  dirname,
  join,
  resolve,
  sep,
} from "path";

export { basename, dirname, join, resolve, sep };

export function isWindows(): boolean {
  return process.platform === "win32";
}

export function getHomeDir(): string {
  const home = process.env.HOME || process.env.USERPROFILE;
  if (!home) {
    throw new Error("Unable to resolve home directory: HOME and USERPROFILE are not set");
  }

  return home;
}

export function getTempDir(): string {
  return tmpdir();
}

export function normalizePath(pathValue: string): string {
  return pathValue.replace(/\\/g, "/");
}

export function ensurePosixPath(pathValue: string): string {
  return normalizePath(pathValue);
}
