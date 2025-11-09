/**
 * Упрощенный тест для log-sanitizer в NORMALDANCE.
 * Проверяет санитизацию логов для предотвращения log injection.
 */

import { sanitizeLog } from "@/lib/security";

describe("log-sanitizer-simple", () => {
  describe("sanitizeLog", () => {
    it("должна санитизировать строковые значения", () => {
      expect(sanitizeLog("normal text")).toBe("normal text");
      expect(sanitizeLog("text with newline\n")).toBe("text with newline_");
      expect(sanitizeLog("text with carriage return\r")).toBe("text with carriage return_");
      expect(sanitizeLog("text with tab\t")).toBe("text with tab_");
    });

    it("должна ограничивать длину строки", () => {
      const longString = "a".repeat(1500);
      const sanitized = sanitizeLog(longString);
      expect(sanitized.length).toBe(1000);
    });

    it("должна обрабатывать нестроковые значения", () => {
      expect(sanitizeLog(123)).toBe("123");
      expect(sanitizeLog(true)).toBe("true");
      expect(sanitizeLog(null)).toBe("null");
      expect(sanitizeLog(undefined)).toBe("undefined");
    });
  });
});