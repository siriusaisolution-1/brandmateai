// src/instrumentation.ts
// Minimal Next.js instrumentation stub.
// Sentry je već podešen kroz withSentryConfig u next.config.ts.

export async function register() {
  // no-op
}

// (opciono) hook za request greške – ostavljen kao no-op dok ne vratimo Sentry
export function onRequestError() {
  // no-op
}