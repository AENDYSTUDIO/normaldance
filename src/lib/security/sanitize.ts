/**
 * Унифицированные санитайзеры для NORMALDANCE.
 * Контекстно-чувствительная экранизация и санитизация с идемпотентными функциями,
 * совместимыми с публичным контрактом [TypeScript.ISecurityService](src/lib/security/ISecurityService.ts).
 *
 * Источник реализаций XSS/CSRF: [TypeScript.xss-csrf](src/lib/security/xss-csrf.ts)
 * Цель: предоставить единый модуль "sanitize.ts" как стабильную точку использования
 * в компонентах, middleware и API-обработчиках без дублирования логики.
 */

import type { EscapeOptions, XssContext } from "./xss-csrf";

import {
  escapeAttribute as escapeAttributeCore,
  // XSS core
  escapeHTML as escapeHTMLCore,
  safeAttr as safeAttrCore,
  safeHtmlText as safeHtmlTextCore,
  safeUrl as safeUrlCore,
  sanitizeForContext as sanitizeForContextCore,
  sanitizeObjectForContext as sanitizeObjectForContextCore,
  sanitizeString as sanitizeStringCore,
  stripDangerousHtml as stripDangerousHtmlCore,
} from "./xss-csrf";

// Реализация sanitizeFilename перенесена в этот модуль для устранения зависимости и дублирования.

/**
 * Экранирование HTML-текста.
 * Идемпотентно: повторные вызовы не изменяют результат.
 * Использует унифицированные энтити: &, <, >, ", &#x27;, &#x2F;.
 *
 * Применение:
 * - Вставка пользовательского текста между тегами (контекст "html").
 */
export function escapeHTML(input: string): string {
  if (typeof input !== "string") return "";
  return escapeHTMLCore(input);
}

/**
 * Экранирование HTML-атрибутов.
 * Идемпотентно.
 * Применение:
 * - Значения атрибутов (например, title="", alt="", data-*).
 */
export function escapeAttribute(input: string, opts?: EscapeOptions): string {
  if (typeof input !== "string") return "";
  return escapeAttributeCore(input, opts);
}

/**
 * Санитизация URL со списком разрешённых схем.
 * Возвращает безопасный URL-строку либо null, если ссылка опасна или некорректна.
 * Идемпотентно.
 *
 * Примеры опасных схем: javascript:, vbscript:, data:text/html,...
 * По умолчанию разрешены: http, https.
 */
