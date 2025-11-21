import { ai, ensureGoogleGenAiApiKeyReady } from '../../genkit/ai';
import { z } from 'zod';

export const moderateTextFlow = ai.defineFlow(
  {
    name: 'moderateTextFlow',
    inputSchema: z.string(),
    outputSchema: z.object({ isSafe: z.boolean(), categories: z.array(z.string()) }),
  },
  async (_text) => {
    await ensureGoogleGenAiApiKeyReady();
    return moderateText(_text);
  },
);

export function detectCategories(text: string): string[] {
  const lower = text.toLowerCase();
  const categories: string[] = [];
  if (/(violence|violent|attack)/.test(lower)) categories.push('violence');
  if (/(sexual|explicit)/.test(lower)) categories.push('sexual');
  if (/(suicide|self-harm)/.test(lower)) categories.push('self-harm');
  if (/(hate|racist)/.test(lower)) categories.push('hate');
  if (/fuck|shit|damn/.test(lower)) categories.push('profanity');
  return categories;
}

export function moderateText(text: string) {
  const categories = detectCategories(text);
  return { isSafe: categories.length === 0, categories };
}

export const _test = { detectCategories, moderateText };

