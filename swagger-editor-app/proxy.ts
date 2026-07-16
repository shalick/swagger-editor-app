import { NextRequest, NextResponse } from 'next/server';

const PROTECTED_PATHS = ['/history', '/history/'];
const AUTH_COOKIE_NAME = 'swagger-auth-token';

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  const isProtected = PROTECTED_PATHS.some((p) => pathname === p || pathname.startsWith(p));
  if (!isProtected) return NextResponse.next();

  const token = request.cookies.get(AUTH_COOKIE_NAME);
  if (!token) {
    const url = request.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/history/:path*'],
};