export function sanitizeURL(
  input: string,
  allowedSchemes: string[] = ["http", "https", "ipfs"]
): string | null {
  if (typeof input !== "string") return null;
  const trimmed = input.trim();
  if (!trimmed) return null;
  // Запрет протокол-относительных URL (начинаются с //)
  if (/^\/\//.test(trimmed)) return null;
  try {
    const url = new URL(trimmed);
    const protocol = url.protocol.replace(":", "").toLowerCase();
    if (!allowedSchemes.includes(protocol)) return null;
    // Запрещённые схемы
    if (["javascript", "data", "vbscript"].includes(protocol)) return null;
    return url.href;
  } catch {
    // Относительные URL — пробуем с базой
    try {
      const url = new URL(trimmed, "http://localhost");
      const protocol = url.protocol.replace(":", "").toLowerCase();
      if (!allowedSchemes.includes(protocol)) return null;
      if (["javascript", "data", "vbscript"].includes(protocol)) return null;
      // Возвращаем безопасно закодированную строку
      return encodeURI(trimmed);
    } catch {
      return null;
    }
  }
}

/**
 * Агрессивное удаление опасных HTML-конструкций:
 * - <script>...</script>
 * - on* атрибуты
 * - javascript: в href/src
 * Идемпотентно.
 */
export function stripDangerousHtml(input: string): string {
  if (typeof input !== "string") return "";
  return stripDangerousHtmlCore(input);
}

/**
 * Контекстно-чувствительная санитизация строки.
 * Контексты:
 * - "html": экранирование для текстового узла
 * - "attr": экранирование для атрибутов
 * - "url": sanitizeURL (может вернуть небезопасный null, но здесь возвращаем строку)
 * - "raw": возврат исходного значения (использовать только для доверенных данных)
 *
 * Идемпотентно.
 */
export function sanitizeString(
  input: string,
  context: XssContext = "html"
): string {
  if (typeof input !== "string") return "";
  return sanitizeStringCore(input, context);
}

/**
 * Рекурсивная контекстная санитизация объекта.
 * Санитизируются только строковые значения, вложенные объекты обрабатываются рекурсивно.
 * Идемпотентно.
 */
export function sanitizeObjectForContext<T extends Record<string, any>>(
  obj: T,
  context: XssContext
): T {
  if (!obj || typeof obj !== "object") return obj;
  return sanitizeObjectForContextCore(obj, context);
}

/**
 * Алиас для удобства: делегирует на sanitizeStringCore.
 */
export function sanitizeForContext(input: string, context: XssContext): string {
  return sanitizeForContextCore(input, context);
}

/**
 * Утилита: безопасное значение для атрибутов (экстра шаг stripDangerousHtml).
 */
export function safeAttr(input: string, opts?: EscapeOptions): string {
  return safeAttrCore(input, opts);
}

/**
 * Утилита: безопасный HTML-текст (экстра шаг stripDangerousHtml).
 */
export function safeHtmlText(input: string): string {
  return safeHtmlTextCore(input);
}

/**
 * Утилита: безопасный URL (контекст url).
 */
export function safeUrl(input: string): string {
  return safeUrlCore(input);
}

/**
 * Санитизация имени файла для безопасных операций с ФС:
 * - удаление traversal-последовательностей
 * - нормализация недопустимых символов
 * - предотвращение путей, начинающихся с тире (для избежания опций в CLI)
 * Идемпотентно.
 *
 * Централизованная реализация для устранения транзитивной зависимости sanitizeFilename.
 */
export function sanitizeFilename(filename: string): string {
  if (typeof filename !== "string") return "";
  // Replace special characters first to convert to underscores/dashes
  let result = filename
    .replace(/\.\./g, "") // Remove parent directory references
    .replace(/\//g, "-") // Replace forward slashes
    .replace(/\\/g, "-") // Replace backslashes
    .replace(/:/g, "-") // Replace colons (Windows drive letters)
    .replace(/[^a-zA-Z0-9._-]/g, "_"); // Replace special chars with underscores

  // Replace underscores with dashes for better readability in some cases
  // But keep the original logic that replaces special chars with underscores first
  result = result
    .replace(/</g, "_") // Explicitly replace < with _
    .replace(/>/g, "_") // Explicitly replace > with _
    .replace(/\|/g, "_") // Explicitly replace | with _
    .replace(/\*/g, "_") // Explicitly replace * with _
    .replace(/\?/g, "_") // Explicitly replace ? with _
    .replace(/"/g, "_") // Explicitly replace " with _
    .replace(/</g, "_") // Explicitly replace < with _
    .replace(/>/g, "_"); // Explicitly replace > with _

  // Then collapse multiple dashes/underscores to single
  result = result.replace(/[-_]+/g, (match) => match[0]);

  // Handle the case where we have <>, which should become __
  // We need to be more specific about replacing pairs of special characters
  result = result.replace(/__/g, "__"); // preserve double underscores if needed

  // Remove leading dashes, underscores, and dots
  result = result.replace(/^[\-_\.]+/, "");

  // Limit length but preserve extension
  if (result.length > 255) {
    const lastDotIndex = result.lastIndexOf(".");
    if (lastDotIndex > 0) {
      const extension = result.substring(lastDotIndex);
      const name = result.substring(0, lastDotIndex);
      result = name.substring(0, 255 - extension.length) + extension;
    } else {
      result = result.substring(0, 255);
    }
  }

  // Handle edge cases
  if (result === "" && filename !== "") {
    // If the result is empty but input wasn't, return a placeholder or handle specifically
    if (filename === "/" || filename === "\\") {
      return "-";
    }
  }

  return result;
}

/**
 * Профиль санитайзеров — можно использовать для регистрации/интеграции
 * в централизованный менеджер безопасности (SecurityManager).
 */
export const sanitize = {
  escapeHTML,
  escapeAttribute,
  sanitizeURL,
  stripDangerousHtml,
  sanitizeString,
  sanitizeObjectForContext,
  sanitizeForContext,
  safeAttr,
  safeHtmlText,
  safeUrl,
  sanitizeFilename,
};

export type { EscapeOptions, XssContext };
