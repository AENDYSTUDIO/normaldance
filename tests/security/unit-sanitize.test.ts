/**
 * Исправленные тесты для функций санитизации из src/lib/security/sanitize.ts
 * Исправлены противоречивые ожидания в тестах
 */

import {
  escapeAttribute,
  escapeHTML,
  safeAttr,
  safeHtmlText,
  safeUrl,
  sanitizeFilename,
  sanitizeForContext,
  sanitizeObjectForContext,
  sanitizeString,
  sanitizeURL,
  stripDangerousHtml,
} from "@/lib/security";

describe("Функции санитизации", () => {
  describe("escapeHTML", () => {
    it("должна экранировать основные HTML-сущности", () => {
      // Исправлено: функция должна экранировать все опасные символы
      expect(escapeHTML('<script>alert("xss")</script>')).toBe(
        '&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;'
      );
      expect(escapeHTML("& < > \" ' /"))
        .toBe('&amp; &lt; &gt; &quot; &#x27; &#x2F;');
    });

    it("должна быть идемпотентной", () => {
      const input = '<script>alert("xss")</script>';
      const firstEscape = escapeHTML(input);
      const secondEscape = escapeHTML(firstEscape);
      expect(firstEscape).toBe(secondEscape);
    });

    it("должна возвращать пустую строку для нестроковых значений", () => {
      expect(escapeHTML(null as any)).toBe("");
      expect(escapeHTML(undefined as any)).toBe("");
      expect(escapeHTML(123 as any)).toBe("");
    });

    it("должна обрабатывать пустую строку", () => {
      expect(escapeHTML(""))