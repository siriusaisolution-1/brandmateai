import * as admin from 'firebase-admin';
import { HttpsError } from 'firebase-functions/v1/https';
import { z } from 'zod';

import { NOVITA_API_KEY } from '../../config';
import { ai } from '../../genkit/ai';
import { extractAuthUserId } from '../../utils/flow-context';
import { getAssetUrl } from '../../utils/firebase';
import { upsertNovitaTask } from '../../utils/novita-tasks';
import { novitaAsyncTaskSchema } from './novita-schemas';
import { enforceFlowRateLimit } from '../../utils/rate-limit';

const firestore = admin.firestore();
const NOVITA_BASE = 'https://api.novita.ai';

const GenerateVideoInputSchema = z.object({
  imageAssetId: z.string().min(1),
  brandId: z.string().min(1),
  userId: z.string().min(1),
  prompt: z.string().min(1),
  model_name: z.string().default('wan-2.2-t2v'),
  frames: z.number().int().min(8).max(48).default(16),
  fps: z.number().int().min(8).max(30).default(12),
});

async function retryNovitaRequest<T>(fn: () => Promise<T>, attempts = 3, baseDelay = 1000): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt < attempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  throw lastError instanceof Error ? lastError : new Error('Failed after retry attempts');
}

export const generateVideoFlow = ai.defineFlow(
  {
    name: 'generateVideoFlow',
    inputSchema: GenerateVideoInputSchema,
    outputSchema: z.object({ taskId: z.string() }),
  },
  async (input) => {
    if (!NOVITA_API_KEY) {
      throw new HttpsError('failed-precondition', 'NOVITA_API_KEY is not configured.');
    }

    const context = typeof ai.currentContext === 'function' ? ai.currentContext() : undefined;
    const authUid = extractAuthUserId(context);

    if (!authUid) {
      throw new HttpsError('unauthenticated', 'Authentication is required to request video generation.');
    }

    if (authUid !== input.userId) {
      throw new HttpsError('permission-denied', 'The provided userId does not match the authenticated user.');
    }

    const brandSnap = await firestore.collection('brands').doc(input.brandId).get();
    if (!brandSnap.exists) {
      throw new HttpsError('failed-precondition', `Brand ${input.brandId} was not found.`);
    }

    const ownerId = (brandSnap.data()?.ownerId as string | undefined) ?? undefined;
    if (ownerId && ownerId !== authUid) {
      throw new HttpsError('permission-denied', 'You do not have access to this brand.');
    }

    const assetSnap = await firestore.collection('mediaAssets').doc(input.imageAssetId).get();
    if (!assetSnap.exists) {
      throw new HttpsError('failed-precondition', `Media asset ${input.imageAssetId} was not found.`);
    }

    const assetData = assetSnap.data() as { brandId?: string; userId?: string } | undefined;
    if (assetData?.brandId && assetData.brandId !== input.brandId) {
      throw new HttpsError('permission-denied', 'The media asset does not belong to this brand.');
    }

    if (assetData?.userId && assetData.userId !== authUid) {
      throw new HttpsError('permission-denied', 'The media asset does not belong to this user.');
    }

    await enforceFlowRateLimit(authUid, input.brandId);

    const imageUrl = await getAssetUrl(input.imageAssetId);
    const startedAt = Date.now();

    const response = await retryNovitaRequest(async () => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 45_000);

      try {
        const res = await fetch(`${NOVITA_BASE}/v3/async/img2video`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${NOVITA_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            request: {
              model_name: input.model_name,
              image_url: imageUrl,
              prompt: input.prompt,
              frames_num: input.frames,
              frames_per_second: input.fps,
              steps: 20,
              seed: -1,
              guidance_scale: 7.5,
            },
          }),
          signal: controller.signal,
        });

        if (!res.ok) {
          const errorText = await res.text();
          throw new HttpsError('internal', `Novita img2video failed: ${res.status} ${errorText}`);
        }

        return res.json();
      } finally {
        clearTimeout(timeout);
      }
    });

    const parsed = novitaAsyncTaskSchema.parse(response);
    const latencyMs = Date.now() - startedAt;

    await upsertNovitaTask(
      parsed.task_id,
      {
        type: 'video',
        status: parsed.status ?? 'queued',
        userId: authUid,
        brandId: input.brandId,
        prompt: input.prompt,
        model: input.model_name,
        request: {
          imageAssetId: input.imageAssetId,
          frames: input.frames,
          fps: input.fps,
        },
        latencyMs,
        flow: 'generateVideoFlow',
      },
      { create: true }
    );

    return { taskId: parsed.task_id };
  }
);
