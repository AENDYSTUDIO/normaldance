import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import { db } from './db'
import { getServerSession } from './auth'

// Rate limiting with Redis (fallback to memory)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

interface RateLimitOptions {
  limit: number
  windowMs: number
  keyGenerator?: (req: NextRequest) => string
}

interface AuthOptions {
  required?: boolean
  roles?: string[]
  permissions?: string[]
}

interface SecurityOptions {
  rateLimit?: RateLimitOptions
  auth?: AuthOptions
  validation?: z.ZodSchema
  sanitize?: boolean
}

// Rate limiting middleware
export function rateLimit(options: RateLimitOptions) {
  return async (req: NextRequest): Promise<NextResponse | null> => {
    const key = options.keyGenerator ? options.keyGenerator(req) : getClientIP(req)
    const now = Date.now()
    const record = rateLimitMap.get(key)
    
    if (!record || now > record.resetTime) {
      rateLimitMap.set(key, { count: 1, resetTime: now + options.windowMs })
      return null
    }
    
    if (record.count >= options.limit) {
      return NextResponse.json(
        { error: 'Too Many Requests', retryAfter: Math.ceil((record.resetTime - now) / 1000) },
        { status: 429, headers: { 'Retry-After': Math.ceil((record.resetTime - now) / 1000).toString() } }
      )
    }
    
    record.count++
    return null
  }
}

// Authentication middleware
export async function authenticate(req: NextRequest, options: AuthOptions = {}): Promise<{ user: any; error?: NextResponse }> {
  if (!options.required) {
    return { user: null }
  }

  try {
    // Try NextAuth session first
    const session = await getServerSession()
    if (session?.user) {
      return { user: session.user }
    }

    // Fallback to JWT token
    const authHeader = req.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return { 
        error: NextResponse.json({ error: 'Unauthorized - No token provided' }, { status: 401 })
      }
    }

    const token = authHeader.split(' ')[1]
    const JWT_SECRET = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET
    
    if (!JWT_SECRET) {
      console.error('JWT_SECRET not configured')
      return { 
        error: NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
      }
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any
    
    // Get fresh user data from database
    const user = await db.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        username: true,
        walletAddress: true,
        isArtist: true,
        level: true,
        isActive: true,
        role: true
      }
    })

    if (!user || !user.isActive) {
      return { 
        error: NextResponse.json({ error: 'User not found or inactive' }, { status: 401 })
      }
    }

    return { user }
  } catch (error) {
    console.error('Authentication error:', error)
    return { 
      error: NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }
  }
}

// Authorization middleware
export async function authorize(user: any, options: AuthOptions): Promise<NextResponse | null> {
  if (!options.roles && !options.permissions) {
    return null
  }

  if (!user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  }

  // Check roles
  if (options.roles && options.roles.length > 0) {
    const userRole = user.role || user.level || 'USER'
    if (!options.roles.includes(userRole)) {
      return NextResponse.json({ 
        error: 'Insufficient permissions', 
        required: options.roles,
        current: userRole 
      }, { status: 403 })
    }
  }

  // Check permissions (extend as needed)
  if (options.permissions && options.permissions.length > 0) {
    const userPermissions = getUserPermissions(user)
    const hasPermission = options.permissions.every(permission => 
      userPermissions.includes(permission)
    )
    
    if (!hasPermission) {
      return NextResponse.json({ 
        error: 'Missing required permissions', 
        required: options.permissions,
        current: userPermissions 
      }, { status: 403 })
    }
  }

  return null
}

// Input validation middleware
export function validateInput(schema: z.ZodSchema) {
  return async (req: NextRequest): Promise<{ data: any; error?: NextResponse }> => {
    try {
      const body = await req.json()
      const validatedData = schema.parse(body)
      return { data: validatedData }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code
        }))
        
        return {
          error: NextResponse.json({
            error: 'Validation failed',
            details: errors
          }, { status: 400 })
        }
      }
      
      return {
        error: NextResponse.json({
          error: 'Invalid JSON'
        }, { status: 400 })
      }
    }
  }
}

