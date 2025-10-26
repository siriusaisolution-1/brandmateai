import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@sentry/nextjs', () => ({
  init: vi.fn(),
  captureRequestError: vi.fn(),
  captureRouterTransitionStart: vi.fn(),
  captureException: vi.fn(),
}));

describe('Sentry instrumentation', () => {
  beforeEach(async () => {
    vi.resetModules();
    const { resetInitFlagsForTesting } = await import('../../sentry.config.shared');
    resetInitFlagsForTesting();
    vi.clearAllMocks();
    process.env.SENTRY_DSN = 'https://examplePublicKey@o0.ingest.sentry.io/0';
    process.env.NEXT_PUBLIC_SENTRY_DSN = 'https://examplePublicKey@o0.ingest.sentry.io/0';
  });

  it('register initialises Sentry on the server runtime', async () => {
    process.env.NEXT_RUNTIME = 'nodejs';
    const instrumentation = await import('../../instrumentation');

    instrumentation.register();

    const sentry = await import('@sentry/nextjs');
    expect(sentry.init).toHaveBeenCalledTimes(1);
  });

  it('register initialises Sentry on the edge runtime', async () => {
    process.env.NEXT_RUNTIME = 'edge';
    const instrumentation = await import('../../instrumentation');

    instrumentation.register();

    const sentry = await import('@sentry/nextjs');
    expect(sentry.init).toHaveBeenCalledTimes(1);
  });

  it('client instrumentation initialises Sentry and exposes router hook', async () => {
    const instrumentationClient = await import('../../instrumentation.client');
    const sentry = await import('@sentry/nextjs');

    expect(sentry.init).toHaveBeenCalledTimes(1);
    expect(typeof instrumentationClient.onRouterTransitionStart).toBe('function');
  });

  it('forwards request errors to Sentry', async () => {
    const instrumentation = await import('../../instrumentation');
    const sentry = await import('@sentry/nextjs');
    const error = new Error('instrumentation failure');
    const request = {
      path: '/api',
      method: 'GET',
      headers: { host: 'localhost' },
    } as Parameters<typeof sentry.captureRequestError>[1];

    instrumentation.onRequestError(error, request, { mechanism: 'test' } as never);

    expect(sentry.captureRequestError).toHaveBeenCalledWith(error, request, { mechanism: 'test' });
  });

  it('skips initialisation when DSN is missing', async () => {
    process.env.SENTRY_DSN = '';
    process.env.NEXT_PUBLIC_SENTRY_DSN = '';
    process.env.NEXT_RUNTIME = 'nodejs';

    const instrumentation = await import('../../instrumentation');

    instrumentation.register();

    const sentry = await import('@sentry/nextjs');
    expect(sentry.init).not.toHaveBeenCalled();
  });
});
