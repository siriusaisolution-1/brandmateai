import { ai } from '../../genkit/ai';
import { z } from 'zod';
export const generateNewsletterFlow = ai.defineFlow({
  name: 'generateNewsletter',
  inputSchema: z.object({ audience: z.string(), keyPoints: z.array(z.string()) }),
  outputSchema: z.object({ newsletterContent: z.string() })
}, async ({ audience, keyPoints }) => {
  const prompt = `Write a concise newsletter for audience: ${audience}. Cover key points: ${keyPoints.join(', ')}`;
  const out = await ai.generate({ prompt });
  return { newsletterContent: out.text ?? '' };
});
