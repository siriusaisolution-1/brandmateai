import { describe, expect, it, vi } from 'vitest';

vi.mock('../../genkit/ai', () => ({
  ai: {
    defineFlow: (_config: unknown, handler: (input: string) => unknown) => handler,
  },
  ensureGoogleGenAiApiKeyReady: vi.fn(),
}));

import { moderateTextFlow, _test } from './moderation';

const { detectCategories, moderateText } = _test;

describe('moderation flow', () => {
  it('marks neutral content as safe', async () => {
    const result = await moderateTextFlow('Hello, how are you?');
    expect(result).toEqual({ isSafe: true, categories: [] });
  });

  it('detects disallowed patterns across categories', () => {
    expect(detectCategories('This is explicit sexual content')).toContain('sexual');
    expect(detectCategories('I want to commit suicide')).toContain('self-harm');
    expect(detectCategories('That was a hate crime')).toContain('hate');
  });

  it('normalises text and returns structured response', () => {
    const result = moderateText('FUCK this violence!');
    expect(result.isSafe).toBe(false);
    expect(result.categories).toEqual(expect.arrayContaining(['profanity', 'violence']));
  });
});
