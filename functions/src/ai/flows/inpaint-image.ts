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
        void error;
        return null;
      }
    })();
  }
  return novitaSdkPromise;
};

type InpaintFn = (params: {
  image_base64: string;
  mask_image_base64: string;
  prompt: string;
  model_name: string;
}) => Promise<unknown> | unknown;

export const inpaintImageFlow = ai.defineFlow({
  name: 'inpaintImageFlow',
  inputSchema: z.object({
    image_base64: z.string(),
    mask_image_base64: z.string(),
    prompt: z.string(),
    model_name: z.string().default('anything'),
  }),
  outputSchema: z.object({ taskId: z.string() }),
}, async (input) => {
  await ensureGoogleGenAiApiKeyReady();

  const novitaSdk = await getNovitaSdk();
  if (!novitaSdk) {
    throw new HttpsError('failed-precondition', 'NOVITA_API_KEY is not configured.');
  }

  const inpaint = (novitaSdk as unknown as { inpaint?: InpaintFn }).inpaint;
  if (!inpaint) {
    throw new HttpsError(
      'failed-precondition',
      'Novita inpaint API is not available in the current SDK version.'
    );
  }

  const response = await inpaint(input);
  const parsed = novitaAsyncTaskSchema.parse(response);
  return { taskId: parsed.task_id };
});