import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createNextRouteHandler } from '../../../../../tests/utils/create-next-route-handler';
import { withTestAuth } from '../../../../../tests/utils/test-auth';
import { POST } from './route';

const rateLimitState = vi.hoisted(() => {
  const limiter = {
    attempt: vi.fn(async () => ({
      ok: true,
      limit: 60,
      remaining: 59,
      retryAfterSeconds: 60,
      resetAt: new Date(Date.now() + 60_000),
    })),
  };

  return {
    limiter,
    getMediaRateLimiter: vi.fn(() => limiter),
  };
});

vi.mock('../rate-limit', () => ({
  getMediaRateLimiter: rateLimitState.getMediaRateLimiter,
}));

const getSignedUrl = vi.fn(async () => ['https://read.example.com']);

vi.mock('@/lib/firebase-admin', () => ({
  getStorage: () => ({
    bucket: () => ({
      name: 'test-bucket',
      file: () => ({ getSignedUrl }),
    }),
  }),
}));

describe('POST /api/media/get-read-url', () => {
  beforeEach(() => {
    getSignedUrl.mockClear();
    rateLimitState.getMediaRateLimiter.mockClear();
    rateLimitState.getMediaRateLimiter.mockReturnValue(rateLimitState.limiter);
    rateLimitState.limiter.attempt.mockClear();
    rateLimitState.limiter.attempt.mockImplementation(async () => ({
      ok: true,
      limit: 60,
      remaining: 59,
      retryAfterSeconds: 60,
      resetAt: new Date(Date.now() + 60_000),
    }));
  });

  it('returns a signed read url when storagePath is provided', async () => {
    const handler = createNextRouteHandler({ POST });

    const response = await withTestAuth(
      request(handler).post('/api/media/get-read-url')
    )
      .send({ storagePath: 'brands/brand-1/user/file.png' });

    expect(response.status).toBe(200);
    expect(getSignedUrl).toHaveBeenCalledWith({
      version: 'v4',
      action: 'read',
      expires: expect.any(Number),
    });
    expect(rateLimitState.getMediaRateLimiter).toHaveBeenCalled();
    expect(rateLimitState.limiter.attempt).toHaveBeenCalledWith('read:brands/brand-1/user/file.png');
    expect(response.body).toEqual({
      readUrl: 'https://read.example.com',
      bucket: 'test-bucket',
      storagePath: 'brands/brand-1/user/file.png',
    });
  });

  it('validates storagePath', async () => {
    const handler = createNextRouteHandler({ POST });

    const response = await withTestAuth(
      request(handler).post('/api/media/get-read-url')
    )
      .send({ storagePath: '' });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'Invalid "storagePath"' });
  });

  it('returns 429 when the read url rate limit is exceeded', async () => {
    rateLimitState.limiter.attempt.mockResolvedValueOnce({
      ok: false,
      limit: 60,
      remaining: 0,
      retryAfterSeconds: 17,
      resetAt: new Date(Date.now() + 17_000),
    });

    const handler = createNextRouteHandler({ POST });

    const response = await withTestAuth(
      request(handler).post('/api/media/get-read-url')
    )
      .send({ storagePath: 'brands/brand-1/user/file.png' });

    expect(response.status).toBe(429);
    expect(response.headers['retry-after']).toBe('17');
    expect(response.body).toEqual({ error: 'Rate limit exceeded', retryAfter: 17 });
  });
});
