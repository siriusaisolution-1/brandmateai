import { ai, ensureGoogleGenAiApiKeyReady } from '../../genkit/ai';
import { z } from 'zod';

const CATEGORY_PATTERNS: Record<string, RegExp[]> = {
  sexual: [/(sexual|explicit|nsfw)/i],
  'self-harm': [/(suicide|self-harm|self harm)/i],
  hate: [/(hate|bigot|racist)/i],
  violence: [/(violence|attack|kill)/i],
  profanity: [/fuck|shit|damn/i],
};

function detectCategories(text: string): string[] {
  const matches: string[] = [];

  for (const [category, patterns] of Object.entries(CATEGORY_PATTERNS)) {
    if (patterns.some((pattern) => pattern.test(text))) {
      matches.push(category);
    }
  }

  return matches;
}

function moderateText(text: string) {
  const categories = detectCategories(text.toLowerCase());
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

