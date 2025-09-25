// src/instrumentation.ts
import * as Sentry from '@sentry/nextjs';

export function register() {
  // Re-enabling Sentry with a low sample rate as per the hardening plan.
  if (process.env.NEXT_RUNTIME === 'nodejs' || process.env.NEXT_RUNTIME === 'edge') {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      // Adjust this value in production
      tracesSampleRate: 0.1, 
      // TODO: Add profiling when performance becomes a focus
      // profilesSampleRate: 1.0, 
    });
  }
}
