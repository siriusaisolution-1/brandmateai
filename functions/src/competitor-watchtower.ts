import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { HttpsError } from 'firebase-functions/v1/https';
import { z } from 'zod';

import { instrumentCallable, structuredLogger } from './utils/observability';

const firestore = admin.firestore();
const WatchtowerAuditCollection = firestore.collection('watchtowerAudit');
const { FieldValue } = admin.firestore;

const watchtowerPayloadSchema = z.object({
  brandId: z.string().optional(),
  triggeredBy: z.enum(['schedule', 'manual']).default('manual'),
  dryRun: z.boolean().default(false),
  metadata: z.record(z.unknown()).optional(),
});

type WatchtowerPayload = z.infer<typeof watchtowerPayloadSchema>;

type WatchtowerAction =
  | 'competitorWatchtower'
  | 'trendAndOpportunityRadar'
  | 'syncAdPerformance';

type WatchtowerFunctionResponse = {
  status: 202;
  accepted: true;
  recorded: true;
  message: string;
};

const actionLabels: Record<WatchtowerAction, string> = {
  competitorWatchtower: 'Competitor watchtower',
  trendAndOpportunityRadar: 'Trend & Opportunity Radar watchtower',
  syncAdPerformance: 'Ad performance sync',
};

function extractBrandId(payload: unknown): string | null {
  if (!payload || typeof payload !== 'object') {
    return null;
  }
  const candidate = (payload as { brandId?: unknown }).brandId;
  return typeof candidate === 'string' && candidate.length > 0 ? candidate : null;
}

function parsePayload(action: WatchtowerAction, rawPayload: unknown): WatchtowerPayload {
  const parsed = watchtowerPayloadSchema.safeParse(rawPayload ?? {});
  if (!parsed.success) {
    structuredLogger.warn(`[watchtower] ${action} received invalid payload`, {
      flow: action,
      brandId: null,
      userId: null,
      issues: parsed.error.flatten(),
    });
    throw new HttpsError('invalid-argument', `Invalid payload supplied for ${action}`);
  }
  return parsed.data;
}

async function writeAuditEntry(
  action: WatchtowerAction,
  payload: WatchtowerPayload,
  requestedBy: string | null
): Promise<void> {
  await WatchtowerAuditCollection.add({
    action,
    brandId: payload.brandId ?? null,
    requestedBy,
    triggeredBy: payload.triggeredBy ?? 'manual',
    dryRun: payload.dryRun ?? false,
    metadata: payload.metadata ?? null,
    createdAt: FieldValue.serverTimestamp(),
  });

  structuredLogger.info(`[watchtower] ${action} recorded`, {
    flow: action,
    brandId: payload.brandId ?? null,
    userId: requestedBy,
  });
}

async function handleWatchtowerInvocation(
  action: WatchtowerAction,
  rawPayload: unknown,
  context: functions.https.CallableContext
): Promise<WatchtowerFunctionResponse> {
  const payload = parsePayload(action, rawPayload);
  const requestedBy = context.auth?.uid ?? null;

  if (!requestedBy) {
    structuredLogger.warn(`[watchtower] ${action} blocked unauthenticated call`, {
      flow: action,
      brandId: payload.brandId ?? null,
      userId: null,
    });
    throw new HttpsError('unauthenticated', 'Authentication is required to trigger watchtowers.');
  }

  await writeAuditEntry(action, payload, requestedBy);
  return {
    status: 202,
    accepted: true,
    recorded: true,
    message: `${actionLabels[action]} accepted for processing.`,
  } satisfies WatchtowerFunctionResponse;
}

export const competitorWatchtower = instrumentCallable(
  'competitorWatchtower',
  async (payload, context) => handleWatchtowerInvocation('competitorWatchtower', payload, context),
  {
    flow: 'competitorWatchtower',
    getBrandId: extractBrandId,
  }
);

export const trendAndOpportunityRadar = instrumentCallable(
  'trendAndOpportunityRadar',
  async (payload, context) => handleWatchtowerInvocation('trendAndOpportunityRadar', payload, context),
  {
    flow: 'trendAndOpportunityRadar',
    getBrandId: extractBrandId,
  }
);

export const syncAdPerformance = instrumentCallable(
  'syncAdPerformance',
  async (payload, context) => handleWatchtowerInvocation('syncAdPerformance', payload, context),
  {
    flow: 'syncAdPerformance',
    getBrandId: extractBrandId,
  }
);
