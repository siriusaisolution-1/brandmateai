import { test, expect } from '@playwright/test';

const baseUrl = process.env.STAGING_BASE_URL;
const requiredEnv = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID',
  'STAGING_DEMO_EMAIL',
  'STAGING_DEMO_PASSWORD',
];

const missing = requiredEnv.filter((key) => !process.env[key]);

if (!baseUrl || missing.length > 0) {
  test.describe('staging demo journey (skipped)', () => {
    test('requires staging environment configuration', () => {
      test.skip(true, `Missing staging configuration: ${[!baseUrl ? 'STAGING_BASE_URL' : '', ...missing].filter(Boolean).join(', ')}`);
    });
  });
} else {
  const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
  };

  const brandId = process.env.STAGING_DEMO_BRAND_ID ?? 'brandmate-demo-staging';
  const assetFileName = process.env.STAGING_DEMO_ASSET_FILENAME ?? 'staging-demo-hero.png';
  const demoEmail = process.env.STAGING_DEMO_EMAIL!;
  const demoPassword = process.env.STAGING_DEMO_PASSWORD!;
  const cookieDomain = new URL(baseUrl!).hostname;
  const isSecure = baseUrl!.startsWith('https://');

  test.describe('staging demo journey', () => {
    test.beforeEach(async ({ context, page }) => {
      await context.addCookies([
        {
          name: 'firebase-auth',
          value: 'stub',
          domain: cookieDomain,
          path: '/',
          secure: isSecure,
          sameSite: 'None',
        },
      ]);

      await page.goto(`${baseUrl}/dev-debug`);

      await page.evaluate(
        async ({ config, email, password }) => {
          const appModule = await import('https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js');
          const authModule = await import('https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js');

          const app = appModule.getApps().length > 0 ? appModule.getApps()[0] : appModule.initializeApp(config);
          const auth = authModule.getAuth(app);
          await authModule.setPersistence(auth, authModule.browserLocalPersistence);
          await authModule.signInWithEmailAndPassword(auth, email, password);
        },
        { config: firebaseConfig, email: demoEmail, password: demoPassword }
      );
    });

    test('media library exposes seeded asset', async ({ page, request }) => {
      await page.goto(`${baseUrl}/media-library/${brandId}`);
      await page.waitForLoadState('networkidle');

      const assetImage = page.locator(`img[alt="${assetFileName}"]`);
      await expect(assetImage).toBeVisible({ timeout: 60_000 });

      const assetSrc = await assetImage.getAttribute('src');
      expect(assetSrc).toBeTruthy();

      const assetResponse = await request.get(assetSrc!);
      expect(assetResponse.ok()).toBeTruthy();
    });
  });
}
