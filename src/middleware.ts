import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { logger, metrics } from '@/lib/monitoring';

export function middleware(request: NextRequest) {
  const startTime = Date.now();
  const url = request.nextUrl.pathname;
  
  // Логируем начало запроса
  logger.info('Request started', {
    method: request.method,
    url,
    userAgent: request.headers.get('user-agent'),
    ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip')
  });

  // Создаем ответ
  const response = NextResponse.next();

  // Добавляем заголовок с временем выполнения
  response.headers.set('X-Response-Time', `${Date.now() - startTime}ms`);

  // Для API роутов добавляем дополнительное логирование
  if (url.startsWith('/api/')) {
    response.headers.set('X-API-Request', 'true');
  }

  return response;
}

// Конфигурация middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};