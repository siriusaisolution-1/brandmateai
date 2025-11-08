import { test, expect } from '@playwright/test';

const marketingFeatureTestIds = [
  'feature-ai-agent',
  'feature-content-automation',
  'feature-insights-dashboard',
  'feature-media-library',
  'feature-brand-kit',
  'feature-integrations',
];

test.describe('Marketing site smoke', () => {
  test('homepage hero is visible', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: /your ai marketing co-pilot/i })).toBeVisible();
  });

  test('features page exposes all tracked sections', async ({ page }) => {
    await page.goto('/features');

    for (const testId of marketingFeatureTestIds) {
      await test.step(`expect feature section with test id ${testId}`, async () => {
        await expect(page.getByTestId(testId)).toBeVisible();
      });
    }
  });

  test('pricing page lists the core plans', async ({ page }) => {
    await page.goto('/pricing');

    const expectedPlans = ['Solo', 'Pro', 'Agency'];

    for (const plan of expectedPlans) {
      await test.step(`assert plan ${plan} is rendered`, async () => {
        await expect(page.getByRole('heading', { name: new RegExp(`^${plan}$`, 'i') })).toBeVisible();
      });
    }
  });

  test('register page shows social sign-up buttons', async ({ page }) => {
    await page.goto('/register');

    await expect(page.getByRole('button', { name: /google/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /facebook/i })).toBeVisible();
  });
});
