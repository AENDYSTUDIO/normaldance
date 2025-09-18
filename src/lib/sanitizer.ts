/**
 * 🛡️ Security Sanitization Utilities
 * 
 * Утилиты для безопасной обработки пользовательского ввода
 */

import { basename } from 'path'

/**
 * Санитизация строк от XSS
 */
export function sanitizeString(input: string): string {
  if (!input || typeof input !== 'string') return ''
  
  return input
    .replace(/[<>\"'&]/g, '')
    .replace(/[\r\n]/g, ' ')
    .trim()
    .slice(0, 1000) // Ограничиваем длину
}

/**
 * Санитизация для логирования
 */
export function sanitizeForLog(input: any): string {
  if (input === null || input === undefined) return 'null'
  
  return String(input)
    .replace(/[\r\n]/g, ' ')
    .replace(/[<>\"'&]/g, '')
    .slice(0, 200)
}

/**
 * Безопасная валидация пути файла
 */
export function validateFilePath(filePath: string): boolean {
  if (!filePath || typeof filePath !== 'string') return false
  
  // Проверяем на path traversal
  if (filePath.includes('..') || filePath.includes('/') || filePath.includes('\\')) {
    return false
  }
  
  // Проверяем на допустимые символы
  if (!/^[a-zA-Z0-9._-]+$/.test(filePath)) {
    return false
  }
  
  return true
}

/**
 * Безопасное извлечение имени файла
 */
export function safeBasename(filePath: string): string {
  const safePath = basename(filePath)
  return validateFilePath(safePath) ? safePath : ''
}

/**
 * Валидация IPFS хеша
 */
export function validateIPFSHash(hash: string): boolean {
  if (!hash || typeof hash !== 'string') return false
  return /^[a-zA-Z0-9]{46}$/.test(hash)
}

/**
 * Валидация ID
 */
export function validateId(id: string): boolean {
  if (!id || typeof id !== 'string') return false
  return /^[a-zA-Z0-9-_]+$/.test(id) && id.length <= 50
}

/**
 * Санитизация объекта для JSON ответа
 */
export function sanitizeObject(obj: any): any {
  if (!obj || typeof obj !== 'object') return obj
  
  const sanitized: any = {}
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeString(value)
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value)
    } else {
      sanitized[key] = value
    }
  }
  
  return sanitized
}