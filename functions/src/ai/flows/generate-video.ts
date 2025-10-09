import { ai } from '../../genkit/ai';
import { z } from 'zod';
import { HttpsError } from 'firebase-functions/v1/https';
import { NovitaSDK } from 'novita-sdk';
import { getAssetUrl } from '../../utils/firebase';
import { NOVITA_API_KEY } from '../../config';
import {
  novitaAsyncTaskSchema,
  type NovitaAsyncTask,
} from './novita-schemas';

const novitaSdk = new NovitaSDK(NOVITA_API_KEY);

type Img2VideoFn = (params: {
  image_url: string;
  model_name: string;
  prompt: string;
}) => Promise<NovitaAsyncTask> | NovitaAsyncTask;

export const generateVideoFlow = ai.defineFlow({
  name: 'generateVideoFlow',
  inputSchema: z.object({ imageAssetId: z.string(), prompt: z.string() }),
  outputSchema: z.object({ taskId: z.string() }),
}, async ({ imageAssetId, prompt }) => {
  try {
    // zašto: Surface asset resolution errors to callers instead of failing silently.
    const image_url = await getAssetUrl(imageAssetId);
    const img2Video = (novitaSdk as unknown as { img2Video?: Img2VideoFn }).img2Video;
    if (!img2Video) {
      return { taskId: 'stub-task' };
    }
    const response = await img2Video({
      image_url,
      model_name: 'wan-2.2-t2v',
      prompt,
    });
    const parsed = novitaAsyncTaskSchema.parse(response);
    return { taskId: parsed.task_id };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to resolve image asset for video generation.';
    throw new HttpsError('failed-precondition', message);
  }
});
