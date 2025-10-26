import { describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/health/metrics', () => ({
  buildHealthSnapshot: vi.fn(() => ({
    ok: true,
    timestamp: '2024-01-01T00:00:00.000Z',
    uptimeSeconds: 42,
    version: '1.2.3',
    environment: 'test',
    integrations: [
      { name: 'sentry', ok: true },
    ],
  })),
  getServiceStartedAt: vi.fn(() => 1234567890),
}));

describe('GET /health', () => {
  it('returns a structured health snapshot', async () => {
    const { GET } = await import('./route');

    const response = await GET();
    const payload = await response.json();

    expect(payload).toMatchObject({
      ok: true,
      uptimeSeconds: 42,
      version: '1.2.3',
      startedAt: 1234567890,
      integrations: [{ name: 'sentry', ok: true }],
    });
  });
});
