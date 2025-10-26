import request from 'supertest';
import { describe, expect, it } from 'vitest';

import { createNextRouteHandler } from '../../../../tests/utils/create-next-route-handler';
import { GET } from './route';

describe('GET /api/diag', () => {
  it('exposes environment diagnostics', async () => {
    const handler = createNextRouteHandler({ GET });

    const response = await request(handler).get('/api/diag');

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      node: expect.stringMatching(/^v\d+/),
      env: expect.any(String),
      hasServiceAccountB64: true,
    });
    expect(response.body.bucket).toBe(process.env.FIREBASE_STORAGE_BUCKET);
  });
});
