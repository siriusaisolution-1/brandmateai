import { callFlow } from './shared';

export type WatchtowerRequest = {
  brandId?: string;
  triggeredBy?: 'manual' | 'schedule';
  dryRun?: boolean;
  metadata?: Record<string, unknown>;
};

export type WatchtowerResponse = {
  recorded: true;
};

export function buildWatchtowerRequest(
  overrides: WatchtowerRequest = {}
): WatchtowerRequest {
  return {
    triggeredBy: 'manual',
    dryRun: false,
    ...overrides,
  } satisfies WatchtowerRequest;
}

export async function runCompetitorWatchtower(
  input: WatchtowerRequest = {}
): Promise<WatchtowerResponse> {
  return callFlow<WatchtowerRequest, WatchtowerResponse>('competitorWatchtower', input);
}

export async function runTrendAndOpportunityRadar(
  input: WatchtowerRequest = {}
): Promise<WatchtowerResponse> {
  return callFlow<WatchtowerRequest, WatchtowerResponse>('trendAndOpportunityRadar', input);
}

export async function runSyncAdPerformance(
  input: WatchtowerRequest = {}
): Promise<WatchtowerResponse> {
  return callFlow<WatchtowerRequest, WatchtowerResponse>('syncAdPerformance', input);
}