// Input sanitization
export function sanitizeInput(data: any): any {
  if (typeof data === 'string') {
    return data
      .trim()
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
  }
  
  if (Array.isArray(data)) {
    return data.map(sanitizeInput)
  }
  
  if (data && typeof data === 'object') {
    const sanitized: any = {}
    for (const [key, value] of Object.entries(data)) {
      sanitized[key] = sanitizeInput(value)
    }
    return sanitized
  }
  
  return data
}

// Security headers middleware
export function securityHeaders(response: NextResponse): NextResponse {
  // Content Security Policy
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdn.jsdelivr.net; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "font-src 'self' https://fonts.gstatic.com; " +
    "img-src 'self' data: https: blob:; " +
    "media-src 'self' https: blob:; " +
    "connect-src 'self' https: wss: ws:; " +
    "frame-ancestors 'none';"
  )
  
  // Security headers
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()')
  
  // CORS headers for API
  response.headers.set('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGINS || '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  response.headers.set('Access-Control-Max-Age', '86400')
  
  return response
}

// Main security middleware factory
export function createSecureHandler(options: SecurityOptions = {}) {
  return async (req: NextRequest, handler: (req: NextRequest, user?: any, data?: any) => Promise<NextResponse>) => {
    try {
      // Rate limiting
      if (options.rateLimit) {
        const rateLimitResponse = await rateLimit(options.rateLimit)(req)
        if (rateLimitResponse) return rateLimitResponse
      }

      // Authentication
      const { user, error: authError } = await authenticate(req, options.auth)
      if (authError) return authError

      // Authorization
      if (user && options.auth) {
        const authzError = await authorize(user, options.auth)
        if (authzError) return authzError
      }

      // Input validation
      let validatedData = null
      if (options.validation) {
        const { data, error: validationError } = await validateInput(options.validation)(req)
        if (validationError) return validationError
        validatedData = data
      }

      // Input sanitization
      if (options.sanitize && validatedData) {
        validatedData = sanitizeInput(validatedData)
      }

      // Execute handler
      const response = await handler(req, user, validatedData)
      
      // Apply security headers
      return securityHeaders(response)

    } catch (error) {
      console.error('Security middleware error:', error)
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  }
}

// Utility functions
export function getClientIP(req: NextRequest): string {
  return req.ip || 
         req.headers.get('x-forwarded-for')?.split(',')[0] || 
         req.headers.get('x-real-ip') || 
         '127.0.0.1'
}

export function getUserPermissions(user: any): string[] {
  const permissions: string[] = []
  
  if (user.isArtist) permissions.push('CREATE_TRACK', 'MANAGE_TRACKS')
  if (user.level === 'SILVER' || user.level === 'GOLD' || user.level === 'PLATINUM') {
    permissions.push('UPLOAD_LARGE_FILES', 'PRIORITY_SUPPORT')
  }
  if (user.level === 'GOLD' || user.level === 'PLATINUM') {
    permissions.push('ADVANCED_ANALYTICS', 'CUSTOM_BRANDING')
  }
  if (user.level === 'PLATINUM') {
    permissions.push('API_ACCESS', 'WHITELABEL')
  }
  if (user.role === 'ADMIN') {
    permissions.push('ADMIN_ACCESS', 'USER_MANAGEMENT', 'SYSTEM_CONFIG')
  }
  if (user.role === 'MODERATOR') {
    permissions.push('CONTENT_MODERATION', 'USER_REPORTS')
  }
  
  return permissions
}

// Common security configurations
export const securityConfigs = {
  public: {
    rateLimit: { limit: 100, windowMs: 60000 }
  },
  authenticated: {
    rateLimit: { limit: 200, windowMs: 60000 },
    auth: { required: true }
  },
  artist: {
    rateLimit: { limit: 50, windowMs: 60000 },
    auth: { required: true, roles: ['ARTIST', 'SILVER', 'GOLD', 'PLATINUM'] }
  },
  admin: {
    rateLimit: { limit: 1000, windowMs: 60000 },
    auth: { required: true, roles: ['ADMIN'] }
  },
  upload: {
    rateLimit: { limit: 10, windowMs: 60000 },
    auth: { required: true, permissions: ['CREATE_TRACK'] }
  }
}
