import { test, expect } from '@playwright/test';

test.describe('BrandMate smoke', () => {
  test('marketing landing renders hero content', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: /your ai marketing/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /get started for free/i })).toBeVisible();
  });

  test('health endpoint responds with OK status', async ({ request }) => {
    const response = await request.get('/health');
    expect(response.status()).toBe(200);
    const json = await response.json();
    expect(json).toMatchObject({ status: 'ok' });
  });
});
