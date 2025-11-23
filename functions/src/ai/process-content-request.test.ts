import { beforeEach, describe, expect, it, vi } from 'vitest';

const firebaseAdminMock = globalThis.__vitestFirebaseAdmin;

if (!firebaseAdminMock) {
  throw new Error('Firebase admin mock missing');
}

const { collection: collectionMock, doc: docMock, set: setMock, get: getMock } = firebaseAdminMock.mocks;

docMock.mockImplementation(() => ({ get: getMock, set: setMock }));
collectionMock.mockImplementation(() => ({ doc: docMock }));

import { processContentRequest } from './process-content-request';
import { PLAN_DEFINITIONS } from '../billing/plans';

describe('processContentRequest', () => {
  beforeEach(() => {
    firebaseAdminMock.reset();
    vi.clearAllMocks();
  });

  it('blocks requests that exceed limits without running agents', async () => {
    getMock.mockResolvedValue({ exists: true, data: () => ({ videosGenerated: 19, imagesGenerated: 0, requestsProcessed: 0 }) });
    const runAgents = vi.fn();

    const result = await processContentRequest({
      payload: { id: 'req-1', userId: 'user-1', brandId: 'brand-1', requestedVideos: 5 },
      loadUser: async () => ({ id: 'user-1', subscriptionPlan: 'starter' } as any),
      runAgents,
    });

    expect(result.allowed).toBe(false);
    expect(result.reason).toBe('videos_limit');
    expect(runAgents).not.toHaveBeenCalled();
    expect(collectionMock).toHaveBeenCalledWith('contentRequests');
    expect(setMock).toHaveBeenCalledWith({
      status: 'blocked_limit',
      limitReason: 'videos_limit',
      remaining: expect.objectContaining({ videos: PLAN_DEFINITIONS.starter.limits.maxVideosPerMonth - 19 }),
    }, { merge: true });
  });

  it('runs agents and increments usage when under limits', async () => {
    getMock.mockResolvedValue({ exists: true, data: () => ({ videosGenerated: 0, imagesGenerated: 0, requestsProcessed: 0 }) });
    const runAgents = vi.fn().mockResolvedValue({ videosGenerated: 2, imagesGenerated: 3 });

    const result = await processContentRequest({
      payload: { id: 'req-2', userId: 'user-9', brandId: 'brand-9', requestedVideos: 2, requestedImages: 3 },
      loadUser: async () => ({ id: 'user-9', subscriptionPlan: 'pro' } as any),
      runAgents,
    });

    expect(result.allowed).toBe(true);
    expect(runAgents).toHaveBeenCalled();
    expect(collectionMock).toHaveBeenCalledWith('usageSnapshots');
    expect(collectionMock).toHaveBeenCalledWith('contentRequests');
    expect(setMock).toHaveBeenCalledWith(expect.objectContaining({ usageRecorded: true }), { merge: true });
  });
});
