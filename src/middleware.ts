import { NextRequest, NextResponse } from 'next/server'

// Simple in-memory rate limiting (для начала)
const requestCounts = new Map<string, { count: number; resetTime: number }>()

function simpleRateLimit(ip: string, limit = 100, windowMs = 60000): boolean {
  const now = Date.now()
  const record = requestCounts.get(ip)
  
  if (!record || now > record.resetTime) {
    requestCounts.set(ip, { count: 1, resetTime: now + windowMs })
    return true
  }
  
  if (record.count >= limit) {
    return false
  }
  
  record.count++
  return true
}

export async function middleware(request: NextRequest) {
  // Security headers
  const response = NextResponse.next()
  
  // CSP
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; media-src 'self' https: blob:; connect-src 'self' https: wss:;"
  )
  
  // Security headers
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  
  // HTTPS redirect
  if (process.env.NODE_ENV === 'production' && !request.url.startsWith('https://')) {
    return NextResponse.redirect(`https://${request.nextUrl.host}${request.nextUrl.pathname}`)
  }
  
  // Simple rate limiting for API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const ip = request.ip ?? '127.0.0.1'
    
    if (!simpleRateLimit(ip)) {
      return new NextResponse('Too Many Requests', { status: 429 })
    }
  }
  
  return response
}

export const config = {
  matcher: [
    // Exclude API from middleware to avoid interfering with routes during dev
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}