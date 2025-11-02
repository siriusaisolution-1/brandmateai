import { ai, ensureGoogleGenAiApiKeyReady } from '../../genkit/ai';
import { z } from 'zod';
export const manageAdsFlow = ai.defineFlow({
  name: 'manageAdsFlow',
  inputSchema: z.object({ eventId: z.string(), adAccountId: z.string() }),
  outputSchema: z.object({ status: z.string() })
}, async (_input) => {
  await ensureGoogleGenAiApiKeyReady();

  // MIG-2 stub: integrate DB + ad platform later
  return { status: 'queued' };
});
