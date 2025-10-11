import { describe, expect, it, beforeEach, vi } from 'vitest';

const {
  setMock,
  docMock,
  collectionMock,
  incrementMock,
  serverTimestampMock,
} = vi.hoisted(() => {
  const set = vi.fn();
  const doc = vi.fn(() => ({ set }));
  const collection = vi.fn(() => ({ doc }));
  const increment = vi.fn((value: number) => value);
  const serverTimestamp = vi.fn(() => 'timestamp');
  return {
    setMock: set,
    docMock: doc,
    collectionMock: collection,
    incrementMock: increment,
    serverTimestampMock: serverTimestamp,
  };
});

vi.mock('firebase-admin', () => {
  const firestore = () => ({ collection: collectionMock });
  (firestore as unknown as { FieldValue: unknown }).FieldValue = {
    increment: incrementMock,
    serverTimestamp: serverTimestampMock,
  };

  return {
    __esModule: true,
    default: {
      apps: [],
      initializeApp: vi.fn(),
      firestore,
    },
    apps: [],
    initializeApp: vi.fn(),
    firestore,
  };
});

import { trackAiCall, _test } from './ai-usage-tracker';

const { extractUsage } = _test;

describe('ai-usage-tracker', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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

  it('increments firestore counters when usage is present', async () => {
    await trackAiCall('user-123', {
      usage: { inputTokens: 3, outputTokens: 2 },
    });

    expect(collectionMock).toHaveBeenCalledWith('aiUsage');
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
    expect(incrementMock).toHaveBeenCalledWith(5);
    expect(incrementMock).toHaveBeenCalledWith(3);
    expect(incrementMock).toHaveBeenCalledWith(2);
  });
});
