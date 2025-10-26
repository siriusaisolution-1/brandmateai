import * as admin from 'firebase-admin';

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

export async function trackAiCall(
  uid: string,
  result: TrackableResult | null | undefined,
  details: TrackAiCallMetadata = {}
): Promise<void> {
  if (!uid) {
    console.warn('[ai-usage-tracker] trackAiCall invoked without uid');
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

  await Promise.all(updates);
}

export const _test = {
  extractUsage,
  coerceTokens,
};
