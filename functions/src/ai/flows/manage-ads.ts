import * as admin from 'firebase-admin';
import { HttpsError } from 'firebase-functions/v1/https';
import type { DocumentReference } from 'firebase-admin/firestore';
import { ai, ensureGoogleGenAiApiKeyReady } from '../../genkit/ai';
import { extractAuthUserId } from '../../utils/flow-context';
import { z } from 'zod';

const firestore = admin.firestore();
const { FieldValue } = admin.firestore;

const ManageAdsInputSchema = z.object({
  eventId: z.string(),
  adAccountId: z.string(),
  brandId: z.string().optional(),
  notes: z.string().optional(),
});

const ManageAdsOutputSchema = z.object({
  status: z.string(),
  requestId: z.string(),
});

async function resolveRequester(uid: string): Promise<'admin' | 'user' | string | null> {
  const snapshot = await firestore.collection('users').doc(uid).get();
  if (!snapshot.exists) {
    return null;
  }
  const role = snapshot.get('role');
  return typeof role === 'string' ? role : null;
}

async function enqueueAdSyncRequest(
  input: z.infer<typeof ManageAdsInputSchema>,
  requestedBy: string,
): Promise<z.infer<typeof ManageAdsOutputSchema>> {
  const queueCollection = firestore.collection('adSyncRequests');
  const operationsAudit = firestore.collection('operationsAudit');

  let requestRef: DocumentReference | undefined;

  if (typeof queueCollection.doc === 'function') {
    requestRef = queueCollection.doc(input.eventId);

    const existing = await requestRef.get();
    if (existing.exists) {
      throw new HttpsError('already-exists', 'This ad sync event has already been queued.');
    }

    await requestRef.set(
      {
        eventId: input.eventId,
        adAccountId: input.adAccountId,
        brandId: input.brandId ?? null,
        notes: input.notes ?? null,
        status: 'queued',
        requestedBy,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: false },
    );
  } else if (typeof queueCollection.add === 'function') {
    requestRef = await queueCollection.add({
      eventId: input.eventId,
      adAccountId: input.adAccountId,
      brandId: input.brandId ?? null,
      notes: input.notes ?? null,
      status: 'queued',
      requestedBy,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
  } else {
    throw new HttpsError('internal', 'Ad sync queue is not configured.');
  }

  const requestId = requestRef.id ?? input.eventId;

  await operationsAudit.add({
    type: 'adSyncRequest',
    referenceId: requestId,
    payload: input,
    requestedBy,
    createdAt: FieldValue.serverTimestamp(),
  });

  return ManageAdsOutputSchema.parse({
    status: 'queued',
    requestId,
  });
}

export const manageAdsFlow = ai.defineFlow(
  {
    name: 'manageAdsFlow',
    inputSchema: ManageAdsInputSchema,
    outputSchema: ManageAdsOutputSchema,
  },
  async (input, { context }) => {
    const uid = extractAuthUserId(context);

    if (!uid) {
      throw new HttpsError('unauthenticated', 'Authentication is required.');
    }

    const role = await resolveRequester(uid);
    if (role !== 'admin') {
      throw new HttpsError('permission-denied', 'Only administrators may queue ad sync operations.');
    }

    return enqueueAdSyncRequest(input, uid);
  },
);

export const _test = {
  enqueueAdSyncRequest,
  resolveRequester,
  ManageAdsInputSchema,
  ManageAdsOutputSchema,
};
