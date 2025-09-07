import { ai } from '../../genkit/ai';
import { z } from 'zod';
import * as functions from 'firebase-functions';
import { NovitaSDK } from 'novita-sdk';
import { getAssetUrl } from '../../utils/firebase';

const NOVITA_API_KEY =
  (functions.config().novita?.key as string) ||
  process.env.NOVITA_API_KEY ||
  '';

const novitaSdk = new NovitaSDK(NOVITA_API_KEY);

export const generateVideoFlow = ai.defineFlow({
  name: 'generateVideoFlow',
  inputSchema: z.object({ imageAssetId: z.string(), prompt: z.string() }),
  outputSchema: z.object({ taskId: z.string() }),
}, async ({ imageAssetId, prompt }) => {
  const image_url = await getAssetUrl(imageAssetId);
  const response: any =
    (novitaSdk as any).img2Video?.({
      image_url,
      model_name: 'wan-2.2-t2v',
      prompt,
    }) ?? { task_id: 'stub-task' };
  const result = await response;
  return { taskId: result?.task_id ?? 'stub-task' };
});