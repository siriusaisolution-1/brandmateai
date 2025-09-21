import { ai } from '../../genkit/ai';
import { z } from 'zod';
export const moderateTextFlow = ai.defineFlow({
  name: 'moderateTextFlow',
  inputSchema: z.string(),
  outputSchema: z.object({ isSafe: z.boolean(), categories: z.array(z.string()) })
}, async (_text) => {
  // MIG-2 stub moderation: always safe
  return { isSafe: true, categories: [] };
});
