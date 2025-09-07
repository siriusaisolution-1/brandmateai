import { ai } from '../../genkit/ai';
import { z } from 'zod';
import { pollNovitaTask } from '../../utils/novitaPoll';
export const checkVideoStatusFlow = ai.defineFlow({
  name: 'checkVideoStatusFlow',
  inputSchema: z.object({ taskId: z.string() }),
  outputSchema: z.object({ status: z.string(), videoUrl: z.string().optional() })
}, async ({ taskId }) => {
  return await pollNovitaTask(taskId);
});
