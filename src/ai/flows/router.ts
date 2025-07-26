import { defineFlow, run } from '@genkit-ai/flow';
import { z } from 'zod';
import { geminiPro } from '@genkit-ai/googleai';
import { generate } from '@genkit-ai/ai';

export const masterRouterFlow = defineFlow(
  {
    name: 'masterRouterFlow',
    inputSchema: z.object({
      prompt: z.string(),
      isFirstMessage: z.boolean().optional(),
    }),
    outputSchema: z.string(),
  },
  async (input) => {
    const { prompt, isFirstMessage } = input;

    // If it's the user's first message in the session, provide a warm, valuable welcome.
    if (isFirstMessage) {
      const welcomePrompt = `A new user has just signed up. Greet them warmly and provide three exciting, one-sentence ideas of what they can do with our platform, BrandMate AI. The ideas should cover brand analysis, content creation, and strategic planning.`;
      
      const llmResponse = await generate({
        model: geminiPro,
        prompt: welcomePrompt,
        config: { temperature: 0.7 },
      });

      return llmResponse.text();
    }

    // A simple keyword-based routing example.
    // This will be expanded significantly in the future.
    if (prompt.toLowerCase().includes('audit')) {
        return "It sounds like you want to perform a brand audit. To do this, please go to 'Brands' > 'New Brand' and enter the website URL you'd like to analyze."
    }

    // Default "echo" for now, can be expanded to a more intelligent general chat.
    const defaultPrompt = `The user said: "${prompt}". Acknowledge their message and ask how you can help them with their brand strategy or content creation.`;
    const llmResponse = await generate({
        model: geminiPro,
        prompt: defaultPrompt,
        config: { temperature: 0.5 },
      });

    return llmResponse.text();
  }
);
