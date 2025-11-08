import { Buffer } from 'node:buffer';

import { test, expect } from '@playwright/test';

const TEST_BRAND_ID = process.env.BRANDMATE_E2E_BRAND_ID ?? null;
const FALLBACK_BRAND_ID = process.env.BRANDMATE_E2E_BRAND_ID ?? 'brand-e2e';
const SESSION_TOKEN = process.env.BRANDMATE_E2E_SESSION_TOKEN ?? 'stub-session-token';

const SEEDED_MEDIA = {
  id:
    process.env.BRANDMATE_E2E_MEDIA_ID ?? `${FALLBACK_BRAND_ID}-seeded-media`,
  fileName:
    process.env.BRANDMATE_E2E_MEDIA_FILENAME ?? 'seeded-media.png',
  url:
    process.env.BRANDMATE_E2E_MEDIA_URL ??
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAE0lEQVR42mP8/5+hHgAHggJ/P8hX4AAAAABJRU5ErkJggg==',
};

test.describe('End-to-end customer journeys', () => {
  test.beforeEach(async ({ context, page }) => {
    await context.addCookies([
      {
        name: 'firebase-auth',
        value: 'stub',
        domain: '127.0.0.1',
        path: '/',
      },
      {
        name: '__session',
        value: SESSION_TOKEN,
        domain: '127.0.0.1',
        path: '/',
      },
    ]);

    await page.addInitScript(
      (
        brandId: string,
        seededMedia: { id: string; fileName: string; url: string } | null,
        sessionToken: string
      ) => {
        const initialMedia =
          seededMedia?.url && seededMedia.id
            ? [
                {
                  id: seededMedia.id,
                  brandId,
                  url: seededMedia.url,
                  fileName: seededMedia.fileName,
                },
              ]
            : [];
        const mediaStore: Array<{
          id: string;
          brandId: string;
          url: string;
          fileName: string;
        }> = [...initialMedia];

        const broadcast = () => {
          const event = new CustomEvent('e2e:media-updated', {
            detail: [...mediaStore],
          });
          window.dispatchEvent(event);
        };

        try {
          window.localStorage.setItem('mockBrandId', brandId);
        } catch (error) {
          console.warn('Unable to persist mock brand id', error);
        }

        window.__E2E_MOCKS__ = {
          currentUser: {
            uid: 'e2e-user',
            email: 'e2e@example.com',
            getIdToken: async () => sessionToken,
          },
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
          getMediaAssets: currentBrandId =>
            mediaStore.filter(asset => asset.brandId === currentBrandId),
          subscribeToMediaUpdates: (currentBrandId, callback) => {
            const handler = (event: Event) => {
              const detail = (event as CustomEvent<typeof mediaStore>).detail;
              const relevant = detail.filter(
                asset => asset.brandId === currentBrandId
              );
              callback(relevant);
            };
            window.addEventListener(
              'e2e:media-updated',
              handler as EventListener
            );
            return () =>
              window.removeEventListener(
                'e2e:media-updated',
                handler as EventListener
              );
          },
          features: {
            watchtowersEnabled: false,
          },
        };
      },
      TEST_BRAND_ID ?? FALLBACK_BRAND_ID,
      SEEDED_MEDIA,
      SESSION_TOKEN
    );
    console.log('E2E: registered init script brand id', TEST_BRAND_ID ?? FALLBACK_BRAND_ID);
  });

  test('brand onboarding audit and save flow', async ({ page }) => {
    console.log('E2E: starting brand onboarding flow');
    await page.goto(`/brands/new`);

    await page.waitForSelector('#url');
    await page.fill('#url', 'https://brandmate.ai');
    await page.getByTestId('brand-audit-button').click();
    await expect(page.locator('[role="status"]', { hasText: 'Audit complete' })).toBeVisible();

    await page.fill('#industry', 'Retail');
    await page.fill('#competitors', 'https://comp-a.com, https://comp-b.com');
    await page.getByTestId('brand-save-button').click();

    await expect(page.locator('[role="status"]', { hasText: 'Brand saved' })).toBeVisible();
  });

  test('content generation via master chat', async ({ page }) => {
    console.log('E2E: starting master chat flow');
    await page.goto('/dashboard');

    await page.getByTestId('master-ai-chat-trigger').waitFor();
    await page.getByTestId('master-ai-chat-trigger').click({ force: true });
    await expect(page.getByTestId('master-ai-chat-panel')).toBeVisible();

    const prompt = 'Launch teaser social posts';
    await page.getByPlaceholder('What should we create today?').fill(prompt);
    await page.keyboard.press('Enter');

    await expect(page.getByText(`Generated concept for: ${prompt}`)).toBeVisible();
  });

  test('media uploader surfaces assets in the library', async ({ page }) => {
    console.log('E2E: starting media library flow');
    const brandIdForRoute = TEST_BRAND_ID ?? FALLBACK_BRAND_ID;
    const route = `/media-library/${brandIdForRoute}`;

    await page.goto(route);
    await Promise.race([
      page.waitForLoadState('networkidle'),
      page.waitForTimeout(5_000),
    ]);
    await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 0)));

    const resolvedBrandId = await page.evaluate(() =>
      window.localStorage.getItem('mockBrandId')
    );
    expect(resolvedBrandId).toBeTruthy();

    await expect(page.getByTestId('media-library')).toBeVisible();
    await expect(page.getByTestId('media-item').first()).toBeVisible({ timeout: 10_000 });

    const fileInput = page.locator('input[type="file"]');
    await fileInput.waitFor();
    await fileInput.setInputFiles({
      name: 'hero.png',
      mimeType: 'image/png',
      buffer: Buffer.from('test-image'),
    });

    await expect(
      page.locator('[data-testid="media-item"] img[alt="hero.png"]')
    ).toHaveCount(1);
  });

  test('watchtower actions hidden when feature flag is disabled', async ({ page }) => {
    console.log('E2E: verifying watchtower disabled state');
    await page.goto('/admin/dashboard');

    await expect(page.getByTestId('watchtower-actions')).toHaveCount(0);
    await expect(page.getByTestId('watchtower-toggle')).toHaveCount(0);
    await expect(page.getByTestId('watchtower-cta')).toHaveCount(0);
  });

  test('watchtower actions appear when feature flag is enabled', async ({ page }) => {
    console.log('E2E: verifying watchtower enabled state');
    await page.addInitScript(() => {
      if (!window.__E2E_MOCKS__) {
        window.__E2E_MOCKS__ = {};
      }
      window.__E2E_MOCKS__.features = {
        ...(window.__E2E_MOCKS__.features ?? {}),
        watchtowersEnabled: true,
      };
      window.__E2E_MOCKS__.watchtowers = {
        runCompetitorWatchtower: async () => ({
          status: 202,
          accepted: true,
          recorded: true,
        }),
        runTrendAndOpportunityRadar: async () => ({
          status: 202,
          accepted: true,
          recorded: true,
        }),
        runSyncAdPerformance: async () => ({
          status: 202,
          accepted: true,
          recorded: true,
        }),
      };
    });

    await page.goto('/admin/dashboard');

    await expect(page.getByTestId('watchtower-actions')).toBeVisible();
    await expect(page.getByTestId('watchtower-toggle')).toBeVisible();
    await expect(page.getByTestId('watchtower-cta')).toBeVisible();
    await expect(page.getByTestId('watchtower-action-trend')).toBeVisible();
    await expect(page.getByTestId('watchtower-action-ads')).toBeVisible();

    await page.getByTestId('watchtower-cta').click();

    await expect(page.getByText('status: 202')).toBeVisible();
  });
});
