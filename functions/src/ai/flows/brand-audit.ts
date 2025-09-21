import { ai } from '../../genkit/ai';
import { z } from 'zod';
import { scrapeWebsiteForBrandInfo } from '../../tools/scraper';
export const BrandAuditInputSchema = z.object({ url: z.string().url(), brandId: z.string() });
export const BrandAuditOutputSchema = z.object({ report: z.string(), name: z.string(), brandVoice: z.string(), keyInfo: z.string(), suggestedColors: z.array(z.string()) });
export const brandAuditFlow = ai.defineFlow({
  name: 'brandAuditFlow', inputSchema: BrandAuditInputSchema, outputSchema: BrandAuditOutputSchema
}, async ({ url }) => {
  let scraped = { textContent: '', colors: [] as string[] };
  try{ scraped = await scrapeWebsiteForBrandInfo(url); }catch{}
  const prompt = `Analyze this brand website (${url}). Use this content (may be partial):\\n${scraped.textContent}\\nReturn JSON with report,name,brandVoice,keyInfo,suggestedColors.`;
  const out = await ai.generate({ prompt, output: { format: 'json', schema: BrandAuditOutputSchema } });
  return out.output ?? { report: '', name: '', brandVoice: '', keyInfo: '', suggestedColors: [] };
});
