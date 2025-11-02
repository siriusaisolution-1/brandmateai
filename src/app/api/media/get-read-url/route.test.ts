import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createNextRouteHandler } from '../../../../../tests/utils/create-next-route-handler';
import { TEST_AUTH_TOKEN, withTestAuth } from '../../../../../tests/utils/test-auth';
import { POST } from './route';

const getSignedUrl = vi.fn(async () => ['https://read.example.com']);
const requireBearerAuth = vi.hoisted(() =>
  vi.fn(async (request: Request) => {
    const header = request.headers.get('authorization') ?? request.headers.get('Authorization');
    if (!header?.startsWith('Bearer ')) {
      throw Object.assign(new Error('Missing bearer token'), { status: 401 });
    }

    const token = header.slice('Bearer '.length).trim();
    if (!token) {
      throw Object.assign(new Error('Missing bearer token'), { status: 401 });
    }

    if (token !== TEST_AUTH_TOKEN) {
      throw Object.assign(new Error('Invalid authentication token'), { status: 401 });
    }

    return {
      token,
      claims: { uid: 'user-1' },
    };
  })
);

vi.mock('@/lib/firebase-admin', () => ({
  getStorage: () => ({
    bucket: () => ({
      name: 'test-bucket',
      file: () => ({ getSignedUrl }),
    }),
  }),
}));

vi.mock('@/lib/auth/verify-id-token', () => ({
  requireBearerAuth,
}));

describe('POST /api/media/get-read-url', () => {
  beforeEach(() => {
    getSignedUrl.mockClear();
    requireBearerAuth.mockClear();
  });

  it('requires a bearer token', async () => {
    const handler = createNextRouteHandler({ POST });

    const response = await request(handler)
      .post('/api/media/get-read-url')
      .send({ storagePath: 'brands/brand-1/user/file.png' });

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ error: 'Missing bearer token' });
    expect(requireBearerAuth).toHaveBeenCalledTimes(1);
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
    expect(response.body).toEqual({
      readUrl: 'https://read.example.com',
      bucket: 'test-bucket',
      storagePath: 'brands/brand-1/user/file.png',
    });
    expect(requireBearerAuth).toHaveBeenCalledTimes(1);
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
});
