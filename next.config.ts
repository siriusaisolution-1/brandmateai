// next.config.ts
import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

const experimentalConfig = {
  serverActions: {
    allowedOrigins: ["*.googleusercontent.com", "*.cloudworkstations.dev"],
  },
  outputFileTracingIgnores: [
    "**/@google-cloud/*/protos/**",
    "**/@google-cloud/*/**/test/**",
    "**/grpc-tools/**",
    "**/node-pre-gyp/**",
  ],
} as NextConfig["experimental"] & {
  outputFileTracingIgnores: string[];
};

const nextConfig: NextConfig = {
  transpilePackages: ["@genkit-ai/react"],
  experimental: experimentalConfig,
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Next 15 više ne koristi custom allowedDevOrigins ovde; koristite env (već imaš u .env.local)
};

export default withSentryConfig(
  nextConfig,
  {
    org: process.env.SENTRY_ORG,
    project: process.env.SENTRY_PROJECT,
    silent: true,
    // modern SDK: build-time opcije svedene; sourcemaps/hideSourceMaps podešava se kroz SENTRY build flags
  }
);