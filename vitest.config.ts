import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: [
      'functions/src/**/*.test.ts',
      'src/lib/flows-client/**/*.test.ts',
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
      '@': path.resolve(__dirname, 'src'),
    },
  },
});
