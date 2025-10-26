import * as Sentry from '@sentry/nextjs';

type ExtraContext = Record<string, unknown> | undefined;

/**
 * Reports client-side exceptions to Sentry with optional structured context.
 */
export function reportClientError(error: unknown, context?: ExtraContext): void {
  const normalizedError =
    error instanceof Error ? error : new Error(typeof error === 'string' ? error : JSON.stringify(error));

  if (context) {
    Sentry.captureException(normalizedError, { extra: context });
    return;
  }

  Sentry.captureException(normalizedError);
}
