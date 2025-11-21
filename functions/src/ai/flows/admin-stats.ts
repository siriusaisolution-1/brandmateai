import * as admin from 'firebase-admin';
import type { CollectionReference, Query } from 'firebase-admin/firestore';
import { HttpsError } from 'firebase-functions/v1/https';
import { z } from 'zod';

import { ai, ensureGoogleGenAiApiKeyReady } from '../../genkit/ai';
import { extractAuthUserId } from '../../utils/flow-context';

const firestore = admin.firestore();

const AdminStatsOutputSchema = z.object({
  totalUsers: z.number(),
  totalBrands: z.number(),
  bmkSpentLast24h: z.number(),
});

async function getCollectionCount(collection: CollectionReference): Promise<number> {
  if (typeof collection.count === 'function') {
    const snapshot = await collection.count().get();
    const count = snapshot.data()?.count;
    return typeof count === 'number' && Number.isFinite(count) ? count : 0;
  }

  const snapshot = await collection.get();
  return typeof snapshot.size === 'number' ? snapshot.size : 0;
}

async function calculateBmkSpentSince(threshold: Date): Promise<number> {
  const ledger = firestore.collection('bmkLedger');
  let query: Query = ledger;

  if (typeof ledger.where === 'function') {
    const filteredByDirection = ledger.where('direction', '==', 'debit');
    if (filteredByDirection && typeof (filteredByDirection as Query).where === 'function') {
      query = (filteredByDirection as Query).where('createdAt', '>=', threshold);
    }
  }

  const snapshot = await query.get();
  const docs = snapshot && typeof snapshot === 'object' && 'docs' in snapshot && Array.isArray((snapshot as { docs: unknown }).docs)
    ? (snapshot as { docs: Array<{ data: () => unknown }> }).docs
    : [];

  return docs.reduce((total, doc) => {
    const data = typeof doc.data === 'function' ? doc.data() : undefined;
    const amount = data?.amount;
    return typeof amount === 'number' && Number.isFinite(amount)
      ? total + amount
      : total;
  }, 0);
}

async function resolveAdminStats(uid: string): Promise<z.infer<typeof AdminStatsOutputSchema>> {
  const usersCollection = firestore.collection('users');
  const userDoc = await usersCollection.doc(uid).get();

  const role = userDoc.get('role');
  if (role !== 'admin') {
    throw new HttpsError('permission-denied', 'Admin access is required.');
  }

  const brandsCollection = firestore.collection('brands');
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

export const adminStatsFlow = ai.defineFlow(
  {
    name: 'adminStatsFlow',
    inputSchema: z.object({}),
    outputSchema: AdminStatsOutputSchema,
  },
  async (_input, { context }) => {
    await ensureGoogleGenAiApiKeyReady();

    const uid = extractAuthUserId(context);

    if (!uid) {
      throw new HttpsError('unauthenticated', 'Authentication is required.');
    }

    return resolveAdminStats(uid);
  },
);

export const _test = {
  getCollectionCount,
  calculateBmkSpentSince,
  resolveAdminStats,
  AdminStatsOutputSchema,
};
