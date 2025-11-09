import { test, expect } from '@playwright/test';

test('header Pricing opens pricing page', async ({ page }) => {
  await page.goto(process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000');
  await page.getByRole('link', { name: 'Pricing' }).click();
  await expect(page).toHaveURL(/\/pricing$/);
  await expect(page.getByRole('heading', { name: /pricing/i })).toBeVisible();
});
