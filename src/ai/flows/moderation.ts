import { defineFlow } from '@genkit-ai/flow';
import { z } from 'zod';
import { moderate } from '@genkit-ai/ai';
import { googleAI } from '@genkit-ai/googleai';

export const moderateTextFlow = defineFlow(
  {
    name: 'moderateTextFlow',
    inputSchema: z.string(),
    outputSchema: z.object({
      isSafe: z.boolean(),
      categories: z.array(z.string()),
    }),
  },
  async (textToModerate) => {
    if (!textToModerate.trim()) {
        // If the text is empty, it's safe by default.
        return { isSafe: true, categories: [] };
    }
    
    // Use the built-in Genkit moderator with the Google AI provider
    const moderationResult = await moderate({
      moderator: googleAI(),
      input: textToModerate,
    });

    const flaggedCategories = moderationResult
      .filter(result => result.flagged)
      .map(result => result.category);

    const isSafe = flaggedCategories.length === 0;

    return {
      isSafe,
      categories: flaggedCategories,
    };
  }
);
