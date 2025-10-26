import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createNextRouteHandler } from '../../../../../tests/utils/create-next-route-handler';
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
  });

  it('creates a signed upload URL when payload is valid', async () => {
    const handler = createNextRouteHandler({ POST });

    const response = await request(handler)
      .post('/api/media/get-upload-url')
      .set('Authorization', 'Bearer test-token')
      .send({ filename: 'brand.png', contentType: 'image/png', brandId: 'brand-1' });

    expect(response.status).toBe(200);
    expect(verifyIdToken).toHaveBeenCalledWith('test-token');
    expect(getSignedUrl).toHaveBeenCalledTimes(1);
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

    const response = await request(handler)
      .post('/api/media/get-upload-url')
      .set('content-type', 'application/json')
      .send('{"filename":::}');

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({
      error: 'Invalid JSON body',
    });
  });

  it('validates required fields', async () => {
    const handler = createNextRouteHandler({ POST });

    const response = await request(handler)
      .post('/api/media/get-upload-url')
      .send({ filename: '', contentType: '', brandId: '' });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'Invalid "filename"' });
  });
});
