// functions/src/ai/flows/generate-image.ts
import * as admin from 'firebase-admin';
import { HttpsError } from 'firebase-functions/v1/https';
import { z } from 'zod';

import { getNovitaApiKey } from '../../config';
import { ai, ensureGoogleGenAiApiKeyReady } from '../../genkit/ai';
import { extractAuthUserId } from '../../utils/flow-context';
import { upsertNovitaTask } from '../../utils/novita-tasks';
import { novitaAsyncTaskSchema } from './novita-schemas';

const NOVITA_BASE = 'https://api.novita.ai';
const firestore = admin.firestore();

const GenerateImageInputSchema = z.object({
  prompt: z.string().min(1),
  userId: z.string().min(1),
  brandId: z.string().min(1),
  width: z.number().int().min(128).max(2048).default(1024),
  height: z.number().int().min(128).max(2048).default(1024),
  model_name: z.string().default('sd_xl_base_1.0.safetensors'),
});

async function executeWithRetry<T>(fn: () => Promise<T>, attempts = 3, baseDelayMs = 750): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt < attempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      const delay = baseDelayMs * Math.pow(2, attempt);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  throw lastError instanceof Error ? lastError : new Error('Failed after retry attempts');
}

export const generateImageFlow = ai.defineFlow(
  {
    name: 'generateImageFlow',
    inputSchema: GenerateImageInputSchema,
    outputSchema: z.object({ taskId: z.string() }),
  },
  async (input) => {
    await ensureGoogleGenAiApiKeyReady();

    let novitaApiKey: string;
    try {
      novitaApiKey = await getNovitaApiKey();
    } catch (error) {
      throw new HttpsError('failed-precondition', 'NOVITA_API_KEY is not configured.');
    }

    const context = typeof ai.currentContext === 'function' ? ai.currentContext() : undefined;
    const authUid = extractAuthUserId(context);

    if (!authUid) {
      throw new HttpsError('unauthenticated', 'Authentication is required to request image generation.');
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

    const startedAt = Date.now();

    const response = await executeWithRetry(async () => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30_000);
      try {
        const res = await fetch(`${NOVITA_BASE}/v3/async/txt2img`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${novitaApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            extra: { response_image_type: 'jpeg' },
            request: {
              prompt: input.prompt,
              model_name: input.model_name,
              width: input.width,
              height: input.height,
              image_num: 1,
              steps: 24,
              guidance_scale: 7.5,
              sampler_name: 'Euler a',
            },
          }),
          signal: controller.signal,
        });

        if (!res.ok) {
          const bodyText = await res.text();
          throw new HttpsError('internal', `Novita txt2img failed: ${res.status} ${bodyText}`);
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
        type: 'image',
        status: parsed.status ?? 'queued',
        userId: authUid,
        brandId: input.brandId,
        prompt: input.prompt,
        model: input.model_name,
        request: {
          width: input.width,
          height: input.height,
        },
        latencyMs,
        flow: 'generateImageFlow',
      },
      { create: true }
    );

    return { taskId: parsed.task_id };
  }
);