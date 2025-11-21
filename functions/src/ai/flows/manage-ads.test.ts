import { beforeEach, describe, expect, it, vi } from 'vitest';
import { HttpsError } from 'firebase-functions/v1/https';

vi.mock('../../genkit/ai', () => ({
  ai: {
    defineFlow: (_config: unknown, handler: (...args: unknown[]) => unknown) => handler,
  },
}));

const firebaseAdminMock = globalThis.__vitestFirebaseAdmin;

if (!firebaseAdminMock) {
  throw new Error('Firebase admin mock was not initialised');
}

const { collection: collectionMock, FieldValue } = firebaseAdminMock.mocks;

import { manageAdsFlow } from './manage-ads';

describe('manageAdsFlow', () => {
  beforeEach(() => {
    firebaseAdminMock.reset();
  });

  it('requires authentication', async () => {
    await expect(
      manageAdsFlow({ eventId: 'evt-1', adAccountId: 'act-1' }, { context: undefined as unknown as Record<string, unknown> })
    ).rejects.toThrowError(HttpsError);
  });

  it('rejects non-admin callers', async () => {
    const userDocGet = vi.fn().mockResolvedValue({
      exists: true,
      get: (field: string) => (field === 'role' ? 'user' : undefined),
    });

    collectionMock.mockImplementation((name: string) => {
      if (name === 'users') {
        return {
          doc: vi.fn(() => ({ get: userDocGet })),
          count: vi.fn(),
        };
      }
      if (name === 'adSyncRequests') {
        return {
          doc: vi.fn(() => ({ get: vi.fn(), set: vi.fn() })),
        };
      }
      if (name === 'operationsAudit') {
        return { add: vi.fn() };
      }
      throw new Error(`Unexpected collection ${name}`);
    });

    await expect(
      manageAdsFlow({ eventId: 'evt-2', adAccountId: 'act-9' }, { context: { auth: { uid: 'user-1' } } as Record<string, unknown> })
    ).rejects.toThrowError(/Only administrators/);
  });

  it('queues ad sync requests and writes audit entries', async () => {
    const setMock = vi.fn().mockResolvedValue(undefined);
    const auditAddMock = vi.fn().mockResolvedValue({ id: 'audit-1' });

    collectionMock.mockImplementation((name: string) => {
      if (name === 'users') {
        return {
          doc: vi.fn(() => ({
            get: vi.fn().mockResolvedValue({
              exists: true,
              get: (field: string) => (field === 'role' ? 'admin' : undefined),
            }),
          })),
        };
      }
      if (name === 'adSyncRequests') {
        const docMock = vi.fn(() => ({
          get: vi.fn().mockResolvedValue({ exists: false }),
          set: setMock,
        }));
        return {
          doc: docMock,
        };
      }
      if (name === 'operationsAudit') {
        return { add: auditAddMock };
      }
      throw new Error(`Unexpected collection ${name}`);
    });

    const response = await manageAdsFlow(
      { eventId: 'evt-queue', adAccountId: 'act-55', brandId: 'brand-1', notes: 'Sync nightly' },
      { context: { auth: { uid: 'admin-1' } } as Record<string, unknown> }
    );

    expect(response.status).toBe('queued');
    expect(response.requestId).toBe('evt-queue');
    expect(setMock).toHaveBeenCalledWith(
      expect.objectContaining({
        eventId: 'evt-queue',
        adAccountId: 'act-55',
        brandId: 'brand-1',
        requestedBy: 'admin-1',
        status: 'queued',
        createdAt: FieldValue.serverTimestamp(),
      }),
      { merge: false }
    );
    expect(auditAddMock).toHaveBeenCalledWith(
      expect.objectContaining({ referenceId: 'evt-queue', requestedBy: 'admin-1' })
    );
  });

  it('prevents duplicate queue entries', async () => {
    const setMock = vi.fn();

    collectionMock.mockImplementation((name: string) => {
      if (name === 'users') {
        return {
          doc: vi.fn(() => ({
            get: vi.fn().mockResolvedValue({
              exists: true,
              get: (field: string) => (field === 'role' ? 'admin' : undefined),
            }),
          })),
        };
      }
      if (name === 'adSyncRequests') {
        const docMock = vi.fn(() => ({
          get: vi.fn().mockResolvedValue({ exists: true }),
          set: setMock,
        }));
        return {
          doc: docMock,
        };
      }
      if (name === 'operationsAudit') {
        return { add: vi.fn() };
      }
      throw new Error(`Unexpected collection ${name}`);
    });

    await expect(
      manageAdsFlow(
        { eventId: 'evt-dup', adAccountId: 'act-1' },
        { context: { auth: { uid: 'admin-1' } } as Record<string, unknown> }
      )
    ).rejects.toThrowError(/already been queued/);
    expect(setMock).not.toHaveBeenCalled();
  });
});
