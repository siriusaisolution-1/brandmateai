// functions/src/ai/flows/admin-stats.ts
import { CollectionReference, Query, getFirestore } from 'firebase-admin/firestore';
import { HttpsError } from 'firebase-functions/v1/https';
import { z } from 'zod';

import { extractAuthUserId } from '../../utils/flow-context';

type FirestoreLike = ReturnType<typeof getFirestore>;

/**
 * Test-friendly DB accessor.
 * In Vitest, __vitestFirebaseAdmin.mocks.collection is injected so we avoid loading real Admin SDK.
 */
function getDb(): FirestoreLike {
  const mockCollection = (
    globalThis as {
      __vitestFirebaseAdmin?: { mocks?: { collection?: FirestoreLike['collection'] } };
    }
  ).__vitestFirebaseAdmin?.mocks?.collection;

  if (typeof mockCollection === 'function') {
    return { collection: mockCollection } as FirestoreLike;
  }

  return getFirestore();
}

export const AdminStatsOutputSchema = z.object({
  totalUsers: z.number(),
  totalBrands: z.number(),
  bmkSpentLast24h: z.number(),
});

export const AdminStatsInputSchema = z.object({});

async function getCollectionCount(collection: CollectionReference): Promise<number> {
  // New Firestore aggregation count() API (if available)
  if (typeof (collection as any).count === 'function') {
    const snapshot = await (collection as any).count().get();
    const count = snapshot.data()?.count;
    return typeof count === 'number' && Number.isFinite(count) ? count : 0;
  }

  // Fallback for emulator/tests/older SDKs
  const snapshot = await collection.get();
  return typeof snapshot.size === 'number' ? snapshot.size : 0;
}

async function calculateBmkSpentSince(threshold: Date): Promise<number> {
  const db = getDb();
  const ledger = db.collection('bmkLedger');
  let query: Query = ledger;

  if (typeof (ledger as any).where === 'function') {
    const filteredByDirection = (ledger as any).where('direction', '==', 'debit');

    if (filteredByDirection && typeof (filteredByDirection as any).where === 'function') {
      query = (filteredByDirection as any).where('createdAt', '>=', threshold);
    }
  }

  const snapshot = await query.get();

  const docs =
    snapshot &&
    typeof snapshot === 'object' &&
    'docs' in snapshot &&
    Array.isArray((snapshot as { docs: unknown }).docs)
      ? (snapshot as { docs: Array<{ data: () => unknown }> }).docs
      : [];

  return docs.reduce((total, doc) => {
    const data = typeof doc.data === 'function' ? doc.data() : undefined;
    const amount = (data as { amount?: unknown })?.amount;
    return typeof amount === 'number' && Number.isFinite(amount)
      ? total + amount
      : total;
  }, 0);
}

async function resolveAdminStats(uid: string): Promise<z.infer<typeof AdminStatsOutputSchema>> {
  const db = getDb();
  const usersCollection = db.collection('users');
  const userDoc = await usersCollection.doc(uid).get();

  const role = userDoc.get('role');
  if (role !== 'admin') {
    throw new HttpsError('permission-denied', 'Admin access is required.');
  }

  const brandsCollection = db.collection('brands');
  const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const [totalUsers, totalBrands, bmkSpentLast24h] = await Promise.all([
    getCollectionCount(usersCollection),
    getCollectionCount(brandsCollection),
    calculateBmkSpentSince(dayAgo),
  ]);

  return AdminStatsOutputSchema.parse({
    totalUsers,
    totalBrands,
    bmkSpentLast24h,
  });
}

export async function adminStatsFlow(
  _input: z.infer<typeof AdminStatsInputSchema>,
  { context }: { context?: Record<string, unknown> } = {},
): Promise<z.infer<typeof AdminStatsOutputSchema>> {
  const uid = extractAuthUserId(context);

  if (!uid) {
    throw new HttpsError('unauthenticated', 'Authentication is required.');
  }

  return resolveAdminStats(uid);
}

export const _test = {
  getCollectionCount,
  calculateBmkSpentSince,
  resolveAdminStats,
  AdminStatsOutputSchema,
};