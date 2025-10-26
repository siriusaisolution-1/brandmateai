import type * as functionsModule from 'firebase-functions';
import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest';

const logger = {
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  debug: vi.fn(),
};

const wrapHttpFunctionMock = vi.fn((fn: unknown) => fn);
const onCallMock = vi.fn((fn: unknown) => fn);
const onRequestMock = vi.fn((fn: unknown) => fn);
const beforeSignInMock = vi.fn((fn: unknown) => fn);

vi.mock('@sentry/serverless', () => ({
  GCPFunction: {
    init: vi.fn(),
    wrapHttpFunction: wrapHttpFunctionMock,
  },
  captureException: vi.fn(),
}));

vi.mock('firebase-functions', () => ({
  __esModule: true,
  logger,
  https: {
    onCall: onCallMock,
    onRequest: onRequestMock,
    HttpsError: class extends Error {
      constructor(public code: string, message: string) {
        super(message);
      }
    },
  },
  auth: {
    user: vi.fn(() => ({ beforeSignIn: beforeSignInMock })),
  },
}));

describe('functions observability utilities', () => {
  beforeEach(async () => {
    vi.resetModules();
    Object.values(logger).forEach(mock => (mock as Mock).mockReset());
    wrapHttpFunctionMock.mockClear();
    onCallMock.mockClear();
    onRequestMock.mockClear();
    beforeSignInMock.mockClear();
    const sentry = await import('@sentry/serverless');
    (sentry.GCPFunction.init as Mock).mockClear();
    (sentry.captureException as Mock).mockClear();
    process.env.SENTRY_DSN = 'https://example.ingest.sentry.io/1';
  });

  it('logs structured success metadata for callable handlers', async () => {
    const { createCallableHandler, ensureSentry } = await import('./observability');
    ensureSentry();

    const handler = createCallableHandler(
      'test.fn',
      async () => 'ok',
      { flow: 'flows.test', getBrandId: () => 'brand-1' },
    );

    const result = await handler(
      { brandId: 'brand-1' } as unknown,
      {
        auth: { uid: 'user-1', token: {} },
        rawRequest: { headers: { 'x-cloud-trace-context': 'trace-123/456;o=1' } },
      } as unknown as functionsModule.https.CallableContext,
    );

    expect(result).toBe('ok');
    expect(logger.info).toHaveBeenCalledWith(
      'test.fn succeeded',
      expect.objectContaining({
        traceId: 'trace-123',
        userId: 'user-1',
        brandId: 'brand-1',
        flow: 'flows.test',
      }),
    );
  });

  it('captures exceptions and logs structured failures', async () => {
    const { createCallableHandler } = await import('./observability');
    const sentry = await import('@sentry/serverless');

    const handler = createCallableHandler('test.fn', async () => {
      throw new Error('boom');
    });

    await expect(
      handler(
        {},
        {
          auth: { uid: 'user-2', token: {} },
          rawRequest: { headers: { 'x-cloud-trace-context': 'trace-456/1' } },
        } as unknown as functionsModule.https.CallableContext,
      ),
    ).rejects.toThrow('boom');

    expect(logger.error).toHaveBeenCalledWith(
      'test.fn failed',
      expect.objectContaining({
        traceId: 'trace-456',
        userId: 'user-2',
        flow: 'test.fn',
      }),
    );
    expect(sentry.captureException).toHaveBeenCalled();
  });

  it('wraps handlers with instrumentCallable', async () => {
    const { instrumentCallable } = await import('./observability');

    const callable = instrumentCallable('test.fn', async () => 'wrapped');

    expect(typeof callable).toBe('function');
    expect(onCallMock).toHaveBeenCalled();
  });

  it('records handled exceptions with Sentry context', async () => {
    const { recordHandledException } = await import('./observability');
    const sentry = await import('@sentry/serverless');

    recordHandledException('test.fn', new Error('boom'), 'handled', {
      traceId: 'trace-1',
      userId: 'user-5',
      brandId: null,
      flow: 'flows.test',
      latencyMs: 0,
    });

    expect(logger.error).toHaveBeenCalledWith(
      'handled',
      expect.objectContaining({
        traceId: 'trace-1',
        userId: 'user-5',
      }),
    );
    expect(sentry.captureException).toHaveBeenCalled();
  });
});
