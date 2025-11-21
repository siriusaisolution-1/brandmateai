import { describe, expect, it, vi } from 'vitest';

import type { ContentBrief, GeneratedCopyBundle } from './types';
import { buildImagePrompt, generateImagesForContentBrief } from './visualAgent';

vi.mock('../repositories/outputRepo', () => ({
  createOutputsBatch: vi.fn(async (items: any[]) => items.map((item, index) => ({ ...item, id: `out-${index}` })) ),
}));

vi.mock('../providers/novitaImageProvider', () => ({
  generateNovitaImage: vi.fn(async ({ prompt }: { prompt: string }) => ({ url: `https://img/${prompt}`, storagePath: 'path' })),
}));

const brief: ContentBrief = {
  requestId: 'req',
  brandId: 'brand',
  userId: 'user',
  brandVoice: 'calm',
  platform: 'instagram',
  requestedImages: 2,
};

const copyBundle: GeneratedCopyBundle = {
  scenarios: [{ title: 'Launch' }],
  hooks: ['Hook'],
  captions: [],
  ctas: [],
};

describe('visualAgent', () => {
  it('builds prompts using copy bundle context', () => {
    const prompt = buildImagePrompt(brief, copyBundle, 0);
    expect(prompt).toContain('Launch');
    expect(prompt).toContain('instagram');
  });

  it('returns generated image outputs and persists them', async () => {
    const result = await generateImagesForContentBrief(brief, copyBundle);

    expect(result.outputs).toHaveLength(2);
    expect(result.outputs[0].prompt).toContain('Launch');
    expect(result.outputs[0].url).toContain('https://img');
  });
});
