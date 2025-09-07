// src/instrumentation-client.ts
import * as Sentry from '@sentry/nextjs';

// Initialize Sentry on the client side
Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN, 
    tracesSampleRate: 1.0,
    replaysSessionSampleRate: 0.1,
});

// Export the required hook for navigation instrumentation
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
