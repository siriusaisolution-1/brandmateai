import * as admin from 'firebase-admin';

import { structuredLogger } from './observability';

if (!admin.apps.length) {
  admin.initializeApp();
}

const firestore = admin.firestore();
const { FieldValue } = admin.firestore;

type LlmUsage = Partial<{
  totalTokens: number;
  promptTokens: number;
  completionTokens: number;
  inputTokens: number;
  outputTokens: number;
}>;

type TrackableResult = {
  llmResponse?: { usage?: LlmUsage | null } | null;
  usage?: LlmUsage | null;
};

export interface TrackAiCallMetadata {
  flow?: string;
  model?: string;
  brandId?: string;
  latencyMs?: number;
  metadata?: Record<string, unknown>;
  estimatedCostUsd?: number;
}

function coerceTokens(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

function extractUsage(result: TrackableResult | null | undefined) {
  const usage = result?.llmResponse?.usage ?? result?.usage ?? undefined;

  const inputTokens = coerceTokens(usage?.promptTokens ?? usage?.inputTokens);
  const outputTokens = coerceTokens(usage?.completionTokens ?? usage?.outputTokens);
  const totalTokensRaw = coerceTokens(usage?.totalTokens);
  const totalTokens = totalTokensRaw || inputTokens + outputTokens;

  return { totalTokens, inputTokens, outputTokens };
}

const costPer1kTokensUsd = Number(process.env.AI_COST_PER_1K_TOKENS_USD ?? '0');

function calculateEstimatedCost(totalTokens: number, explicitCost?: number) {
  if (typeof explicitCost === 'number' && Number.isFinite(explicitCost) && explicitCost >= 0) {
    return explicitCost;
  }

  if (!Number.isFinite(costPer1kTokensUsd) || costPer1kTokensUsd <= 0) {
    return 0;
  }

  const cost = (totalTokens / 1000) * costPer1kTokensUsd;
  return Number.isFinite(cost) && cost > 0 ? cost : 0;
}

export async function trackAiCall(
  uid: string,
  result: TrackableResult | null | undefined,
  details: TrackAiCallMetadata = {}
): Promise<void> {
  if (!uid) {
    structuredLogger.warn('[ai-usage-tracker] trackAiCall invoked without uid', {
      traceId: null,
      userId: null,
      brandId: null,
      flow: 'aiUsage.trackAiCall',
      latencyMs: null,
    });
    return;
  }

  const { totalTokens, inputTokens, outputTokens } = extractUsage(result);

  const latencyMs = typeof details.latencyMs === 'number' ? details.latencyMs : undefined;

  if (totalTokens === 0 && inputTokens === 0 && outputTokens === 0 && typeof latencyMs !== 'number') {
    // zašto: nema metričkih podataka pa preskačemo zapis da izbegnemo prazne upise.
    return;
  }

  const updates: Promise<unknown>[] = [];

  if (totalTokens > 0 || inputTokens > 0 || outputTokens > 0) {
    updates.push(
      firestore.collection('aiUsage').doc(uid).set(
        {
          totalTokens: FieldValue.increment(totalTokens),
          inputTokens: FieldValue.increment(inputTokens),
          outputTokens: FieldValue.increment(outputTokens),
          lastRecordedAt: FieldValue.serverTimestamp(),
        },
        { merge: true },
      ),
    );
  }

  const callData: Record<string, unknown> = {
    userId: uid,
    flow: details.flow,
    model: details.model,
    brandId: details.brandId,
    totalTokens: totalTokens || undefined,
    inputTokens: inputTokens || undefined,
    outputTokens: outputTokens || undefined,
    latencyMs,
    metadata: details.metadata,
    createdAt: FieldValue.serverTimestamp(),
  };

  updates.push(
    firestore
      .collection('aiCalls')
      .doc()
      .set(Object.fromEntries(Object.entries(callData).filter(([, value]) => typeof value !== 'undefined'))),
  );

  const aggregateDay = new Date().toISOString().slice(0, 10);
  const aggregateKeyBrand = details.brandId && typeof details.brandId === 'string' ? details.brandId : 'unassigned';
  const aggregateDocId = `${uid}:${aggregateKeyBrand}:${aggregateDay}`;
  const aggregateData: Record<string, unknown> = {
    userId: uid,
    brandId: details.brandId ?? null,
    day: aggregateDay,
    callCount: FieldValue.increment(1),
    updatedAt: FieldValue.serverTimestamp(),
  };

  if (totalTokens > 0) {
    aggregateData.totalTokens = FieldValue.increment(totalTokens);
  }
  if (inputTokens > 0) {
    aggregateData.inputTokens = FieldValue.increment(inputTokens);
  }
  if (outputTokens > 0) {
    aggregateData.outputTokens = FieldValue.increment(outputTokens);
  }

  const estimatedCostUsd = calculateEstimatedCost(totalTokens, details.estimatedCostUsd);
  if (estimatedCostUsd > 0) {
    aggregateData.totalCostUsd = FieldValue.increment(Number(estimatedCostUsd.toFixed(6)));
  }

  updates.push(
    firestore
      .collection('aiUsageDaily')
      .doc(aggregateDocId)
      .set(aggregateData, { merge: true }),
  );

  await Promise.all(updates);
}

export const _test = {
  extractUsage,
  coerceTokens,
  calculateEstimatedCost,
};
