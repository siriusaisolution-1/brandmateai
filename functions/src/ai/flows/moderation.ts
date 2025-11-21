import { ai, ensureGoogleGenAiApiKeyReady } from '../../genkit/ai';
import { z } from 'zod';

const CATEGORY_PATTERNS: Record<string, RegExp> = {
  profanity: /fuck|shit|damn|bitch/i,
  violence: /violence|violent|kill|murder|attack/i,
  sexual: /sexual|explicit|nsfw|porn/i,
  'self-harm': /suicide|self-harm|self harm|kill myself/i,
  hate: /hate|racist|bigot|supremacist/i,
};

function detectCategories(text: string): string[] {
  const normalised = text.toLowerCase();
  return Object.entries(CATEGORY_PATTERNS)
    .filter(([, pattern]) => pattern.test(normalised))
    .map(([category]) => category);
}

function moderateText(text: string) {
  const categories = detectCategories(text);
  return { isSafe: categories.length === 0, categories };
}

export const moderateTextFlow = ai.defineFlow(
  {
    name: 'moderateTextFlow',
    inputSchema: z.string(),
    outputSchema: z.object({ isSafe: z.boolean(), categories: z.array(z.string()) }),
  },
  async (input) => {
    await ensureGoogleGenAiApiKeyReady();
    return moderateText(input);
  },
);

export const _test = {
  detectCategories,
  moderateText,
};

