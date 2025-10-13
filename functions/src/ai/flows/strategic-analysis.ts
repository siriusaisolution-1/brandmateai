import { ai } from '../../genkit/ai';
import { z } from 'zod';
import type { Brand } from '../../types/firestore';

export const analyzeCompetitorsFlow = ai.defineFlow({
  name: 'analyzeCompetitorsFlow',
  inputSchema: z.object({
    brand: z.custom<Brand>(),
    competitorUrls: z.array(z.string()).default([])
  }),
  outputSchema: z.object({ report: z.string() })
}, async ({ brand, competitorUrls }) => {
  const prompt = `Analyze competitors for brand ${brand.name}. Competitors: ${competitorUrls.join(', ')}`;
  const out = await ai.generate({ prompt });
  return { report: out.text ?? '' };
});

export const generateIdeasFromTrendFlow = ai.defineFlow({
  name: 'generateIdeasFromTrendFlow',
  inputSchema: z.object({
    brand: z.custom<Brand>(),
    campaigns: z.array(z.string()).default([])
  }),
  outputSchema: z.object({ ideas: z.array(z.string()) })
}, async ({ brand, campaigns }) => {
  const prompt = `Generate 5 campaign ideas for brand ${brand.name} based on current trends. Existing: ${campaigns.join(', ')}`;
  const out = await ai.generate({ prompt });
  const text = out.text ?? '';
  const ideas = text
    .split(/\r?\n/)
    .map(s => s.trim())
    .filter(Boolean)
    .slice(0, 5);
  return { ideas };
});