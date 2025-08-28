import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const pathname = req.nextUrl.pathname

    // Публичные маршруты
    const publicPaths = ['/auth/signin', '/api/auth', '/']
    const isPublicPath = publicPaths.some(path => 
      pathname.startsWith(path)
    )

    if (isPublicPath) {
      return NextResponse.next()
    }

    // Защищенные маршруты требуют аутентификации
    if (!token) {
      return NextResponse.redirect(new URL('/auth/signin', req.url))
    }

    // Маршруты для артистов
    const artistPaths = ['/upload', '/analytics', '/settings']
    const isArtistPath = artistPaths.some(path => 
      pathname.startsWith(path)
    )

    if (isArtistPath && (token as any).level !== 'ARTIST') {
      return NextResponse.redirect(new URL('/', req.url))
    }

    // Маршруты для кураторов
    const curatorPaths = ['/moderation', '/promotion']
    const isCuratorPath = curatorPaths.some(path => 
      pathname.startsWith(path)
    )

    if (isCuratorPath && !['ARTIST', 'CURATOR', 'ADMIN'].includes((token as any).level)) {
      return NextResponse.redirect(new URL('/', req.url))
    }

    // Маршруты для администраторов
    const adminPaths = ['/admin', '/users', '/settings']
    const isAdminPath = adminPaths.some(path => 
      pathname.startsWith(path)
    )

    if (isAdminPath && (token as any).level !== 'ADMIN') {
      return NextResponse.redirect(new URL('/', req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    }
  }
)

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ]
}