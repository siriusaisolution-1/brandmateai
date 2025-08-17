import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from 'next';

// Parsiranje Studio origin-a iz .env.local
const ALLOWED_ORIGINS =
  process.env.NEXT_PUBLIC_ALLOWED_DEV_ORIGINS?.split(',')
    .map((s) => s.trim())
    .filter(Boolean) ?? [
      "*.googleusercontent.com",
      "*.cloudworkstations.dev",
    ];

const nextConfig: NextConfig = {
  transpilePackages: ['@genkit-ai/react'],
  experimental: {
    serverActions: {
      allowedOrigins: ALLOWED_ORIGINS,
    },
  },
  allowedDevOrigins: ALLOWED_ORIGINS,
};

export default withSentryConfig(
  nextConfig,
  {
    org: process.env.SENTRY_ORG,
    project: process.env.SENTRY_PROJECT,
    silent: true,
  },
  {
    widenClientFileUpload: true,
    hideSourceMaps: true,
    disableLogger: true,
    automaticVercelMonitors: true,
  }
);
