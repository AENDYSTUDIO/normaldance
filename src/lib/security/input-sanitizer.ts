import { z } from "zod";
import { detectSuspiciousPatterns } from "./security-utils";

export class InputSanitizer {
  static sanitizeHtml(input: string): string {
    // В серверной среде используем простую очистку без DOMPurify
    return input
      .replace(/&/g, "&")
      .replace(/</g, "<")
      .replace(/>/g, ">")
      .replace(/"/g, '"')
      .replace(/'/g, "&#x27;")
      .substring(0, 10000);
  }

  static sanitizeLog(input: unknown): string {
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

  static validatePath(path: string): string {
    const schema = z.string().regex(/^[a-zA-Z0-9._/-]+$/);
    const sanitized = path
      .replace(/\.\./g, "")
      .replace(/[^a-zA-Z0-9._/-]/g, "");
    return schema.parse(sanitized);
  }

  static sanitizeCommand(input: string): never {
    throw new Error("Command execution not allowed");
  }

  static sanitizeSQL(input: string): string {
    // Базовая санитизация SQL-запросов
    return input
      .replace(/--/g, "") // комментарии
      .replace(/;/g, "") // точки с запятой
      .replace(/'/g, "''") // экранирование одинарных кавычек
      .replace(/"/g, '"') // экранирование двойных кавычек
      .replace(/\b(OR|AND)\s+1\s*=\s*1\b/gi, "") // попытки SQL-инъекции
      .replace(
        /\b(UNION|SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|CALL)\b/gi,
        ""
      ); // запрещенные команды
  }
}
