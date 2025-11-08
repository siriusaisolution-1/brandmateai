import { defineConfig } from '@playwright/test';

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://127.0.0.1:4300';
const seededBrandId = process.env.BRANDMATE_E2E_BRAND_ID ?? 'brand-e2e';
const e2eUserToken = process.env.BRANDMATE_E2E_SESSION_TOKEN ?? 'stub-session-token';
const e2eAdminToken = process.env.BRANDMATE_E2E_ADMIN_TOKEN ?? 'stub-admin-session-token';

const args = process.argv.slice(2);
const includeStagingViaCli = args.some((arg, index) => {
  if (arg === '--grep' || arg === '-g') {
    const value = args[index + 1];
    return value?.includes('@staging');
  }

  if (arg.startsWith('--grep=')) {
    return arg.includes('@staging');
  }

  if (arg.startsWith('-g=')) {
    return arg.includes('@staging');
  }

  return false;
});

const includeStaging = process.env.PLAYWRIGHT_INCLUDE_STAGING === '1' || includeStagingViaCli;

process.env.BRANDMATE_E2E_BRAND_ID = seededBrandId;
process.env.BRANDMATE_E2E_MEDIA_ID ??= `${seededBrandId}-seeded-media`;
process.env.BRANDMATE_E2E_MEDIA_FILENAME ??= 'seeded-media.png';
process.env.BRANDMATE_E2E_MEDIA_URL ??=
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAE0lEQVR42mP8/5+hHgAHggJ/P8hX4AAAAABJRU5ErkJggg==';
process.env.BRANDMATE_E2E_SESSION_TOKEN = e2eUserToken;
process.env.BRANDMATE_E2E_ADMIN_TOKEN = e2eAdminToken;

export default defineConfig({
  globalSetup: './e2e/global.setup.ts',
  testDir: 'e2e',
  timeout: 60_000,
  retries: process.env.CI ? 1 : 0,
  grepInvert: includeStaging ? undefined : /@staging/,
  use: {
    baseURL,
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'pnpm run start:test',
    port: 4300,
    timeout: 120_000,
    reuseExistingServer: !process.env.CI,
    env: {
      NEXT_TELEMETRY_DISABLED: '1',
      NEXT_PUBLIC_FIREBASE_API_KEY: 'test-api-key',
      NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: 'test.firebaseapp.com',
      NEXT_PUBLIC_FIREBASE_PROJECT_ID: 'test-project',
      NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: 'test.appspot.com',
      NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: '1234567890',
      NEXT_PUBLIC_FIREBASE_APP_ID: '1:1234567890:web:abcdef',
      NEXT_PUBLIC_FEATURE_WATCHTOWERS: '0',
      BRANDMATE_E2E_SESSION_TOKEN: e2eUserToken,
      BRANDMATE_E2E_ADMIN_TOKEN: e2eAdminToken,
      FIREBASE_AUTH_COOKIE_NAMES: '__session,firebase-auth',
    },
  },
});
