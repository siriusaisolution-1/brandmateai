import { ai } from '../../genkit/ai';
import { z } from 'zod';
export const BrandInputSchema = z.object({ name: z.string(), logoUrl: z.string().optional().default(''), colors: z.array(z.string()).optional().default([]), fonts: z.array(z.string()).optional().default([]), brandVoice: z.string().optional().default(''), keyInfo: z.string().optional().default(''), industry: z.string().optional(), competitorWebsites: z.array(z.string()).optional() });
export const manageBrandFlow = ai.defineFlow({
  name: 'manageBrandFlow',
  inputSchema: BrandInputSchema,
  outputSchema: z.object({ brandId: z.string() })
}, async (_input) => {
  // MIG-2 stub: persist to Firestore later
  return { brandId: 'stub-brand' };
});
export const uploadMediaAssetFlow = ai.defineFlow({
  name: 'uploadMediaAssetFlow',
  inputSchema: z.object({ brandId: z.string(), fileName: z.string() }),
  outputSchema: z.object({ assetId: z.string() })
}, async (_input) => {
  return { assetId: 'stub-asset' };
});
