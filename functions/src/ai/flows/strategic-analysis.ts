import { defineFlow, runFlow } from '@genkit-ai/flow';
import { z } from 'zod';
import { geminiPro } from '@genkit-ai/googleai';
import { generate } from '@genkit-ai/ai';
import { performBrandAuditFlow } from './brand-audit';
import { Brand, AdCampaign } from '@/types/firestore';
import { trackAiCall } from '../utils/ai-usage-tracker'; // <-- IMPORT TRACKER

// ... (Initialization and schemas are unchanged)

export const analyzeCompetitorsFlow = defineFlow(
  { /* ... */ },
  async ({ brand, competitorUrls }, context) => {
    // ... (logic for scraping is unchanged)
    
    const llmResponse = await generate({
        model: geminiPro,
        prompt,
        output: { format: 'json', schema: AnalysisReportSchema },
    });
    
    // Track the AI call usage
    await trackAiCall(context.auth!.uid, llmResponse);
    
    const report = llmResponse.output();
    if (!report) throw new Error("AI failed to generate a competitor analysis report.");
    return report;
  }
);

export const generateIdeasFromTrendFlow = defineFlow(
    { /* ... */ },
    async ({ brand, newsArticle }, context) => {
        // ... (logic for creating prompt is unchanged)

        const llmResponse = await generate({
            model: geminiPro,
            prompt,
            output: { format: 'json', schema: TrendAnalysisSchema },
        });
        
        // Track the AI call usage
        await trackAiCall(context.auth!.uid, llmResponse);

        const ideas = llmResponse.output();
        if (!ideas) throw new Error("The AI failed to generate ideas from the trend.");
        return ideas;
    }
);

export const generatePerformanceInsightsFlow = defineFlow(
    { /* ... */ },
    async ({ brand, campaigns }, context) => {
        // ... (logic for creating prompt is unchanged)

        const llmResponse = await generate({
            model: geminiPro,
            prompt,
            output: { format: 'json', schema: PerformanceInsightsSchema },
        });

        // Track the AI call usage
        await trackAiCall(context.auth!.uid, llmResponse);

        const insights = llmResponse.output();
        if (!insights) throw new Error("The AI failed to generate performance insights.");
        return insights;
    }
);
