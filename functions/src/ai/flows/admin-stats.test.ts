import { beforeEach, describe, expect, it, vi } from 'vitest';
import { HttpsError } from 'firebase-functions/v1/https';

const firebaseAdminMock = globalThis.__vitestFirebaseAdmin;

if (!firebaseAdminMock) {
  throw new Error('Firebase admin mock was not initialised');
}

const { collection: collectionMock } = firebaseAdminMock.mocks;

import { adminStatsFlow } from './admin-stats';

function createUserDoc(role: string | null) {
  return {
    get: vi.fn().mockImplementation((field: string) => (field === 'role' ? role : undefined)),
    exists: role !== null,
  };
}

describe('adminStatsFlow', () => {
  beforeEach(() => {
    firebaseAdminMock.reset();
  });

  it('requires authentication', async () => {
    await expect(adminStatsFlow({}, { context: undefined as unknown as Record<string, unknown> }))
      .rejects.toThrowError(HttpsError);
  });

  it('rejects non-admin users', async () => {
    const userDoc = createUserDoc('user');
    collectionMock.mockImplementation((name: string) => {
      if (name === 'users') {
        return {
          doc: vi.fn(() => ({ get: vi.fn().mockResolvedValue(userDoc) })),
          count: vi.fn(() => ({ get: vi.fn().mockResolvedValue({ data: () => ({ count: 2 }) }) })),
        };
      }
      if (name === 'brands') {
        return {
          count: vi.fn(() => ({ get: vi.fn().mockResolvedValue({ data: () => ({ count: 1 }) }) })),
        };
      }
      if (name === 'bmkLedger') {
        const whereMock = vi.fn();
        const query = {
          where: whereMock,
          get: vi.fn().mockResolvedValue({ docs: [] }),
        } as const;
        whereMock.mockReturnValue(query);
        return query;
      }
      throw new Error(`Unexpected collection ${name}`);
    });

    await expect(
      adminStatsFlow({}, { context: { auth: { uid: 'user-123' } } as Record<string, unknown> })
    ).rejects.toThrowError(/Admin access is required/);
  });

  it('returns aggregated metrics for admins', async () => {
    const userDoc = createUserDoc('admin');
    const userCountGet = vi.fn().mockResolvedValue({ data: () => ({ count: 7 }) });
    const brandCountGet = vi.fn().mockResolvedValue({ data: () => ({ count: 4 }) });
    const ledgerDocs = [
      { data: () => ({ amount: 12 }) },
      { data: () => ({ amount: 8.5 }) },
      { data: () => ({ amount: 'ignored' }) },
    ];

    collectionMock.mockImplementation((name: string) => {
      if (name === 'users') {
        return {
          doc: vi.fn(() => ({ get: vi.fn().mockResolvedValue(userDoc) })),
          count: vi.fn(() => ({ get: userCountGet })),
        };
      }
      if (name === 'brands') {
        return {
          count: vi.fn(() => ({ get: brandCountGet })),
        };
      }
      if (name === 'bmkLedger') {
        const whereMock = vi.fn();
        const query = {
          where: whereMock,
          get: vi.fn().mockResolvedValue({ docs: ledgerDocs }),
        } as const;
        whereMock.mockReturnValue(query);
        return query;
      }
      throw new Error(`Unexpected collection ${name}`);
    });

    const result = await adminStatsFlow({}, { context: { auth: { uid: 'admin-1' } } as Record<string, unknown> });

    expect(result).toEqual({
      totalUsers: 7,
      totalBrands: 4,
      bmkSpentLast24h: 20.5,
    });
    expect(userCountGet).toHaveBeenCalled();
    expect(brandCountGet).toHaveBeenCalled();
  });
});
