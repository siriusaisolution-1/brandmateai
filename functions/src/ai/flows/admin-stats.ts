import { ai, ensureGoogleGenAiApiKeyReady } from '../../genkit/ai';
import { z } from 'zod';
export const adminStatsFlow = ai.defineFlow({
  name: 'adminStatsFlow',
  inputSchema: z.object({}),
  outputSchema: z.object({ totalUsers: z.number(), totalBrands: z.number(), bmkSpentLast24h: z.number() })
}, async (_input) => {
  await ensureGoogleGenAiApiKeyReady();

  // TODO: hook to Firestore metrics
  return { totalUsers: 0, totalBrands: 0, bmkSpentLast24h: 0 };
});
