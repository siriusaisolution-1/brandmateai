import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../genkit/ai', () => ({
  ai: { generate: vi.fn() },
  ensureGoogleGenAiApiKeyReady: vi.fn(),
}));

import { ai } from '../../genkit/ai';
import { buildCopyAgentPrompt, generateCopyForContentBrief } from './copyAgent';
import type { ContentBrief } from './types';

const brief: ContentBrief = {
  requestId: 'req',
  brandId: 'brand',
  userId: 'user',
  brandName: 'BrandMate',
  brandVoice: 'playful',
  platform: 'instagram',
  topics: ['fitness'],
  requestedCopies: 2,
};

describe('copyAgent', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('builds a prompt with brand context', () => {
    const prompt = buildCopyAgentPrompt(brief);
    expect(prompt).toContain('Brand: BrandMate');
    expect(prompt).toContain('Tone: playful');
    expect(prompt).toContain('Platform: instagram');
    expect(prompt).toContain('Requested copies: 2');
  });

  it('parses structured copy bundle from model response', async () => {
    const mockPayload = {
      scenarios: [{ title: 'Story', outline: 'Outline' }],
      hooks: ['hook'],
      captions: ['caption'],
      ctas: ['cta'],
    };
    vi.spyOn(ai, 'generate').mockResolvedValue({ text: JSON.stringify(mockPayload) } as never);

    const result = await generateCopyForContentBrief(brief);

    expect(ai.generate).toHaveBeenCalled();
    expect(result.scenarios[0]).toEqual({ title: 'Story', outline: 'Outline' });
    expect(result.hooks).toEqual(['hook']);
    expect(result.captions).toEqual(['caption']);
    expect(result.ctas).toEqual(['cta']);
  });
});
