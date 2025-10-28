import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createNextRouteHandler } from '../../../../../tests/utils/create-next-route-handler';
import { withTestAuth } from '../../../../../tests/utils/test-auth';
import { POST } from './route';

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
