import { test, expect } from '@playwright/test';

test('renders proof section', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByTestId('proof-section')).toBeVisible();
});
