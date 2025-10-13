// zašto: scheduled tasks must invoke the backend flow implementations, not the Next.js copies.
import { analyzeCompetitorsFlow, generateIdeasFromTrendFlow } from './ai/flows/strategic-analysis';
import type { Brand } from './types/firestore';

export async function runScheduledAnalysis(brand: Brand) {
  await analyzeCompetitorsFlow.run({ brand, competitorUrls: [] });
}

export async function runTrendIdeas(brand: Brand) {
  await generateIdeasFromTrendFlow.run({ brand, campaigns: [] });
}

export { competitorWatchtower, trendAndOpportunityRadar, syncAdPerformance } from './competitor-watchtower';
