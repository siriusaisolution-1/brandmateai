import { Buffer } from 'node:buffer';

import { test, expect } from '@playwright/test';

const TEST_BRAND_ID = 'brand-e2e';

test.describe('End-to-end customer journeys', () => {
  test.beforeEach(async ({ context, page }) => {
    await context.addCookies([
      {
        name: 'firebase-auth',
        value: 'stub',
        domain: '127.0.0.1',
        path: '/',
      },
    ]);

    await page.addInitScript((brandId: string) => {
      const mediaStore: Array<{ id: string; brandId: string; url: string; fileName: string }> = [];

      const broadcast = () => {
        const event = new CustomEvent('e2e:media-updated', {
          detail: [...mediaStore],
        });
        window.dispatchEvent(event);
      };

      window.__E2E_MOCKS__ = {
        currentUser: { uid: 'e2e-user', email: 'e2e@example.com' },
        performBrandAudit: async ({ url }) => ({
          report: `Audit summary for ${url}`,
          name: 'E2E Brand',
          brandVoice: 'Energetic',
          keyInfo: 'Key differentiators',
          suggestedColors: ['#123456', '#abcdef'],
        }),
        saveBrand: async () => ({ brandId }),
        uploadMediaAsset: async ({ brandId, fileName }) => ({
          assetId: `${brandId}-${fileName}`,
        }),
        requestMasterRouter: async ({ prompt, isFirstMessage }) => {
          if (isFirstMessage) {
            return {
              message: 'Welcome from BrandMate test assistant!',
              routedFlow: 'greeting',
              payload: null,
            };
          }

          return {
            message: `Generated concept for: ${prompt}`,
            routedFlow: 'contentGenerator',
            payload: { prompt },
          };
        },
        handleUpload: async (files, { brandId }) => {
          for (const file of files) {
            const url = URL.createObjectURL(file);
            mediaStore.push({
              id: `${brandId}-${Date.now()}-${file.name}`,
              brandId,
              url,
              fileName: file.name,
            });
          }
          broadcast();
        },
        getMediaAssets: currentBrandId => mediaStore.filter(asset => asset.brandId === currentBrandId),
        subscribeToMediaUpdates: (currentBrandId, callback) => {
          const handler = (event: Event) => {
            const detail = (event as CustomEvent<typeof mediaStore>).detail;
            const relevant = detail.filter(asset => asset.brandId === currentBrandId);
            callback(relevant);
          };
          window.addEventListener('e2e:media-updated', handler as EventListener);
          return () => window.removeEventListener('e2e:media-updated', handler as EventListener);
        },
      };
    }, TEST_BRAND_ID);
  });

  test('brand onboarding audit and save flow', async ({ page }) => {
    await page.goto(`/brands/new`);

    await page.waitForSelector('#url');
    await page.fill('#url', 'https://brandmate.ai');
    await page.click('button:has-text("Run AI Audit")');
    await expect(page.locator('[role="status"]', { hasText: 'Audit complete' })).toBeVisible();

    await page.fill('#industry', 'Retail');
    await page.fill('#competitors', 'https://comp-a.com, https://comp-b.com');
    await page.click('button:has-text("Save Brand")');

    await expect(page.locator('[role="status"]', { hasText: 'Brand saved' })).toBeVisible();
  });

  test('content generation via master chat', async ({ page }) => {
    await page.goto('/dashboard');

    await page.getByLabel('Open AI Chat').waitFor();
    await page.getByLabel('Open AI Chat').click({ force: true });
    await expect(page.getByTestId('master-ai-chat-panel')).toBeVisible();

    const prompt = 'Launch teaser social posts';
    await page.getByPlaceholder('What should we create today?').fill(prompt);
    await page.keyboard.press('Enter');

    await expect(page.getByText(`Generated concept for: ${prompt}`)).toBeVisible();
  });

  test('media uploader surfaces assets in the library', async ({ page }) => {
    await page.goto(`/media-library/${TEST_BRAND_ID}`);

    const fileInput = page.locator('input[type="file"]');
    await fileInput.waitFor();
    await fileInput.setInputFiles({
      name: 'hero.png',
      mimeType: 'image/png',
      buffer: Buffer.from('test-image'),
    });

    await expect(page.locator('img[alt="hero.png"]')).toBeVisible();
  });
});
