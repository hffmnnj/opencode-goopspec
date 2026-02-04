/**
 * Platform Detection Utilities
 * Detects OS, architecture, and runtime environment for native extension installation
 * @module features/setup/platform
 */

/**
 * Platform information for native extension installation
 */
export interface PlatformInfo {
  /** Operating system: linux, darwin (macOS), or win32 (Windows) */
  os: "linux" | "darwin" | "win32";
  /** CPU architecture: x64 (Intel/AMD) or arm64 (Apple Silicon/ARM) */
  arch: "x64" | "arm64";
  /** JavaScript runtime: bun or node */
  runtime: "bun" | "node";
  /** Package suffix for platform-specific packages (e.g., "linux-x64") */
  packageSuffix: string;
  /** Human-readable platform description */
  description: string;
}

/**
 * Supported platform combinations for sqlite-vec
 */
export const SUPPORTED_PLATFORMS = [
  "linux-x64",
  "linux-arm64",
  "darwin-x64",
  "darwin-arm64",
  "windows-x64",
] as const;

export type SupportedPlatform = (typeof SUPPORTED_PLATFORMS)[number];

/**
 * Detect current platform information
 */
export function detectPlatform(): PlatformInfo {
  const os = process.platform as PlatformInfo["os"];
  const arch = process.arch === "arm64" ? "arm64" : "x64";
  const runtime = typeof Bun !== "undefined" ? "bun" : "node";
  
  // Windows uses "win32" internally but packages use "windows"
  const osForPackage = os === "win32" ? "windows" : os;
  const packageSuffix = `${osForPackage}-${arch}`;
  
  const osNames: Record<string, string> = {
    linux: "Linux",
    darwin: "macOS",
    win32: "Windows",
  };
  
  const archNames: Record<string, string> = {
    x64: "x64 (Intel/AMD)",
    arm64: "ARM64 (Apple Silicon/ARM)",
  };
  
  const description = `${osNames[os] ?? os} ${archNames[arch] ?? arch}`;
  
  return { os, arch, runtime, packageSuffix, description };
}

/**
 * Check if the current platform is supported for native extensions
 */
export function isPlatformSupported(platform: PlatformInfo): boolean {
  const suffix = platform.packageSuffix;
  return SUPPORTED_PLATFORMS.includes(suffix as SupportedPlatform);
}

/**
 * Get the sqlite-vec package name for a given platform
 */
export function getSqliteVecPackage(platform: PlatformInfo): string {
  // sqlite-vec uses platform-specific packages: sqlite-vec-{os}-{arch}
  return `sqlite-vec-${platform.packageSuffix}`;
}

/**
 * Get the ONNX runtime package name for a given platform
 * Note: onnxruntime-node works across platforms
 */
export function getOnnxRuntimePackage(_platform: PlatformInfo): string {
  // ONNX runtime uses a single package that includes platform-specific binaries
  return "onnxruntime-node";
}

/**
 * Get all required packages for local embeddings
 */
export function getEmbeddingPackages(platform: PlatformInfo): string[] {
  return [
    getOnnxRuntimePackage(platform),
    "@huggingface/transformers",
  ];
}

/**
 * Get all optional native extension packages for a platform
 */
export function getAllOptionalPackages(platform: PlatformInfo): {
  vectorSearch: string[];
  localEmbeddings: string[];
} {
  return {
    vectorSearch: [getSqliteVecPackage(platform)],
    localEmbeddings: getEmbeddingPackages(platform),
  };
}

/**
 * Format platform info for display
 */
export function formatPlatformInfo(platform: PlatformInfo): string {
  const lines = [
    `OS: ${platform.description}`,
    `Architecture: ${platform.arch}`,
    `Runtime: ${platform.runtime}`,
    `Package suffix: ${platform.packageSuffix}`,
  ];
  
  if (!isPlatformSupported(platform)) {
    lines.push("");
    lines.push("WARNING: This platform may not be fully supported for native extensions.");
  }
  
  return lines.join("\n");
}
