import { ai } from '../../genkit/ai';
import { z } from 'zod';
import * as functions from 'firebase-functions';
import { NovitaSDK } from 'novita-sdk';

const NOVITA_API_KEY =
  (functions.config().novita?.key as string) ||
  process.env.NOVITA_API_KEY ||
  '';

const novitaSdk = new NovitaSDK(NOVITA_API_KEY);

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
  const response: any =
    (novitaSdk as any).upscale?.(input) ?? { task_id: 'stub-task' };
  const result = await response;
  return { taskId: result?.task_id ?? 'stub-task' };
});