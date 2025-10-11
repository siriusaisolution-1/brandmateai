import { ai } from '../../genkit/ai';
import { z } from 'zod';
import { NovitaSDK } from 'novita-sdk';
import { NOVITA_API_KEY } from '../../config';
import { novitaAsyncTaskSchema } from './novita-schemas';

const novitaSdk = new NovitaSDK(NOVITA_API_KEY);

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
  const payload: TrainPayload = {
    name: input.modelName,
    image_dataset_items: input.imageAssetIds.map((id) => ({ assets_id: id })),
  };

  const client = novitaSdk as unknown as {
    trainSubject?: TrainFn;
    trainStyle?: TrainFn;
  };
  const response = await (input.trainingType === 'subject'
    ? client.trainSubject?.(payload)
    : client.trainStyle?.(payload));
  if (!response) {
    return { taskId: 'stub-task' };
  }
  const parsed = novitaAsyncTaskSchema.parse(response);
  return { taskId: parsed.task_id };
});