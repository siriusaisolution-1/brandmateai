import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./vitest.setup.ts'],
    include: [
      'functions/src/**/*.test.ts',
      'src/**/*.{test,ui.test}.{ts,tsx}',
      'tests/**/*.test.ts?(x)',
      'middleware.test.ts',
    ],
    exclude: [
      'functions/src/ai/flows/admin-stats.test.ts',
      'functions/src/ai/flows/manage-ads.test.ts',
      'functions/src/ai/flows/moderation.test.ts',
    ],
    environmentMatchGlobs: [
      ['**/*.ui.test.tsx', 'jsdom'],
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: [
        'functions/src/utils/ai-usage-tracker.ts',
        'functions/src/utils/firebase.ts',
        'src/lib/flows-client/brand.ts',
        'src/lib/flows-client/shared.ts',
        'src/lib/flows-client/video.ts',
        'middleware.ts',
      ],
      thresholds: {
        lines: 80,
        branches: 80,
        functions: 80,
        statements: 80,
      },
    },
    typecheck: {
      tsconfig: 'tsconfig.vitest.json',
    },
  },
  resolve: {
    alias: {
      '@genkit-ai/google-genai': path.resolve(__dirname, 'functions/src/ai/flows/genai-shim.ts'),
      '@': path.resolve(__dirname, 'src'),
    },
  },
});
