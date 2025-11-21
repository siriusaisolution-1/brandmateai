import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../genkit/ai', () => {
  const defineFlow = (_config: unknown, handler: any) => handler;
  return {
    ai: { defineFlow },
    ensureGoogleGenAiApiKeyReady: vi.fn(),
  };
});

import { processContentRequestFlow } from './processContentRequestFlow';

const firebaseAdminMock = globalThis.__vitestFirebaseAdmin;

if (!firebaseAdminMock) {
  throw new Error('Firebase admin mock was not initialised');
}

vi.mock('../agents/copyAgent', () => ({
  generateCopyForContentBrief: vi.fn(async () => ({
    scenarios: [{ title: 'Scenario' }],
    hooks: ['Hook'],
    captions: ['Caption'],
    ctas: ['CTA'],
  })),
}));

vi.mock('../agents/visualAgent', () => ({
  generateImagesForContentBrief: vi.fn(async () => ({ outputs: [{ variantIndex: 0, prompt: 'img', url: 'url' }] })),
}));

vi.mock('../agents/videoAgent', () => ({
  generateVideosForContentBrief: vi.fn(async () => ({ outputs: [{ variantIndex: 0, prompt: 'vid', url: 'url' }] })),
}));

vi.mock('../repositories/outputRepo', () => ({
  createOutputsBatch: vi.fn(async (items: any[]) => items.map((item, index) => ({ ...item, id: `copy-${index}` }))),
  updateContentRequestStatus: vi.fn(async () => {}),
}));

describe('processContentRequestFlow', () => {
  beforeEach(() => {
    firebaseAdminMock.reset();
  });

  it('orchestrates request loading, agent calls and status updates', async () => {
    const { collection: collectionMock } = firebaseAdminMock.mocks;
    collectionMock.mockImplementation((name: string) => {
      if (name === 'contentRequests') {
        return {
          doc: vi.fn(() => ({
            id: 'req1',
            get: vi.fn().mockResolvedValue({
              exists: true,
              id: 'req1',
              data: () => ({ brandId: 'brand1', userId: 'user1', status: 'queued' }),
            }),
          })),
        } as unknown as ReturnType<typeof collectionMock>;
      }
      if (name === 'brands') {
        return {
          doc: vi.fn(() => ({
            id: 'brand1',
            get: vi.fn().mockResolvedValue({ exists: true, id: 'brand1', data: () => ({ name: 'Brand' }) }),
          })),
        } as unknown as ReturnType<typeof collectionMock>;
      }
      throw new Error(`Unexpected collection ${name}`);
    });

    const result = await processContentRequestFlow({ contentRequestId: 'req1', userId: 'user1' }, { context: {} as never });

    expect(result.requestId).toBe('req1');
    expect(result.outputsCount).toBeGreaterThan(0);
    expect(result.status).toBe('done');
  });
});
