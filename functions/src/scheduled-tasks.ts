import { analyzeCompetitorsFlow, generateIdeasFromTrendFlow } from './ai/flows/strategic-analysis';
import type { Brand } from './types/firestore';
export async function runScheduledAnalysis(brand: Brand){
  await (analyzeCompetitorsFlow as any).run({ brand, competitorUrls: [] });
}
export async function runTrendIdeas(brand: Brand){
  await (generateIdeasFromTrendFlow as any).run({ brand, campaigns: [] });
}
export { competitorWatchtower, trendAndOpportunityRadar, syncAdPerformance } from './competitor-watchtower';
