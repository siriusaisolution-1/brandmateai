import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest';

const captureException = vi.fn();

vi.mock('@sentry/nextjs', () => ({
  captureException,
}));

beforeEach(() => {
  captureException.mockReset();
});

describe('reportClientError', () => {
  it('sends the provided error to Sentry', async () => {
    const { reportClientError } = await import('./sentry-client');
    const error = new Error('client boom');

    reportClientError(error, { screen: 'dashboard' });

    expect(captureException).toHaveBeenCalledWith(error, {
      extra: { screen: 'dashboard' },
    });
  });

  it('normalizes non-error values', async () => {
    const { reportClientError } = await import('./sentry-client');

    reportClientError('plain string');

    expect(captureException).toHaveBeenCalledTimes(1);
    const [captured] = (captureException as Mock).mock.calls[0];
    expect(captured).toBeInstanceOf(Error);
    expect((captured as Error).message).toBe('plain string');
  });
});
