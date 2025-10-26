// instrumentation.ts
import * as Sentry from '@sentry/nextjs';
import { getEdgeOptions, getServerOptions, shouldInitialize } from './sentry.config.shared';

// Next App Router calls this hook during bootstrap for each runtime (nodejs & edge).
export function register(): void {
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
