import * as Sentry from "@sentry/nextjs";

const enabled = Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN);

export function captureException(error: unknown, context?: Record<string, unknown>): void {
  if (!enabled) return;
  const normalized = error instanceof Error ? error : new Error(String(error));
  Sentry.captureException(normalized, context ? { extra: context } : undefined);
}

export function captureMessage(message: string): void {
  if (!enabled) return;
  Sentry.captureMessage(message);
}

export function isSentryEnabled(): boolean {
  return enabled;
}

export const sentryClient = Sentry;
