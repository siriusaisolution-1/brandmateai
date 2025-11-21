import { beforeEach, describe, expect, it, vi } from 'vitest';

const firebaseAdminMock = globalThis.__vitestFirebaseAdmin;

if (!firebaseAdminMock) {
  throw new Error('Firebase admin mock missing');
}

const { collection: collectionMock, doc: docMock, set: setMock, get: getMock, FieldValue } = firebaseAdminMock.mocks;

docMock.mockImplementation(() => ({ get: getMock, set: setMock }));
collectionMock.mockImplementation(() => ({ doc: docMock }));

import { PLAN_DEFINITIONS } from './plans';
import { getCurrentYearMonth, getOrCreateUsageSnapshot, incrementUsage, getUsageAndLimits } from './usage';

describe('billing usage helpers', () => {
  beforeEach(() => {
    firebaseAdminMock.reset();
    vi.clearAllMocks();
  });

  it('computes current yearMonth in UTC', () => {
    const fixed = new Date(Date.UTC(2025, 10, 5));
    expect(getCurrentYearMonth(fixed)).toBe('2025-11');
  });

  it('creates an empty usage snapshot when one does not exist', async () => {
    getMock.mockResolvedValueOnce({ exists: false });

    const snapshot = await getOrCreateUsageSnapshot('user-1', 'brand-1', '2024-12');

    expect(collectionMock).toHaveBeenCalledWith('usageSnapshots');
    expect(docMock).toHaveBeenCalledWith('user-1:brand-1:2024-12');
    expect(setMock).toHaveBeenCalledWith({
      userId: 'user-1',
      brandId: 'brand-1',
      yearMonth: '2024-12',
      videosGenerated: 0,
      imagesGenerated: 0,
      requestsProcessed: 0,
      updatedAt: 'timestamp',
    });
    expect(snapshot.videosGenerated).toBe(0);
    expect(snapshot.imagesGenerated).toBe(0);
  });

  it('merges incremental counters when incrementing usage', async () => {
    await incrementUsage({ userId: 'user-9', brandId: 'brand-9', videosDelta: 2, imagesDelta: 3, requestsDelta: 4 });

    expect(collectionMock).toHaveBeenCalledWith('usageSnapshots');
    expect(docMock).toHaveBeenCalledWith(expect.stringContaining('user-9:brand-9'));
    expect(setMock).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-9',
        brandId: 'brand-9',
        videosGenerated: FieldValue.increment(2),
        imagesGenerated: FieldValue.increment(3),
        requestsProcessed: FieldValue.increment(4),
      }),
      { merge: true },
    );
  });

  it('returns limits alongside usage for a given user', async () => {
    getMock.mockResolvedValueOnce({ exists: true, data: () => ({ videosGenerated: 1, imagesGenerated: 2, requestsProcessed: 3 }) });

    const { usage, limits } = await getUsageAndLimits({ id: 'u-1', subscriptionPlan: 'pro' } as any, 'brand-77');

    expect(usage.videosGenerated).toBe(1);
    expect(limits).toEqual(PLAN_DEFINITIONS.pro.limits);
  });
});
