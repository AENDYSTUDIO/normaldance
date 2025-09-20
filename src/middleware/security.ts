import { NextRequest, NextResponse } from 'next/server'
import { sanitizeString, validateId, validateEmail, validateSolanaAddress } from '@/lib/sanitizer'

// Rate limiting store (в продакшене использовать Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

// Конфигурация rate limiting
const RATE_LIMIT_CONFIG = {
  windowMs: 15 * 60 * 1000, // 15 минут
  maxRequests: 100, // максимум 100 запросов за окно
  maxAuthRequests: 10, // максимум 10 auth запросов за окно
}

// Блокированные IP адреса
const BLOCKED_IPS = new Set<string>([
  // Добавьте подозрительные IP адреса
])

// Подозрительные User-Agent строки
const SUSPICIOUS_USER_AGENTS = [
  /bot/i,
  /crawler/i,
  /spider/i,
  /scraper/i,
  /curl/i,
  /wget/i,
  /python/i,
  /php/i,
]

/**
 * Middleware для проверки rate limiting
 */
export function checkRateLimit(
  request: NextRequest,
  isAuthEndpoint: boolean = false
): { allowed: boolean; remaining: number; resetTime: number } {
  const ip = getClientIP(request)
  const key = `${ip}:${isAuthEndpoint ? 'auth' : 'general'}`
  const now = Date.now()
  const windowMs = RATE_LIMIT_CONFIG.windowMs
  const maxRequests = isAuthEndpoint 
    ? RATE_LIMIT_CONFIG.maxAuthRequests 
    : RATE_LIMIT_CONFIG.maxRequests

  const current = rateLimitStore.get(key)
  
  if (!current || now > current.resetTime) {
    // Создаем новое окно
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + windowMs
    })
    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetTime: now + windowMs
    }
  }

  if (current.count >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: current.resetTime
    }
  }

  // Увеличиваем счетчик
  current.count++
  rateLimitStore.set(key, current)

  return {
    allowed: true,
    remaining: maxRequests - current.count,
    resetTime: current.resetTime
  }
}

/**
 * Получение IP адреса клиента
 */
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  const cfConnectingIP = request.headers.get('cf-connecting-ip')
  
  if (cfConnectingIP) return cfConnectingIP
  if (realIP) return realIP
  if (forwarded) return forwarded.split(',')[0].trim()
  
  return 'unknown'
}

/**
 * Проверка на подозрительную активность
 */
function isSuspiciousRequest(request: NextRequest): boolean {
  const userAgent = request.headers.get('user-agent') || ''
  const ip = getClientIP(request)
  
  // Проверяем заблокированные IP
  if (BLOCKED_IPS.has(ip)) {
    return true
  }
  
  // Проверяем подозрительные User-Agent
  if (SUSPICIOUS_USER_AGENTS.some(pattern => pattern.test(userAgent))) {
    return true
  }
  
  // Проверяем на подозрительные заголовки
  const suspiciousHeaders = [
    'x-forwarded-host',
    'x-originating-ip',
    'x-remote-ip',
    'x-remote-addr'
  ]
  
  for (const header of suspiciousHeaders) {
    if (request.headers.get(header)) {
      return true
    }
  }
  
  return false
}

/**
 * Валидация и санитизация параметров запроса
 */
