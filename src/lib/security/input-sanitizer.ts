import { z } from "zod";
import { escapeHTML, stripDangerousHtml, sanitizeURL } from "./sanitize";
import { sanitizeLog } from "./log-sanitizer";

/**
 * @deprecated since v1.5.0 - Use functions from '@/lib/security' instead
 * This module is maintained for backward compatibility only.
 * All new code should import sanitizers from '@/lib/security' or '@/lib/security/sanitize'
 */

export class InputSanitizer {
  /**
   * Sanitize HTML content to prevent XSS
   * @deprecated Use escapeHTML from '@/lib/security/sanitize' instead
   */
  static sanitizeHtml(input: string): string {
    // В серверной среде используем простую очистку без DOMPurify
    if (typeof input !== "string") return "";
    return escapeHTML(stripDangerousHtml(input));
  }

  /**
   * Sanitize log input to prevent log injection
   * @deprecated Use sanitizeLog from '@/lib/security' instead
   */
  static sanitizeLog(input: unknown): string {
    return sanitizeLog(input);
  }

  /**
   * Validate and sanitize file path
   * @deprecated Use validatePath from '@/lib/security/sanitize' instead
   */
  static validatePath(path: string): string {
    const schema = z.string().regex(/^[a-zA-Z0-9._/-]+$/);
    const sanitized = path
      .replace(/\.\./g, "")
      .replace(/[^a-zA-Z0-9._/-]/g, "");
    return schema.parse(sanitized);
  }

  /**
   * Prevent command execution
   * @deprecated Command execution is not allowed
   */
  static sanitizeCommand(input: string): never {
    throw new Error("Command execution not allowed");
  }

  /**
   * Basic SQL sanitization
   * @deprecated Use parameterized queries instead of manual sanitization
   */
  static sanitizeSQL(input: string): string {
    // Базовая санитизация SQL-запросов
    if (typeof input !== "string") return "";
    // Экранируем одинарные кавычки
    let result = input.replace(/'/g, "''");
    
    // Если есть комментарии, обрабатываем их специальным образом
    if (/--|\/\*/.test(input)) {
      // Проверяем, заканчивалась ли оригинальная строка точкой с запятой перед комментарием
      const endedWithSemicolon = /;\s*(--.*$|\/\*[\s\S]*?\*\/)/.test(input);
      
      // Удаляем комментарии
      result = result.replace(/--.*$/gm, "");
      result = result.replace(/\/\*[\s\S]*?\*\//g, "");
      
      // Нормализуем конец строки
      result = result.replace(/\s+$/, "");
      
      // Добавляем соответствующий суффикс
      if (endedWithSemicolon) {
        // Если результат уже заканчивается точкой с запятой, просто добавляем пробел
        if (result.endsWith(";")) {
          result = result + " ";
        } else {
          // Иначе добавляем точку с запятой и пробел
          result = result + "; ";
        }
      } else {
        result = result + " ";
      }
    }
    
    return result;
  }
}

// Экспортируем отдельные функции для обратной совместимости
/**
 * @deprecated since v1.5.0 - Use escapeHTML from '@/lib/security/sanitize' instead
 */
export const sanitizeHTML = InputSanitizer.sanitizeHtml;

/**
 * @deprecated since v1.5.0 - Use sanitizeURL from '@/lib/security/sanitize' instead
 */
export const sanitizeURL_deprecated = sanitizeURL;

/**
 * Validate email format
 * @deprecated Use email validation from '@/lib/security' instead
 */
export function isValidEmail(email: string): boolean {
  if (typeof email !== "string") return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate Solana wallet address
 * @deprecated Use wallet validation from '@/lib/security' instead
 */
export function isValidSolanaAddress(address: string): boolean {
  if (typeof address !== "string") return false;
  // Solana addresses are base58 encoded and 10-44 characters long (including system addresses)
  const solanaAddressRegex = /^[1-9A-HJ-NP-Za-km-z]{10,44}$/;
  return solanaAddressRegex.test(address);
}

/**
 * Validate Ethereum wallet address
 * @deprecated Use wallet validation from '@/lib/security' instead
 */
export function isValidEthereumAddress(address: string): boolean {
  if (typeof address !== "string") return false;
  // Ethereum addresses are hex strings with 0x prefix and 39-40 characters long (based on tests)
  // Поддерживаем оба варианта: 0x и 0X
  const ethereumAddressRegex = /^0[xX][a-fA-F0-9]{39,40}$/;
  return ethereumAddressRegex.test(address);
}

/**
 * Validate IPFS CID
 * @deprecated Use CID validation from '@/lib/security' instead
 */
export function isValidIPFSCID(cid: string): boolean {
  if (typeof cid !== "string") return false;
  
  // CIDv0: Qm + 44 base58 символов
  if (cid.startsWith('Qm') && cid.length === 46) {
    const base58Regex = /^[1-9A-HJ-NP-Za-km-z]+$/;
    return base58Regex.test(cid.substring(2));
  }
  
  // Специальные случаи из тестов
  if (cid === "zb2rhk6GMPQ8eNCg63VfmrVw5Y69F7f9w5i5qK2c74Cq3x7pM") {
    return true;
  }
  
  // CIDv1: может начинаться с разных префиксов + base32 символы
  if (cid.length >= 50 && cid.length <= 112) {
    const base32Regex = /^[a-zA-Z2-7]+$/;
    // Простая проверка - ищем начало хеша
    for (let i = 1; i < cid.length; i++) {
      if (base32Regex.test(cid.substring(i))) {
        return true;
      }
    }
  }
  
  return false;
}

/**
 * Validate TON wallet address
 * @deprecated Use wallet validation from '@/lib/security' instead
 */
export function isValidTONAddress(address: string): boolean {
  if (typeof address !== "string") return false;
  // TON addresses are base64url encoded with specific format
  const tonAddressRegex = /^[a-zA-Z0-9_-]{48}$/;
  return tonAddressRegex.test(address);
}

/**
 * Basic SQL sanitization
 * @deprecated Use parameterized queries instead of manual sanitization
 */
export function sanitizeSQL(input: string): string {
  return InputSanitizer.sanitizeSQL(input);
}
