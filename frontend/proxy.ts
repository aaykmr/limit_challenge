import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_PATHS = ['/', '/login', '/_next', '/favicon.ico'];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isPublic = PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(path));

  if (isPublic) {
    return NextResponse.next();
  }

  const hasSessionCookie = Boolean(request.cookies.get('sessionid')?.value);
  console.log('cookie', request.cookies.get('sessionid')?.value, hasSessionCookie);
  if (!hasSessionCookie) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/submissions/:path*'],
};
