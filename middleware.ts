import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const PUBLIC_PATHS = [
  /^\/$/,
  /^\/features(\/|$)/,
  /^\/login(\/|$)/,
  /^\/register(\/|$)/,
  /^\/pricing(\/|$)/,
  /^\/health$/,
  /^\/api\/diag$/,
] as const;

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isPublicPath = PUBLIC_PATHS.some((regex) => regex.test(pathname));

  if (!isPublicPath) {
    // Protected route handling would go here once auth gating is enabled.
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/pricing',
    '/app/pricing',
    '/dashboard/:path*',
    '/brands/:path*',
    '/media-library/:path*',
    '/settings/:path*',
    '/content/:path*',
    '/calendar/:path*',
    '/notifications/:path*',
    '/reports/:path*',
    '/billing/:path*',
    '/admin/:path*',
  ],
};
