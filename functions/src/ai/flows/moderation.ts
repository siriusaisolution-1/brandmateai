import { z } from 'zod';

import { ai, ensureGoogleGenAiApiKeyReady } from '../../genkit/ai';

type ModerationCategory = 'sexual' | 'self-harm' | 'violence' | 'hate' | 'profanity';

const CATEGORY_PATTERNS: Record<ModerationCategory, RegExp[]> = {
  sexual: [/sexual/i, /explicit/i, /porn/i],
  'self-harm': [/suicide/i, /self[-\s]?harm/i, /kill myself/i],
  violence: [/violence/i, /attack/i, /murder/i, /kill (them|him|her)/i],
  hate: [/hate crime/i, /racist/i, /bigot/i],
  profanity: [/fuck/i, /shit/i, /damn/i],
};

export function normaliseText(input: string): string {
  return input.normalize('NFKC').trim();
}

export function detectCategories(input: string): ModerationCategory[] {
  const text = normaliseText(input).toLowerCase();
  const matches = new Set<ModerationCategory>();

  for (const [category, patterns] of Object.entries(CATEGORY_PATTERNS) as Array<[
    ModerationCategory,
    RegExp[],
  ]>) {
    if (patterns.some((pattern) => pattern.test(text))) {
      matches.add(category);
    }
  }

  return [...matches];
}

export function moderateText(input: string): { isSafe: boolean; categories: ModerationCategory[] } {
  const categories = detectCategories(input);
  return {
    isSafe: categories.length === 0,
    categories,
  };
}

export const moderateTextFlow = ai.defineFlow(
  {
    name: 'moderateTextFlow',
    inputSchema: z.string(),
    outputSchema: z.object({ isSafe: z.boolean(), categories: z.array(z.string()) }),
  },
  async (text) => {
    await ensureGoogleGenAiApiKeyReady();
    return moderateText(text);
  },
);

export const _test = {
  normaliseText,
  detectCategories,
  moderateText,
};
