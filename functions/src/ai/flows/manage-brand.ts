import * as admin from 'firebase-admin';
import { HttpsError } from 'firebase-functions/v1/https';
import { z } from 'zod';

import { ai, ensureGoogleGenAiApiKeyReady } from '../../genkit/ai';
import { extractAuthUserId } from '../../utils/flow-context';
import { upsertNovitaTask } from '../../utils/novita-tasks';
import { enforceFlowRateLimit } from '../../utils/rate-limit';

const firestore = admin.firestore();
const { FieldValue } = admin.firestore;

export const BrandInputSchema = z.object({
  brandId: z.string().min(1).optional(),
  name: z.string().min(1, 'Brand name is required'),
  logoUrl: z.string().url().optional(),
  colors: z.array(z.string()).optional(),
  fonts: z.array(z.string()).optional(),
  brandVoice: z.string().optional(),
  keyInfo: z.string().optional(),
  industry: z.string().optional(),
  competitorWebsites: z.array(z.string()).optional(),
});

export const manageBrandFlow = ai.defineFlow(
  {
    name: 'manageBrandFlow',
    inputSchema: BrandInputSchema,
    outputSchema: z.object({ brandId: z.string() }),
  },
  async (input) => {
    await ensureGoogleGenAiApiKeyReady();

    const context = typeof ai.currentContext === 'function' ? ai.currentContext() : undefined;
    const uid = extractAuthUserId(context);

    if (!uid) {
      throw new HttpsError('unauthenticated', 'Authentication is required to manage brands.');
    }

    const brandsCollection = firestore.collection('brands');
    const now = FieldValue.serverTimestamp();

    const docRef = input.brandId ? brandsCollection.doc(input.brandId) : brandsCollection.doc();
    let existingOwner: string | undefined;
    let isCreate = !input.brandId;

    if (input.brandId) {
      const existingSnap = await docRef.get();

      if (!existingSnap.exists) {
        isCreate = true;
      } else {
        existingOwner = (existingSnap.data()?.ownerId as string | undefined) ?? undefined;
        if (existingOwner && existingOwner !== uid) {
          throw new HttpsError('permission-denied', 'You do not have access to update this brand.');
        }
      }
    }

    const payload: Record<string, unknown> = {
      name: input.name,
      ownerId: uid,
      updatedAt: now,
    };

    const optionalFields: Record<string, unknown> = {
      logoUrl: input.logoUrl,
      colors: input.colors,
      fonts: input.fonts,
      brandVoice: input.brandVoice,
      keyInfo: input.keyInfo,
      industry: input.industry,
      competitorWebsites: input.competitorWebsites,
    };

    for (const [key, value] of Object.entries(optionalFields)) {
      if (typeof value !== 'undefined') {
        payload[key] = value;
      }
    }

    if (isCreate) {
      payload.createdAt = now;
      payload.status = 'active';
    }

    await enforceFlowRateLimit(uid, input.brandId);

    await docRef.set(payload, { merge: true });

    return { brandId: docRef.id };
  }
);

const UploadAssetInputSchema = z.object({
  assetId: z.string().min(1).optional(),
  brandId: z.string().min(1),
  userId: z.string().min(1),
  fileName: z.string().min(1),
  storagePath: z.string().min(1),
  contentType: z.string().optional(),
  sizeBytes: z.number().int().nonnegative().optional(),
  mediaUrl: z.string().url().optional(),
  type: z.enum(['image', 'video', 'audio', 'document']).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const uploadMediaAssetFlow = ai.defineFlow(
  {
    name: 'uploadMediaAssetFlow',
    inputSchema: UploadAssetInputSchema,
    outputSchema: z.object({ assetId: z.string() }),
  },
  async (input) => {
    await ensureGoogleGenAiApiKeyReady();

    const context = typeof ai.currentContext === 'function' ? ai.currentContext() : undefined;
    const uid = extractAuthUserId(context);

    if (!uid) {
      throw new HttpsError('unauthenticated', 'Authentication is required to upload media assets.');
    }

    if (uid !== input.userId) {
      throw new HttpsError('permission-denied', 'The provided userId does not match the authenticated user.');
    }

    const brandSnap = await firestore.collection('brands').doc(input.brandId).get();
    if (!brandSnap.exists) {
      throw new HttpsError('failed-precondition', `Brand ${input.brandId} was not found.`);
    }

    const brandOwner = (brandSnap.data()?.ownerId as string | undefined) ?? undefined;
    if (brandOwner && brandOwner !== uid) {
      throw new HttpsError('permission-denied', 'You do not have access to this brand.');
    }

    await enforceFlowRateLimit(uid, input.brandId);

    const bucket = admin.storage().bucket();
    const file = bucket.file(input.storagePath);

    let storageMeta: Record<string, unknown> = {};
    try {
      const [meta] = await file.getMetadata();
      storageMeta = {
        bucket: meta.bucket,
        contentType: meta.contentType,
        sizeBytes: meta.size ? Number(meta.size) : undefined,
        etag: meta.etag,
        generation: meta.generation,
        storageClass: meta.storageClass,
        updated: meta.updated,
      };
    } catch (error) {
      console.warn('Failed to read storage metadata for asset', input.storagePath, error);
    }

    const assetData: Record<string, unknown> = {
      brandId: input.brandId,
      userId: input.userId,
      fileName: input.fileName,
      storagePath: input.storagePath,
      updatedAt: FieldValue.serverTimestamp(),
      storageMetadata: {
        ...storageMeta,
        bucket: storageMeta.bucket ?? bucket.name,
        path: input.storagePath,
        contentType: input.contentType ?? storageMeta.contentType,
        sizeBytes: input.sizeBytes ?? storageMeta.sizeBytes,
      },
    };

    if (input.metadata) {
      assetData.metadata = input.metadata;
    }

    if (input.type) {
      assetData.type = input.type;
    }

    const publicUrl =
      input.mediaUrl ??
      ((storageMeta.bucket || bucket.name)
        ? `https://storage.googleapis.com/${storageMeta.bucket ?? bucket.name}/${encodeURIComponent(input.storagePath)}`
        : undefined);

    if (publicUrl) {
      assetData.url = publicUrl;
    }

    const docRef = input.assetId
      ? firestore.collection('mediaAssets').doc(input.assetId)
      : firestore.collection('mediaAssets').doc();

    if (!input.assetId) {
      assetData.createdAt = FieldValue.serverTimestamp();
      assetData.status = 'uploaded';
    }

    await docRef.set(assetData, { merge: true });

    const novitaTaskId = (input.metadata as { novitaTaskId?: unknown } | undefined)?.novitaTaskId;
    if (novitaTaskId) {
      await upsertNovitaTask(String(novitaTaskId), {
        status: 'uploaded',
        assetId: docRef.id,
        mediaUrl: publicUrl,
      });
    }

    return { assetId: docRef.id };
  }
);
