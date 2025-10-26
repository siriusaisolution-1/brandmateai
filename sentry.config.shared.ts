import type { BrowserOptions, EdgeOptions, NodeOptions } from "@sentry/nextjs";

// Zašto: Centralizujemo parsiranje opcija kako bismo izbegli dupliranje logike kroz sve konfiguracije.
type MaybeNumber = number | undefined;

type SentryFlagKey = 'server' | 'edge' | 'client';

const getInitFlags = (): Record<SentryFlagKey, boolean> => {
  const globalScope = globalThis as typeof globalThis & {
    __sentryInitFlags?: Record<SentryFlagKey, boolean>;
  };

  if (!globalScope.__sentryInitFlags) {
    globalScope.__sentryInitFlags = { client: false, edge: false, server: false };
  }

  return globalScope.__sentryInitFlags;
};

export const shouldInitialize = (key: SentryFlagKey): boolean => {
  const flags = getInitFlags();

  if (flags[key]) {
    return false;
  }

  flags[key] = true;
  return true;
};

export const resetInitFlagsForTesting = (): void => {
  const globalScope = globalThis as typeof globalThis & {
    __sentryInitFlags?: Record<SentryFlagKey, boolean>;
  };

  if (globalScope.__sentryInitFlags) {
    globalScope.__sentryInitFlags = { client: false, edge: false, server: false };
  }
};

const parseRate = (value: string | undefined, fallback: number): number => {
  const parsed = value !== undefined ? Number(value) : NaN;
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const getServerOptions = (): NodeOptions | null => {
  const dsn = process.env.SENTRY_DSN;

  if (!dsn) {
    return null;
  }

  return {
    dsn,
    environment: process.env.SENTRY_ENVIRONMENT ?? process.env.NODE_ENV,
    tracesSampleRate: parseRate(process.env.SENTRY_TRACES_SAMPLE_RATE, 0.1),
    profilesSampleRate: parseRate(process.env.SENTRY_PROFILES_SAMPLE_RATE, 0),
  } satisfies NodeOptions;
};

export const getEdgeOptions = (): EdgeOptions | null => {
  const dsn = process.env.SENTRY_DSN;

  if (!dsn) {
    return null;
  }

  return {
    dsn,
    environment: process.env.SENTRY_ENVIRONMENT ?? process.env.NODE_ENV,
    tracesSampleRate: parseRate(process.env.SENTRY_TRACES_SAMPLE_RATE, 0.1),
  } satisfies EdgeOptions;
};

export const getBrowserOptions = (): BrowserOptions | null => {
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN ?? process.env.SENTRY_DSN;

  if (!dsn) {
    return null;
  }

  return {
    dsn,
    tracesSampleRate: parseRate(
      process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE ?? process.env.SENTRY_TRACES_SAMPLE_RATE,
      0.1,
    ),
    replaysSessionSampleRate: parseRate(
      process.env.NEXT_PUBLIC_SENTRY_REPLAYS_SESSION_SAMPLE_RATE ?? process.env.SENTRY_REPLAYS_SESSION_SAMPLE_RATE,
      0,
    ) as MaybeNumber,
    replaysOnErrorSampleRate: parseRate(
      process.env.NEXT_PUBLIC_SENTRY_REPLAYS_ERROR_SAMPLE_RATE ?? process.env.SENTRY_REPLAYS_ERROR_SAMPLE_RATE,
      1,
    ) as MaybeNumber,
  } satisfies BrowserOptions;
};
