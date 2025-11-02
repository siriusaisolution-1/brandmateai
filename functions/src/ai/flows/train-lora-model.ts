import { HttpsError } from 'firebase-functions/v1/https';
import { NovitaSDK } from 'novita-sdk';
import { z } from 'zod';

import { getNovitaApiKey } from '../../config';
import { ai, ensureGoogleGenAiApiKeyReady } from '../../genkit/ai';
import { novitaAsyncTaskSchema } from './novita-schemas';

let novitaSdkPromise: Promise<NovitaSDK | null> | null = null;

const getNovitaSdk = async (): Promise<NovitaSDK | null> => {
  if (!novitaSdkPromise) {
    novitaSdkPromise = (async () => {
      try {
        const apiKey = await getNovitaApiKey();
        return new NovitaSDK(apiKey);
      } catch (error) {
        return null;
      }
    })();
  }
  return novitaSdkPromise;
};

type TrainPayload = {
  name: string;
  image_dataset_items: Array<{ assets_id: string }>;
};

type TrainFn = (payload: TrainPayload) => Promise<unknown> | unknown;

export const trainLoraModelFlow = ai.defineFlow({
  name: 'trainLoraModelFlow',
  inputSchema: z.object({
    userId: z.string(),
    brandId: z.string(),
    trainingType: z.enum(['style', 'subject']),
    modelName: z.string(),
    imageAssetIds: z.array(z.string()),
  }),
  outputSchema: z.object({ taskId: z.string() }),
}, async (input) => {
  await ensureGoogleGenAiApiKeyReady();

  const payload: TrainPayload = {
    name: input.modelName,
    image_dataset_items: input.imageAssetIds.map((id) => ({ assets_id: id })),
  };

  const novitaSdk = await getNovitaSdk();
  const client = novitaSdk as unknown as {
    trainSubject?: TrainFn;
    trainStyle?: TrainFn;
  };
  if (!novitaSdk) {
    throw new HttpsError('failed-precondition', 'NOVITA_API_KEY is not configured.');
  }

  const response = await (input.trainingType === 'subject'
    ? client.trainSubject?.(payload)
    : client.trainStyle?.(payload));
  if (!response) {
    throw new HttpsError(
      'failed-precondition',
      'Required Novita LoRA training API is not available in the current SDK.'
    );
  }
  const parsed = novitaAsyncTaskSchema.parse(response);
  return { taskId: parsed.task_id };
});