/**
 * Edge-safe logger for middleware and Edge Runtime
 * Does NOT use Winston or any Node.js APIs that are forbidden in Edge Runtime
 */

import { InputSanitizer } from "./input-sanitizer";

export class EdgeSafeLogger {
  static info(message: string, data?: unknown) {
    console.info(
      `[INFO] ${InputSanitizer.sanitizeLog(message)}`,
      data ? InputSanitizer.sanitizeLog(data) : ""
    );
  }

  static error(message: string, error?: Error) {
    console.error(
      `[ERROR] ${InputSanitizer.sanitizeLog(message)}`,
      error?.message ? InputSanitizer.sanitizeLog(error.message) : "",
      error?.stack ? { stack: error.stack } : ""
    );
  }

  static warn(message: string, data?: unknown) {
    console.warn(
      `[WARN] ${InputSanitizer.sanitizeLog(message)}`,
      data ? InputSanitizer.sanitizeLog(data) : ""
    );
  }

  static debug(message: string, data?: unknown) {
    if (process.env.DEBUG) {
      console.debug(
        `[DEBUG] ${InputSanitizer.sanitizeLog(message)}`,
        data ? InputSanitizer.sanitizeLog(data) : ""
      );
    }
  }

  static security(message: string, context?: unknown) {
    console.info(
      `[SECURITY] ${InputSanitizer.sanitizeLog(message)}`,
      context ? InputSanitizer.sanitizeLog(context) : ""
    );
  }
}
