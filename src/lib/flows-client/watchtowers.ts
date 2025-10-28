import { callFlow } from './shared';

export type WatchtowerRequest = {
  brandId?: string;
  triggeredBy?: 'manual' | 'schedule';
  dryRun?: boolean;
  metadata?: Record<string, unknown>;
};

export type WatchtowerResponse = {
  status: 202;
  accepted: true;
  recorded: true;
  message?: string;
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

function getE2EMocks() {
  if (typeof window === 'undefined') {
    return null;
  }

  return window.__E2E_MOCKS__ ?? null;
}

function ensureResponseShape(response: WatchtowerResponse): WatchtowerResponse {
  return {
    status: 202,
    accepted: true,
    recorded: true,
    message: response.message,
  } satisfies WatchtowerResponse;
}

export async function runCompetitorWatchtower(
  input: WatchtowerRequest = {}
): Promise<WatchtowerResponse> {
  const mock = getE2EMocks()?.watchtowers?.runCompetitorWatchtower;
  if (mock) {
    return ensureResponseShape(await mock(input));
  }

  return callFlow<WatchtowerRequest, WatchtowerResponse>('competitorWatchtower', input);
}

export async function runTrendAndOpportunityRadar(
  input: WatchtowerRequest = {}
): Promise<WatchtowerResponse> {
  const mock = getE2EMocks()?.watchtowers?.runTrendAndOpportunityRadar;
  if (mock) {
    return ensureResponseShape(await mock(input));
  }

  return callFlow<WatchtowerRequest, WatchtowerResponse>('trendAndOpportunityRadar', input);
}

export async function runSyncAdPerformance(
  input: WatchtowerRequest = {}
): Promise<WatchtowerResponse> {
  const mock = getE2EMocks()?.watchtowers?.runSyncAdPerformance;
  if (mock) {
    return ensureResponseShape(await mock(input));
  }

  return callFlow<WatchtowerRequest, WatchtowerResponse>('syncAdPerformance', input);
}
