import { beforeEach, describe, expect, it, vi } from 'vitest';

const structuredLoggerMock = vi.hoisted(() => ({
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  debug: vi.fn(),
}));

vi.mock('./observability', () => ({
  structuredLogger: structuredLoggerMock,
}));

const firebaseAdminMock = globalThis.__vitestFirebaseAdmin;

if (!firebaseAdminMock) {
  throw new Error('Firebase admin mock was not initialised');
}

const {
  collection: collectionMock,
  doc: docMock,
  set: setMock,
  FieldValue,
} = firebaseAdminMock.mocks;

import { trackAiCall, _test } from './ai-usage-tracker';

const { extractUsage } = _test;

describe('ai-usage-tracker', () => {
  beforeEach(() => {
    firebaseAdminMock.reset();
    vi.clearAllMocks();
    structuredLoggerMock.info.mockClear();
    structuredLoggerMock.warn.mockClear();
    structuredLoggerMock.error.mockClear();
    structuredLoggerMock.debug.mockClear();
  });

  it('coerces missing usage fields to zero', () => {
    const usage = extractUsage({});
    expect(usage).toEqual({ totalTokens: 0, inputTokens: 0, outputTokens: 0 });
  });

  it('derives totals when input/output tokens are present', () => {
    const usage = extractUsage({
      usage: { inputTokens: 5, outputTokens: 7 },
    });

    expect(usage).toEqual({ totalTokens: 12, inputTokens: 5, outputTokens: 7 });
  });

  it('skips firestore writes when no tokens are recorded', async () => {
    await trackAiCall('user-123', {});

    expect(collectionMock).not.toHaveBeenCalled();
  });

  it('logs a warning when uid is missing', async () => {
    await trackAiCall('', {});

    expect(structuredLoggerMock.warn).toHaveBeenCalledWith(
      '[ai-usage-tracker] trackAiCall invoked without uid',
      expect.objectContaining({ flow: 'aiUsage.trackAiCall' }),
    );
    expect(collectionMock).not.toHaveBeenCalled();
  });

  it('records usage counters and audit document when usage is present', async () => {
    await trackAiCall(
      'user-123',
      {
        usage: { inputTokens: 3, outputTokens: 2 },
      },
      { flow: 'generateNewsletterFlow', latencyMs: 1200 }
    );

    expect(collectionMock).toHaveBeenCalledWith('aiUsage');
    expect(collectionMock).toHaveBeenCalledWith('aiCalls');
    expect(docMock).toHaveBeenCalledWith('user-123');
    expect(setMock).toHaveBeenCalledWith(
      {
        totalTokens: 5,
        inputTokens: 3,
        outputTokens: 2,
        lastRecordedAt: 'timestamp',
      },
      { merge: true },
    );
    expect(FieldValue.increment).toHaveBeenCalledWith(5);
    expect(FieldValue.increment).toHaveBeenCalledWith(3);
    expect(FieldValue.increment).toHaveBeenCalledWith(2);
    expect(FieldValue.serverTimestamp).toHaveBeenCalledTimes(2);
  });

  it('records latency metrics even when no tokens are tracked', async () => {
    await trackAiCall(
      'user-456',
      {},
      { latencyMs: 450, metadata: { reason: 'cache-miss' } },
    );

    expect(collectionMock).toHaveBeenCalledWith('aiCalls');
    expect(collectionMock).not.toHaveBeenCalledWith('aiUsage');
    expect(setMock).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-456',
        latencyMs: 450,
        metadata: { reason: 'cache-miss' },
      }),
    );
    expect(FieldValue.serverTimestamp).toHaveBeenCalledTimes(1);
  });
});
