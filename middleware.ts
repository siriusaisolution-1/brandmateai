import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // This is a simplified cookie check. The name can be complex.
  // We check for the presence of ANY Firebase auth cookie as a basic check.
  // Robust auth checks will happen on the client-side with ReactFire.
  const hasAuthCookie = request.cookies.getAll().some(c => c.name.includes('firebase'));

  const url = request.nextUrl.clone();
  
  const isMarketingPath = url.pathname === '/' || url.pathname.startsWith('/pricing');
  const isAppPath = url.pathname.startsWith('/app');

  if (isAppPath && !hasAuthCookie) {
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  if (isMarketingPath && hasAuthCookie) {
    url.pathname = '/app/dashboard';
    return NextResponse.redirect(url);
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/pricing', '/app/:path*'],
}
