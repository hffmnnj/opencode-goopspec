/**
 * Simple logging utility for GoopSpec
 * @module shared/logger
 */

let DEBUG = process.env.GOOPSPEC_DEBUG === "true";

/**
 * Enable or disable debug logging at runtime
 */
export function setDebug(enabled: boolean): void {
  DEBUG = enabled;
}

/**
 * Log a debug message (only when GOOPSPEC_DEBUG=true or setDebug(true))
 */
export function log(message: string, data?: Record<string, unknown>): void {
  if (DEBUG) {
    const timestamp = new Date().toISOString();
    if (data) {
      console.log(`[GoopSpec ${timestamp}] ${message}`, data);
    } else {
      console.log(`[GoopSpec ${timestamp}] ${message}`);
    }
  }
}

/**
 * Log an error (always)
 */
export function logError(message: string, error?: unknown): void {
  const timestamp = new Date().toISOString();
  console.error(`[GoopSpec ERROR ${timestamp}] ${message}`, error);
}
