import * as admin from 'firebase-admin';

const firestore = admin.firestore();
const { FieldValue } = admin.firestore;

export interface NovitaTaskUpdate {
  type?: 'image' | 'video';
  status?: string;
  userId?: string;
  brandId?: string;
  prompt?: string;
  model?: string;
  request?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  error?: string | null;
  latencyMs?: number;
  assetId?: string;
  mediaUrl?: string;
  flow?: string;
}

export async function upsertNovitaTask(
  taskId: string,
  update: NovitaTaskUpdate,
  options: { create?: boolean } = {}
): Promise<void> {
  const { create = false } = options;
  const now = FieldValue.serverTimestamp();
  const collection = firestore.collection('novitaTasks');

  const cleanedEntries = Object.entries(update).filter(([, value]) => typeof value !== 'undefined');
  const data: Record<string, unknown> = Object.fromEntries(cleanedEntries);
  data.updatedAt = now;

  if (create) {
    data.taskId = taskId;
    data.createdAt = now;
  }

  await collection.doc(taskId).set(data, { merge: true });
}
