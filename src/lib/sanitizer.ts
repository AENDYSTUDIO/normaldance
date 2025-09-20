/**
 * 🛡️ Security Sanitization Utilities
 * 
 * Утилиты для безопасной обработки пользовательского ввода
 */

import { basename } from 'path'

/**
 * Санитизация строк от XSS и инъекций
 */
export function sanitizeString(input: string): string {
  if (!input || typeof input !== 'string') return ''
  
  return input
    // Удаляем HTML теги и опасные символы
    .replace(/<[^>]*>/g, '')
    .replace(/[<>\"'&]/g, '')
    // Удаляем JavaScript события
    .replace(/on\w+\s*=/gi, '')
    // Удаляем data: URLs
    .replace(/data:[^;]*;base64,/gi, '')
    // Удаляем javascript: URLs
    .replace(/javascript:/gi, '')
    // Удаляем vbscript: URLs
    .replace(/vbscript:/gi, '')
    // Удаляем переносы строк
    .replace(/[\r\n\t]/g, ' ')
    // Удаляем множественные пробелы
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 1000) // Ограничиваем длину
}

/**
 * Строгая санитизация для критических полей
 */
export function strictSanitizeString(input: string): string {
  if (!input || typeof input !== 'string') return ''
  
  return input
    // Разрешаем только буквы, цифры, пробелы и основные знаки препинания
    .replace(/[^a-zA-Z0-9\s.,!?()-]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 500)
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

/**
 * Валидация и санитизация URL
 */
export function validateAndSanitizeUrl(url: string): string | null {
  if (!url || typeof url !== 'string') return null
  
  try {
    const urlObj = new URL(url)
    
    // Разрешаем только безопасные протоколы
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return null
    }
    
    // Проверяем на подозрительные домены
    const suspiciousDomains = ['localhost', '127.0.0.1', '0.0.0.0']
    if (suspiciousDomains.includes(urlObj.hostname)) {
      return null
    }
    
    return urlObj.toString()
  } catch {
    return null
  }
}

/**
 * Валидация email адреса
 */
export function validateEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false
  
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  return emailRegex.test(email) && email.length <= 254
}

/**
 * Валидация Solana адреса
 */
export function validateSolanaAddress(address: string): boolean {
  if (!address || typeof address !== 'string') return false
  
  // Solana адреса имеют длину 32-44 символа и содержат только Base58 символы
  const solanaRegex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/
  return solanaRegex.test(address)
}

/**
 * Валидация размера файла
 */
export function validateFileSize(size: number, maxSize: number = 100 * 1024 * 1024): boolean {
  return typeof size === 'number' && size > 0 && size <= maxSize
}

/**
 * Валидация MIME типа
 */
export function validateMimeType(mimeType: string, allowedTypes: string[] = [
  'audio/mpeg',
  'audio/wav',
  'audio/flac',
  'audio/ogg',
  'image/jpeg',
  'image/png',
  'image/webp'
]): boolean {
  if (!mimeType || typeof mimeType !== 'string') return false
  return allowedTypes.includes(mimeType)
}

/**
 * Защита от SQL инъекций (для строковых параметров)
 */
export function escapeSqlString(input: string): string {
  if (!input || typeof input !== 'string') return ''
  
  return input
    .replace(/'/g, "''")  // Экранируем одинарные кавычки
    .replace(/--/g, '')   // Удаляем SQL комментарии
    .replace(/\/\*/g, '') // Удаляем начало блочных комментариев
    .replace(/\*\//g, '') // Удаляем конец блочных комментариев
    .replace(/;/g, '')    // Удаляем точки с запятой
}

/**
 * Валидация JSON строки
 */
export function validateJsonString(jsonString: string): boolean {
  if (!jsonString || typeof jsonString !== 'string') return false
  
  try {
    JSON.parse(jsonString)
    return true
  } catch {
    return false
  }
}

/**
 * Безопасная обработка пользовательского ввода
 */
export function processUserInput(input: any, options: {
  maxLength?: number
  allowHtml?: boolean
  strictMode?: boolean
} = {}): string {
  const { maxLength = 1000, allowHtml = false, strictMode = false } = options
  
  if (!input || typeof input !== 'string') return ''
  
  let processed = input
  
  if (strictMode) {
    processed = strictSanitizeString(processed)
  } else if (!allowHtml) {
    processed = sanitizeString(processed)
  }
  
  if (maxLength && processed.length > maxLength) {
    processed = processed.slice(0, maxLength)
  }
  
  return processed
}