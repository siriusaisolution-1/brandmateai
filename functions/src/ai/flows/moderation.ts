import { z } from 'zod';

import { ai, ensureGoogleGenAiApiKeyReady } from '../../genkit/ai';

const ModerationOutputSchema = z.object({ isSafe: z.boolean(), categories: z.array(z.string()) });

function normaliseText(text: string): string {
  return text.toLowerCase();
}

function detectCategories(text: string): string[] {
  const normalised = normaliseText(text);
  const categories: string[] = [];

  if (/sex|explicit|porn|nsfw/.test(normalised)) {
    categories.push('sexual');
  }
  if (/suicide|self-?harm|kill myself/.test(normalised)) {
    categories.push('self-harm');
  }
  if (/hate|racist|bigot/.test(normalised)) {
    categories.push('hate');
  }
  if (/violence|murder|attack/.test(normalised)) {
    categories.push('violence');
  }
  if (/fuck|shit|damn/.test(normalised)) {
    categories.push('profanity');
  }

  return Array.from(new Set(categories));
}

function moderateText(text: string) {
  const categories = detectCategories(text);
  return {
    isSafe: categories.length === 0,
    categories,
  } satisfies z.infer<typeof ModerationOutputSchema>;
}

export const moderateTextFlow = ai.defineFlow(
  {
    name: 'moderateTextFlow',
    inputSchema: z.string(),
    outputSchema: ModerationOutputSchema,
  },
  async (text) => {
    await ensureGoogleGenAiApiKeyReady();
    return moderateText(text);
  },
);

export const _test = { detectCategories, moderateText };

export default moderateTextFlow;

