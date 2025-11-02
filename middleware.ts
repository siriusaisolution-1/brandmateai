import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(_request: NextRequest) {
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/',
    '/pricing',
    '/dashboard/:path*',
    '/brands/:path*',
    '/media-library/:path*',
    '/settings/:path*',
    '/content/:path*',
    '/calendar/:path*',
    '/notifications/:path*',
    '/reports/:path*',
    '/admin/:path*',
  ],
}
