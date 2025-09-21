import { ai } from '../../genkit/ai';
import { z } from 'zod';
export const manageCalendarFlow = ai.defineFlow({
  name: 'manageCalendarFlow',
  inputSchema: z.object({ action: z.enum(['add','remove','list']), event: z.string().optional() }),
  outputSchema: z.object({ status: z.string(), events: z.array(z.string()).optional() })
}, async (input) => {
  if(input.action==='list') return { status: 'ok', events: [] };
  return { status: 'ok' };
});
