import { describe, expect, it } from 'vitest';
import { NextRequest } from 'next/server';

import { config, middleware } from './middleware';

function createRequest(pathname: string, cookieNames: string[] = []) {
  const headers = new Headers();
  if (cookieNames.length > 0) {
    const cookieHeader = cookieNames.map(name => `${name}=value`).join('; ');
    headers.set('cookie', cookieHeader);
  }
  return new NextRequest(`https://example.com${pathname}`, { headers });
}

describe('middleware auth redirects', () => {
  it('redirects unauthenticated users away from /app routes', () => {
    const request = createRequest('/app/projects');

    const response = middleware(request);

    expect(response.headers.get('location')).toBe('https://example.com/login');
  });

  it('allows authenticated users to stay on /app routes', () => {
    const request = createRequest('/app/dashboard', ['firebase-auth']);

    const response = middleware(request);

    expect(response.headers.get('location')).toBeNull();
  });

  it('sends authenticated visitors from marketing pages to the dashboard', () => {
    const request = createRequest('/pricing', ['firebase-somecookie']);

    const response = middleware(request);

    expect(response.headers.get('location')).toBe('https://example.com/app/dashboard');
  });

  it('leaves marketing pages untouched for anonymous users', () => {
    const request = createRequest('/');

    const response = middleware(request);

    expect(response.headers.get('location')).toBeNull();
  });
});

describe('middleware matcher', () => {
  it('covers marketing and app routes', () => {
    expect(config.matcher).toEqual(['/', '/pricing', '/app/:path*']);
  });
});
