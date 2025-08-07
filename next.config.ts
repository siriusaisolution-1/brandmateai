import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from 'next';

/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
  transpilePackages: ['@genkit-ai/react'],
  experimental: {
    serverActions: {
      allowedOrigins: [
        "*.googleusercontent.com",
        "*.cloudworkstations.dev",
      ],
    },
  },
  allowedDevOrigins: [
    "https://*.googleusercontent.com",
    "https://*.cloudworkstations.dev",
  ],
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
