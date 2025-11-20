import { z } from 'zod';

export const ModerationOutputSchema = z.object({ isSafe: z.boolean(), categories: z.array(z.string()) });

const CATEGORY_PATTERNS: Record<string, RegExp[]> = {
  profanity: [/\b(fuck|shit|damn)\b/i],
  violence: [/violence/i, /kill/i],
  sexual: [/sexual|explicit/i],
  'self-harm': [/suicide|self-harm/i],
  hate: [/hate/i],
};

export function detectCategories(text: string): string[] {
  const normalised = text.toLowerCase();
  return Object.entries(CATEGORY_PATTERNS)
    .filter(([, patterns]) => patterns.some((regex) => regex.test(normalised)))
    .map(([key]) => key);
}

export function moderateText(text: string): { isSafe: boolean; categories: string[] } {
  const categories = detectCategories(text);
  return { isSafe: categories.length === 0, categories };
}

export async function moderateTextFlow(text: string): Promise<z.infer<typeof ModerationOutputSchema>> {
  return moderateText(text);
}

export const _test = {
  detectCategories,
  moderateText,
};
