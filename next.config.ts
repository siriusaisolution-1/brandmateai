// next.config.ts
import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@genkit-ai/react"],
  experimental: {
    serverActions: {
      allowedOrigins: ["*.googleusercontent.com", "*.cloudworkstations.dev"],
    },
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Next 15 više ne koristi custom allowedDevOrigins ovde; koristite env (već imaš u .env.local)
};

const sentryWrappedConfig = withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  silent: true,
  // modern SDK: build-time opcije svedene; sourcemaps/hideSourceMaps podešava se kroz SENTRY build flags
});

if (sentryWrappedConfig.experimental?.clientTraceMetadata) {
  delete sentryWrappedConfig.experimental.clientTraceMetadata;
}

export default sentryWrappedConfig;
