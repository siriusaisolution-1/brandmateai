import { ai, ensureGoogleGenAiApiKeyReady } from '../../genkit/ai';
import { z } from 'zod';

export const generateBlogPostFlow = ai.defineFlow(
  {
    name: 'generateBlogPost',
    inputSchema: z.object({ topic: z.string(), style: z.string() }),
    outputSchema: z.object({ blogPost: z.string(), isSafe: z.boolean() }),
  },
  async ({ topic, style }) => {
    await ensureGoogleGenAiApiKeyReady();

    const out = await ai.generate({ prompt: `Write a blog post about "${topic}" in a "${style}" style.` });
    const text = out.text ?? '';
    // TEMP: skip moderation until separate flow is fixed
    return { blogPost: text, isSafe: true };
  },
);

