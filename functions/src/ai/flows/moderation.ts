// functions/src/ai/flows/moderation.ts
// Lightweight, provider-free moderation.
// Pure/local rules only, to keep tests deterministic and avoid upstream SDK issues.

import { z } from 'zod';

export const ModerationOutputSchema = z.object({
  isSafe: z.boolean(),
  categories: z.array(z.string()),
});

const CATEGORY_PATTERNS: Record<string, RegExp[]> = {
  sexual: [/sexual/i, /porn/i, /explicit/i, /nsfw/i, /sex/i],
  'self-harm': [/suicide/i, /self[- ]?harm/i, /kill myself/i],
  hate: [/hate/i, /racist/i, /bigot/i],
  violence: [/violence/i, /violent/i, /kill/i, /assault/i, /attack/i, /murder/i],
  profanity: [/\b(fuck|shit|damn)\b/i],
};

export function detectCategories(text: string): string[] {
  const normalised = text.toLowerCase();

  const categories = Object.entries(CATEGORY_PATTERNS)
    .filter(([, patterns]) => patterns.some((regex) => regex.test(normalised)))
    .map(([key]) => key);

  // De-dup, just in case multiple patterns map to same category
  return Array.from(new Set(categories));
}

export function moderateText(
  text: string,
): { isSafe: boolean; categories: string[] } {
  const categories = detectCategories(text);
  return {
    isSafe: categories.length === 0,
    categories,
  };
}

// Keep same exported name used elsewhere, but make it local/pure.
// Signature stays async for drop-in compatibility with callers.
export async function moderateTextFlow(
  text: string,
): Promise<z.infer<typeof ModerationOutputSchema>> {
  return ModerationOutputSchema.parse(moderateText(text));
}

// Test hooks
export const _test = {
  detectCategories,
  moderateText,
  ModerationOutputSchema,
};

export default moderateTextFlow;