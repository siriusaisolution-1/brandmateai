// src/instrumentation.ts
import * as Sentry from '@sentry/nextjs';
import { getEdgeOptions, getServerOptions, shouldInitialize } from '../sentry.config.shared';

// Zašto: Next App Router traži ovaj hook kako bismo inicijalizovali Sentry per-runtime samo kada DSN postoji.

export function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const options = getServerOptions();

    if (options && shouldInitialize('server')) {
      Sentry.init(options);
    }
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    const options = getEdgeOptions();

    if (options && shouldInitialize('edge')) {
      Sentry.init(options);
    }
  }
}

export const onRequestError = Sentry.captureRequestError;
