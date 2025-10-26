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

export async function trackAiCall(uid: string, result: TrackableResult | null | undefined): Promise<void> {
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

  if (totalTokens === 0 && inputTokens === 0 && outputTokens === 0) {
    // zašto: nema metričkih podataka pa preskačemo zapis da izbegnemo prazne upise.
    return;
  }

  await firestore.collection('aiUsage').doc(uid).set(
    {
      totalTokens: FieldValue.increment(totalTokens),
      inputTokens: FieldValue.increment(inputTokens),
      outputTokens: FieldValue.increment(outputTokens),
      lastRecordedAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  );
}

export const _test = {
  extractUsage,
  coerceTokens,
};
