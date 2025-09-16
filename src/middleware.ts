import { NextResponse } from 'next/server';

export function middleware(req: Request) {
  // убираем редирект, пусть / отдаёт landing
  return NextResponse.next();
}

export const config = { matcher: '/' };