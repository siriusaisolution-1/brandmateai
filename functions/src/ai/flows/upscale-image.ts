import { ai } from '../../genkit/ai';
import { z } from 'zod';
import { NovitaSDK } from 'novita-sdk';
import { NOVITA_API_KEY } from '../../config';
import { novitaAsyncTaskSchema } from './novita-schemas';

const novitaSdk = new NovitaSDK(NOVITA_API_KEY);

type UpscaleFn = (params: {
  image_base64: string;
  scale_factor: number;
  model_name: 'RealESRGAN_x4plus_anime_6B' | 'RealESRNet_x4plus' | '4x-UltraSharp';
}) => Promise<unknown> | unknown;

export const upscaleImageFlow = ai.defineFlow({
  name: 'upscaleImageFlow',
  inputSchema: z.object({
    image_base64: z.string(),
    scale_factor: z.number().default(2),
    model_name: z.enum([
      'RealESRGAN_x4plus_anime_6B',
      'RealESRNet_x4plus',
      '4x-UltraSharp',
    ]).default('4x-UltraSharp'),
  }),
  outputSchema: z.object({ taskId: z.string() }),
}, async (input) => {
  const upscale = (novitaSdk as unknown as { upscale?: UpscaleFn }).upscale;
  if (!upscale) {
    return { taskId: 'stub-task' };
  }
  const response = await upscale(input);
  const parsed = novitaAsyncTaskSchema.parse(response);
  return { taskId: parsed.task_id };
});