export function validateRequestParams(params: Record<string, any>): {
  isValid: boolean
  sanitizedParams: Record<string, any>
  errors: string[]
} {
  const errors: string[] = []
  const sanitizedParams: Record<string, any> = {}
  
  for (const [key, value] of Object.entries(params)) {
    if (typeof value === 'string') {
      // Санитизируем строковые значения
      const sanitized = sanitizeString(value)
      
      // Валидируем в зависимости от типа параметра
      if (key.includes('id') || key.includes('Id')) {
        if (!validateId(sanitized)) {
          errors.push(`Invalid ${key} format`)
          continue
        }
      } else if (key.includes('email')) {
        if (!validateEmail(sanitized)) {
          errors.push(`Invalid ${key} format`)
          continue
        }
      } else if (key.includes('wallet') || key.includes('address')) {
        if (!validateSolanaAddress(sanitized)) {
          errors.push(`Invalid ${key} format`)
          continue
        }
      }
      
      sanitizedParams[key] = sanitized
    } else if (typeof value === 'number') {
      // Валидируем числовые значения
      if (isNaN(value) || !isFinite(value)) {
        errors.push(`Invalid ${key} value`)
        continue
      }
      sanitizedParams[key] = value
    } else if (typeof value === 'boolean') {
      sanitizedParams[key] = value
    } else if (Array.isArray(value)) {
      // Валидируем массивы
      const sanitizedArray = value
        .filter(item => typeof item === 'string')
        .map(item => sanitizeString(item))
        .filter(item => item.length > 0)
      
      sanitizedParams[key] = sanitizedArray
    } else {
      sanitizedParams[key] = value
    }
  }
  
  return {
    isValid: errors.length === 0,
    sanitizedParams,
    errors
  }
}

/**
 * Основной middleware безопасности
 */
export function securityMiddleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Проверяем на подозрительную активность
  if (isSuspiciousRequest(request)) {
    console.warn(`Suspicious request blocked: ${getClientIP(request)} - ${request.headers.get('user-agent')}`)
    return NextResponse.json(
      { error: 'Access denied' },
      { status: 403 }
    )
  }
  
  // Проверяем rate limiting
  const isAuthEndpoint = pathname.includes('/auth/') || pathname.includes('/api/auth/')
  const rateLimit = checkRateLimit(request, isAuthEndpoint)
  
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { 
        error: 'Too many requests',
        retryAfter: Math.ceil((rateLimit.resetTime - Date.now()) / 1000)
      },
      { 
        status: 429,
        headers: {
          'Retry-After': Math.ceil((rateLimit.resetTime - Date.now()) / 1000).toString(),
          'X-RateLimit-Limit': isAuthEndpoint 
            ? RATE_LIMIT_CONFIG.maxAuthRequests.toString()
            : RATE_LIMIT_CONFIG.maxRequests.toString(),
          'X-RateLimit-Remaining': rateLimit.remaining.toString(),
          'X-RateLimit-Reset': rateLimit.resetTime.toString()
        }
      }
    )
  }
  
  // Добавляем заголовки безопасности
  const response = NextResponse.next()
  
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  
  // Добавляем заголовки rate limiting
  response.headers.set('X-RateLimit-Limit', isAuthEndpoint 
    ? RATE_LIMIT_CONFIG.maxAuthRequests.toString()
    : RATE_LIMIT_CONFIG.maxRequests.toString())
  response.headers.set('X-RateLimit-Remaining', rateLimit.remaining.toString())
  response.headers.set('X-RateLimit-Reset', rateLimit.resetTime.toString())
  
  return response
}

/**
 * Middleware для валидации API запросов
 */
export function apiValidationMiddleware(request: NextRequest) {
  const { searchParams } = request.nextUrl
  
  // Валидируем query параметры
  const queryParams: Record<string, any> = {}
  for (const [key, value] of searchParams.entries()) {
    queryParams[key] = value
  }
  
  const validation = validateRequestParams(queryParams)
  
  if (!validation.isValid) {
    return NextResponse.json(
      { 
        error: 'Invalid request parameters',
        details: validation.errors
      },
      { status: 400 }
    )
  }
  
  // Добавляем санитизированные параметры в request
  request.nextUrl.search = new URLSearchParams(validation.sanitizedParams).toString()
  
  return NextResponse.next()
}

/**
 * Очистка старых записей rate limiting
 */
export function cleanupRateLimit() {
  const now = Date.now()
  for (const [key, value] of rateLimitStore.entries()) {
    if (now > value.resetTime) {
      rateLimitStore.delete(key)
    }
  }
}

// Очистка каждые 5 минут
setInterval(cleanupRateLimit, 5 * 60 * 1000)

export default securityMiddleware
