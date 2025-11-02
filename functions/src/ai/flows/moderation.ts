import { z } from 'zod';

import { ai } from '../../genkit/ai';

const CATEGORY_RULES: Array<{
  category: string;
  patterns: RegExp[];
}> = [
  {
    category: 'self-harm',
    patterns: [/\bsuicide\b/i, /\bself[-\s]?harm\b/i, /kill myself/i],
  },
  {
    category: 'violence',
    patterns: [/\bkill\b/i, /\bmurder\b/i, /shoot you/i, /violence/i],
  },
  {
    category: 'sexual',
    patterns: [/explicit sexual/i, /porn/i, /nsfw/i],
  },
  {
    category: 'hate',
    patterns: [/\bslur\b/i, /\bhate crime\b/i, /\bnazi\b/i],
  },
  {
    category: 'profanity',
    patterns: [/\bfuck\b/i, /\bshit\b/i, /\basshole\b/i],
  },
];

const ModerateTextOutputSchema = z.object({
  isSafe: z.boolean(),
  categories: z.array(z.string()),
});

function detectCategories(text: string): string[] {
  const matches = new Set<string>();
  for (const rule of CATEGORY_RULES) {
    if (rule.patterns.some((pattern) => pattern.test(text))) {
      matches.add(rule.category);
    }
  }
  return Array.from(matches);
}

function moderateText(text: string) {
  const normalized = text.normalize('NFKC');
  const categories = detectCategories(normalized);
  return ModerateTextOutputSchema.parse({
    isSafe: categories.length === 0,
    categories,
  });
}

export const moderateTextFlow = ai.defineFlow(
  {
    name: 'moderateTextFlow',
    inputSchema: z.string().min(1),
    outputSchema: ModerateTextOutputSchema,
  },
  async (text) => moderateText(text),
);

export const _test = {
  detectCategories,
  moderateText,
  CATEGORY_RULES,
};
