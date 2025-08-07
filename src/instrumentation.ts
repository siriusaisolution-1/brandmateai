// src/instrumentation.ts
import * as Sentry from '@sentry/nextjs';
import type { Instrumentation } from 'next';

export function register() {
  // We only want to initialize Sentry on the server side.
  // The client side will be initialized in instrumentation-client.ts
  if (process.env.NEXT_RUNTIME === 'nodejs' || process.env.NEXT_RUNTIME === 'edge') {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      tracesSampleRate: 1.0,
    });
  }
}

export const onRequestError: Instrumentation['onRequestError'] = (error) => {
  Sentry.captureRequestError(error);
};
