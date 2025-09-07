import { ai } from '../../genkit/ai';
import { z } from 'zod';
import * as functions from 'firebase-functions';
import { NovitaSDK } from 'novita-sdk';

const NOVITA_API_KEY =
  (functions.config().novita?.key as string) ||
  process.env.NOVITA_API_KEY ||
  '';

const novitaSdk = new NovitaSDK(NOVITA_API_KEY);

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
  const payload = {
    name: input.modelName,
    image_dataset_items: input.imageAssetIds.map((id) => ({ assets_id: id })),
  } as any;

  const response: any =
    input.trainingType === 'subject'
      ? (novitaSdk as any).trainSubject?.(payload)
      : (novitaSdk as any).trainStyle?.(payload);

  const result = await response;
  return { taskId: result?.task_id ?? 'stub-task' };
});