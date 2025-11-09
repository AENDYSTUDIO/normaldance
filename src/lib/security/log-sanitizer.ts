import { detectSuspiciousPatterns } from "./security-utils";

/**
 * Sanitize log input to prevent log injection attacks
 * Removes potentially dangerous characters and patterns from log entries
 */
export function sanitizeLog(input: unknown): string {
  if (typeof input === "string") {
    // Удаляем потенциально опасные символы и паттерны
    const sanitized = input.replace(/[\r\n\t]/g, "_").substring(0, 1000);

    // Проверяем на подозрительные паттерны и предупреждаем
    const suspicious = detectSuspiciousPatterns(sanitized);
    if (suspicious.length > 0) {
      console.warn(
        `[Security] Suspicious patterns detected in log: ${suspicious.join(
          ", "
        )}`
      );
    }

    return sanitized;
  }
  const stringInput = String(input)
    .replace(/[\r\n\t]/g, "_")
    .substring(0, 1000);

  // Проверяем на подозрительные паттерны и предупреждаем
  const suspicious = detectSuspiciousPatterns(stringInput);
  if (suspicious.length > 0) {
    console.warn(
      `[Security] Suspicious patterns detected in log: ${suspicious.join(
        ", "
      )}`
    );
  }

  return stringInput;
}