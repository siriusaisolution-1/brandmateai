import { describe, expect, it, vi } from 'vitest';

import type { ContentBrief, GeneratedCopyBundle } from './types';
import { buildVideoPrompt, generateVideosForContentBrief } from './videoAgent';

vi.mock('../repositories/outputRepo', () => ({
  createOutputsBatch: vi.fn(async (items: any[]) => items.map((item, index) => ({ ...item, id: `v-${index}` })) ),
}));

vi.mock('../providers/novitaVideoProvider', () => ({
  generateNovitaVideo: vi.fn(async ({ prompt }: { prompt: string }) => ({
    url: `https://video/${prompt}`,
    storagePath: 'video-path',
    durationSec: 8,
  })),
}));

const brief: ContentBrief = {
  requestId: 'req',
  brandId: 'brand',
  userId: 'user',
  brandVoice: 'bold',
  platform: 'tiktok',
  requestedVideos: 1,
};

const copyBundle: GeneratedCopyBundle = {
  scenarios: [{ title: 'Big reveal' }],
  hooks: [],
  captions: [],
  ctas: [],
};

describe('videoAgent', () => {
  it('builds prompt using copy bundle context', () => {
    const prompt = buildVideoPrompt(brief, copyBundle);
    expect(prompt).toContain('Big reveal');
    expect(prompt).toContain('tiktok');
  });

  it('returns generated video outputs and persists them', async () => {
    const result = await generateVideosForContentBrief(brief, copyBundle);

    expect(result.outputs).toHaveLength(1);
    expect(result.outputs[0].prompt).toContain('Big reveal');
    expect(result.outputs[0].url).toContain('https://video/');
  });
});
