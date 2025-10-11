// src/middleware.ts
import { NextRequest, NextResponse } from 'next/server';

// This middleware does nothing but pass the request through.
// It exists to satisfy the Next.js build process.
export function middleware(_request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  // We avoid matching all paths to reduce overhead.
  // Match only a specific, non-critical path for now.
  matcher: '/api/health',
};
