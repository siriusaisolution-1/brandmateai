import { describe, expect, it } from 'vitest';

describe('GET /api/health', () => {
  it('returns ok status', async () => {
    const { GET } = await import('./route');
    const response = await GET();
    const payload = await response.json();

    expect(payload.status).toBe('ok');
    expect(typeof payload.timestamp).toBe('number');
  });
});
