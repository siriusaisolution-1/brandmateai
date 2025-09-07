import { ai } from '../../genkit/ai';
import { z } from 'zod';
const RouterOutputSchema = z.object({ flow: z.string(), input: z.any() });
export const mainRouterFlow = ai.defineFlow({
  name: 'mainRouterFlow', inputSchema: z.string(), outputSchema: RouterOutputSchema
}, async (query) => {
  const prompt = `Route the user query to a flow. Query: ${query}. Return JSON {\"flow\": string, \"input\": object}.`;
  const out = await ai.generate({ prompt, output: { format: 'json', schema: RouterOutputSchema } });
  return out.output ?? { flow: 'error', input: {} };
});
