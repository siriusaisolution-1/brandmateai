// instrumentation.client.ts
import * as Sentry from '@sentry/nextjs';
import { getBrowserOptions, shouldInitialize } from './sentry.config.shared';

const options = getBrowserOptions();

if (options && shouldInitialize('client')) {
  Sentry.init(options);
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
