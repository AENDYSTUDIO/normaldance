/**
 * Edge-safe logger for middleware and Edge Runtime
 * Does NOT use Winston or any Node.js APIs that are forbidden in Edge Runtime
 */

import { sanitizeLog } from "./log-sanitizer";

export class EdgeSafeLogger {
  static info(message: string, data?: unknown) {
    console.info(
      `[INFO] ${sanitizeLog(message)}`,
      data ? sanitizeLog(data) : ""
    );
  }

  static error(message: string, error?: Error) {
    console.error(
      `[ERROR] ${sanitizeLog(message)}`,
      error?.message ? sanitizeLog(error.message) : "",
      error?.stack ? { stack: error.stack } : ""
    );
  }

  static warn(message: string, data?: unknown) {
    console.warn(
      `[WARN] ${sanitizeLog(message)}`,
      data ? sanitizeLog(data) : ""
    );
  }

  static debug(message: string, data?: unknown) {
    console.debug(
      `[DEBUG] ${sanitizeLog(message)}`,
      data ? sanitizeLog(data) : ""
    );
  }

  static log(message: string, context?: string) {
    console.log(
      `[SECURITY] ${sanitizeLog(message)}`,
      context ? sanitizeLog(context) : ""
    );
  }
}
