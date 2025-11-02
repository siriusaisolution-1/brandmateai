import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createNextRouteHandler } from '../../../../../tests/utils/create-next-route-handler';
import { TEST_AUTH_TOKEN, withTestAuth } from '../../../../../tests/utils/test-auth';

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

const firestoreMockState = vi.hoisted(() => ({
  brandSnapshot: { exists: true, get: vi.fn(() => undefined) },
  getBrandSnapshot: vi.fn(),
  doc: vi.fn(),
  add: vi.fn(),
  collection: vi.fn(),
  getFirestore: vi.fn(),
  serverTimestamp: vi.fn(),
  increment: vi.fn(),
}));

vi.mock('firebase-admin/firestore', () => {
  const brandSnapshot = {
    exists: true,
    get: vi.fn((field: string) => (field === 'ownerId' ? 'user-1' : undefined)),
  };
  const getBrandSnapshot = vi.fn(async () => brandSnapshot);
  const doc = vi.fn(() => ({ get: getBrandSnapshot }));
  const add = vi.fn(async () => ({ id: 'upload-1' }));
  const collection = vi.fn((name: string) => {
    if (name === 'brands') {
      return { doc };
    }
    if (name === 'mediaUploads') {
      return { add };
    }
    return {};
  });
  const getFirestore = vi.fn(() => ({ collection }));
  const serverTimestamp = vi.fn(() => 'timestamp');
  const increment = vi.fn((value: number) => value);

  Object.assign(firestoreMockState, {
    brandSnapshot,
    getBrandSnapshot,
    doc,
    add,
    collection,
    getFirestore,
    serverTimestamp,
    increment,
  });

  return {
    getFirestore,
    FieldValue: { serverTimestamp, increment },
  };
});
import { POST } from './route';

const verifyIdToken = vi.fn(async () => ({ uid: 'user-1' }));
const getSignedUrl = vi.fn(async () => ['https://signed.example.com']);

vi.mock('@/lib/firebase-admin', () => ({
  getAuth: () => ({ verifyIdToken }),
  getStorage: () => ({
    bucket: () => ({
      name: 'test-bucket',
      file: () => ({ getSignedUrl }),
    }),
  }),
}));

describe('POST /api/media/get-upload-url', () => {
  beforeEach(() => {
    verifyIdToken.mockClear();
    getSignedUrl.mockClear();
    firestoreMockState.collection.mockClear();
    firestoreMockState.doc.mockClear();
    firestoreMockState.add.mockClear();
    firestoreMockState.getBrandSnapshot.mockClear();
    firestoreMockState.brandSnapshot.get.mockClear();
    firestoreMockState.serverTimestamp.mockClear();
    firestoreMockState.increment.mockClear();
    firestoreMockState.getFirestore.mockClear();
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

  it('requires a bearer token', async () => {
    const handler = createNextRouteHandler({ POST });

    const response = await request(handler)
      .post('/api/media/get-upload-url')
      .send({ filename: 'brand.png', contentType: 'image/png', brandId: 'brand-1' });

    expect(response.status).toBe(401);
    expect(response.body).toMatchObject({ error: 'Missing bearer token' });
    expect(verifyIdToken).not.toHaveBeenCalled();
  });

  it('creates a signed upload URL when payload is valid', async () => {
    const handler = createNextRouteHandler({ POST });

    const response = await withTestAuth(
      request(handler).post('/api/media/get-upload-url')
    )
      .set('content-type', 'application/json')
      .send({ filename: 'brand.png', contentType: 'image/png', brandId: 'brand-1' });

    expect(response.status).toBe(200);
    expect(verifyIdToken).toHaveBeenCalledWith(TEST_AUTH_TOKEN);
    expect(getSignedUrl).toHaveBeenCalledTimes(1);
    expect(rateLimitState.getMediaRateLimiter).toHaveBeenCalled();
    expect(rateLimitState.limiter.attempt).toHaveBeenCalledWith('user-1:brand-1');
    expect(response.body).toEqual(
      expect.objectContaining({
        uploadUrl: 'https://signed.example.com',
        storagePath: expect.stringContaining('brand.png'),
        bucket: 'test-bucket',
      })
    );
  });

  it('rejects invalid json bodies', async () => {
    const handler = createNextRouteHandler({ POST });

    const response = await withTestAuth(
      request(handler).post('/api/media/get-upload-url')
    )
      .set('content-type', 'application/json')
      .send('{"filename":::}');

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({
      error: 'Invalid "brandId"',
    });
  });

  it('validates required fields', async () => {
    const handler = createNextRouteHandler({ POST });

    const response = await withTestAuth(
      request(handler).post('/api/media/get-upload-url')
    )
      .set('content-type', 'application/json')
      .send({ filename: '', contentType: '', brandId: '' });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'Invalid "brandId"' });
  });

  it('returns 429 when the rate limit is exceeded', async () => {
    rateLimitState.limiter.attempt.mockResolvedValueOnce({
      ok: false,
      limit: 60,
      remaining: 0,
      retryAfterSeconds: 42,
      resetAt: new Date(Date.now() + 42_000),
    });

    const handler = createNextRouteHandler({ POST });

    const response = await withTestAuth(
      request(handler).post('/api/media/get-upload-url')
    )
      .set('content-type', 'application/json')
      .send({ filename: 'brand.png', contentType: 'image/png', brandId: 'brand-1' });

    expect(response.status).toBe(429);
    expect(response.headers['retry-after']).toBe('42');
    expect(response.body).toEqual({ error: 'Rate limit exceeded', retryAfter: 42 });
  });
});
