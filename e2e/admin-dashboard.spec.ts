import { test, expect } from '@playwright/test';

const ADMIN_SESSION_TOKEN = process.env.BRANDMATE_E2E_ADMIN_TOKEN ?? 'stub-admin-session-token';

test.describe('Admin dashboard smoke', () => {
  test.beforeEach(async ({ context, page }) => {
    await context.addCookies([
      {
        name: 'firebase-auth',
        value: 'admin-stub',
        domain: '127.0.0.1',
        path: '/',
      },
      {
        name: '__session',
        value: ADMIN_SESSION_TOKEN,
        domain: '127.0.0.1',
        path: '/',
      },
    ]);

    await page.addInitScript((sessionToken: string) => {
      const existingMocks = window.__E2E_MOCKS__ ?? {};
      const existingFeatures = existingMocks.features ?? {};

      window.__E2E_MOCKS__ = {
        ...existingMocks,
        currentUser: {
          uid: 'e2e-admin',
          email: 'admin@example.com',
          getIdToken: async () => sessionToken,
        },
        features: {
          ...existingFeatures,
          watchtowersEnabled: false,
        },
      };
    }, ADMIN_SESSION_TOKEN);
  });

  test('renders administrative metrics for authorized users', async ({ page }) => {
    await page.goto('/admin/dashboard');
    await expect(page.getByTestId('admin-stats-status')).toHaveText(/Admin Stats loaded/i);
    await expect(page.getByTestId('admin-stats-grid')).toBeVisible();
  });
});
