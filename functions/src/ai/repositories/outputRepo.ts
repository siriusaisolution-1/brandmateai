import * as admin from 'firebase-admin';

import type { ContentRequest, Output, WithId } from '../../types/firestore';

const firestore = admin.firestore();

const OUTPUTS_COLLECTION = 'outputs';

export type NewOutputInput = Omit<Output, 'id' | 'createdAt' | 'updatedAt'> & {
  createdAt?: Output['createdAt'];
  updatedAt?: Output['updatedAt'];
};

export async function createOutput(data: NewOutputInput): Promise<WithId<Output>> {
  const now = admin.firestore.FieldValue.serverTimestamp();
  const docRef = firestore.collection(OUTPUTS_COLLECTION).doc();
  const payload: Output = {
    ...data,
    createdAt: data.createdAt ?? now,
    updatedAt: data.updatedAt ?? now,
  };
  await docRef.set(payload);

  return { ...payload, id: docRef.id };
}

export async function createOutputsBatch(data: NewOutputInput[]): Promise<WithId<Output>[]> {
  if (!data.length) return [];

  const now = admin.firestore.FieldValue.serverTimestamp();
  const batch = firestore.batch();
  const results: WithId<Output>[] = [];

  data.forEach((item) => {
    const docRef = firestore.collection(OUTPUTS_COLLECTION).doc();
    const payload: Output = {
      ...item,
      createdAt: item.createdAt ?? now,
      updatedAt: item.updatedAt ?? now,
    };
    batch.set(docRef, payload);
    results.push({ ...payload, id: docRef.id });
  });

  await batch.commit();
  return results;
}

export async function listOutputsForRequest(
  brandId: string,
  requestId: string
): Promise<WithId<Output>[]> {
  const snapshot = await firestore
    .collection(OUTPUTS_COLLECTION)
    .where('brandId', '==', brandId)
    .where('requestId', '==', requestId)
    .get();

  return snapshot.docs.map((doc) => ({ ...(doc.data() as Output), id: doc.id }));
}

export async function updateContentRequestStatus(
  requestId: string,
  status: ContentRequest['status']
): Promise<void> {
  await firestore.collection('contentRequests').doc(requestId).update({
    status,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });
}
