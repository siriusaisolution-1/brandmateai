import { ai, ensureGoogleGenAiApiKeyReady } from '../../genkit/ai';
import { z } from 'zod';

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  profanity: ['fuck', 'shit'],
  violence: ['violence', 'kill'],
  hate: ['hate crime', 'hate'],
  sexual: ['sexual'],
  'self-harm': ['suicide', 'self harm'],
};

export function detectCategories(text: string): string[] {
  const normalised = text.toLowerCase();
  return Object.entries(CATEGORY_KEYWORDS)
    .filter(([, keywords]) => keywords.some((keyword) => normalised.includes(keyword)))
    .map(([category]) => category);
}

export function moderateText(text: string): { isSafe: boolean; categories: string[] } {
  const categories = detectCategories(text);
  return { isSafe: categories.length === 0, categories };
}

export const moderateTextFlow = ai.defineFlow(
  {
    name: 'moderateTextFlow',
    inputSchema: z.string(),
    outputSchema: z.object({ isSafe: z.boolean(), categories: z.array(z.string()) }),
  },
  async (inputText) => {
    await ensureGoogleGenAiApiKeyReady();
    return moderateText(inputText);
  },
);

export const _test = {
  detectCategories,
  moderateText,
};

