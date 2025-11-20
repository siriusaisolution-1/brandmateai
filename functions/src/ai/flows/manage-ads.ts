import { FieldValue, getFirestore, type DocumentReference } from 'firebase-admin/firestore';
import { HttpsError } from 'firebase-functions/v1/https';
import { z } from 'zod';

import { extractAuthUserId } from '../../utils/flow-context';

type FirestoreLike = ReturnType<typeof getFirestore>;

function getDb(): FirestoreLike {
  const mockCollection = (globalThis as { __vitestFirebaseAdmin?: { mocks?: { collection?: FirestoreLike['collection'] } } })
    .__vitestFirebaseAdmin?.mocks?.collection;

  if (typeof mockCollection === 'function') {
    return { collection: mockCollection } as FirestoreLike;
  }

  return getFirestore();
}

function getFieldValue() {
  const mocked = (globalThis as { __vitestFirebaseAdmin?: { mocks?: { FieldValue?: typeof FieldValue } } }).__vitestFirebaseAdmin
    ?.mocks?.FieldValue;
  return mocked ?? FieldValue;
}

export const ManageAdsInputSchema = z.object({
  eventId: z.string(),
  adAccountId: z.string(),
  brandId: z.string().optional(),
  notes: z.string().optional(),
});

export const ManageAdsOutputSchema = z.object({
  status: z.string(),
  requestId: z.string().optional(),
});

async function resolveRequester(uid: string): Promise<'admin' | 'user' | string | null> {
  const snapshot = await getDb().collection('users').doc(uid).get();
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
  const db = getDb();
  const queueCollection = db.collection('adSyncRequests');
  const operationsAudit = db.collection('operationsAudit');

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
        createdAt: getFieldValue().serverTimestamp(),
        updatedAt: getFieldValue().serverTimestamp(),
      },
      { merge: false },
    );
  } else if (typeof (queueCollection as { add?: unknown }).add === 'function') {
    const addFn = (queueCollection as { add: (data: unknown) => Promise<DocumentReference> }).add;
    requestRef = await addFn({
      eventId: input.eventId,
      adAccountId: input.adAccountId,
      brandId: input.brandId ?? null,
      notes: input.notes ?? null,
      status: 'queued',
      requestedBy,
      createdAt: getFieldValue().serverTimestamp(),
      updatedAt: getFieldValue().serverTimestamp(),
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
    createdAt: getFieldValue().serverTimestamp(),
  });

  return ManageAdsOutputSchema.parse({
    status: 'queued',
    requestId,
  });
}

export async function manageAdsFlow(
  input: z.infer<typeof ManageAdsInputSchema>,
  { context }: { context?: Record<string, unknown> } = {},
): Promise<z.infer<typeof ManageAdsOutputSchema>> {
  const uid = extractAuthUserId(context);

  if (!uid) {
    throw new HttpsError('unauthenticated', 'Authentication is required.');
  }

  const role = await resolveRequester(uid);
  if (role !== 'admin') {
    throw new HttpsError('permission-denied', 'Only administrators may queue ad sync operations.');
  }

  return enqueueAdSyncRequest(input, uid);
}

export const _test = {
  enqueueAdSyncRequest,
  resolveRequester,
  ManageAdsInputSchema,
  ManageAdsOutputSchema,
};
