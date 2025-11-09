import { describe, expect, it } from 'vitest';
import { NextRequest } from 'next/server';

import { config, middleware, PUBLIC_PATHS } from './middleware';

function createRequest(pathname: string, cookieNames: string[] = []) {
  const headers = new Headers();
  if (cookieNames.length > 0) {
    const cookieHeader = cookieNames.map(name => `${name}=value`).join('; ');
    headers.set('cookie', cookieHeader);
  }
  return new NextRequest(`https://example.com${pathname}`, { headers });
}

describe('middleware routing', () => {
  it('does not redirect app routes', () => {
    const request = createRequest('/dashboard');

    const response = middleware(request);

    expect(response.headers.get('location')).toBeNull();
  });

  it('does not redirect marketing routes', () => {
    const request = createRequest('/pricing', ['firebase-auth']);

    const response = middleware(request);

    expect(response.headers.get('location')).toBeNull();
  });

  it('does not redirect app pricing route', () => {
    const request = createRequest('/app/pricing', ['firebase-auth']);

    const response = middleware(request);

    expect(response.headers.get('location')).toBeNull();
  });
});

describe('middleware configuration', () => {
  it('defines public paths including marketing pricing', () => {
    expect(PUBLIC_PATHS).toEqual([
      /^\/$/,
      /^\/features(\/|$)/,
      /^\/login(\/|$)/,
      /^\/register(\/|$)/,
      /^\/pricing(\/|$)/,
      /^\/health$/,
      /^\/api\/diag$/,
    ]);
  });

  it('covers marketing and app routes', () => {
    expect(config.matcher).toEqual([
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
      '/admin/:path*',
    ]);
  });
});
