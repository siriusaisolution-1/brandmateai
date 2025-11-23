import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest';

const captureException = vi.fn();

vi.mock('@sentry/nextjs', () => ({
  captureException,
}));

const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

beforeEach(() => {
  captureException.mockReset();
  consoleWarnSpy.mockClear();
  delete process.env.NEXT_PUBLIC_SENTRY_DSN;
  vi.resetModules();
});

describe('reportClientError', () => {
  it('sends the provided error to Sentry when DSN exists', async () => {
    process.env.NEXT_PUBLIC_SENTRY_DSN = 'https://example.com/123';
    const { reportClientError } = await import('./sentry-client');
    const error = new Error('client boom');

    reportClientError(error, { screen: 'dashboard' });

    expect(captureException).toHaveBeenCalledWith(error, {
      extra: { screen: 'dashboard' },
    });
  });

  it('normalizes non-error values', async () => {
    process.env.NEXT_PUBLIC_SENTRY_DSN = 'https://example.com/123';
    const { reportClientError } = await import('./sentry-client');

    reportClientError('plain string');

    expect(captureException).toHaveBeenCalledTimes(1);
    const [captured] = (captureException as Mock).mock.calls[0];
    expect(captured).toBeInstanceOf(Error);
    expect((captured as Error).message).toBe('plain string');
  });

  it('no-ops when DSN is missing', async () => {
    const { reportClientError } = await import('./sentry-client');

    reportClientError('plain string');

    expect(captureException).not.toHaveBeenCalled();
    expect(consoleWarnSpy).toHaveBeenCalled();
  });
});
