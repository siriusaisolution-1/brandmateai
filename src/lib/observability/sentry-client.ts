import { captureException } from '@/lib/monitoring/sentry';

type ExtraContext = Record<string, unknown> | undefined;

const SENTRY_DSN = (process.env.NEXT_PUBLIC_SENTRY_DSN ?? '').trim();

function isSentryActive(): boolean {
  return SENTRY_DSN.length > 0;
}

function logSuppressedError(error: Error) {
  if (process.env.NODE_ENV !== 'production') {
    console.warn('[sentry] capture skipped – DSN not configured', error);
  }
}

/**
 * Reports client-side exceptions to Sentry with optional structured context.
 * When DSN is not configured, it fails silently to avoid breaking the UI.
 */
export function reportClientError(error: unknown, context?: ExtraContext): void {
  const normalizedError =
    error instanceof Error ? error : new Error(typeof error === 'string' ? error : JSON.stringify(error));

  if (!isSentryActive()) {
    logSuppressedError(normalizedError);
    return;
  }

  if (context) {
    captureException(normalizedError, context);
    return;
  }

  captureException(normalizedError);
}
