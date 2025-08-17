// functions/src/ai/flows/upscale-image.ts
import { defineFlow } from '@genkit-ai/flow';
import { z } from 'zod';
import { NovitaSDK } from 'novita-sdk';
import { NOVITA_API_KEY } from '../../config';

const novitaSdk = new NovitaSDK(NOVITA_API_KEY);

export const upscaleImageFlow = defineFlow(
  {
    name: 'upscaleImageFlow',
    inputSchema: z.object({
      image_base64: z.string(),
      scale_factor: z.number().min(1).max(4).default(2),
      model_name: z.enum(['RealESRGAN_x4plus_anime_6B', 'RealESRNet_x4plus', '4x-UltraSharp']).default('4x-UltraSharp'),
    }),
    outputSchema: z.object({ taskId: z.string() }),
  },
  async (input) => {
    const response = await novitaSdk.upscale(input);
     if (!response.task_id) {
        throw new Error('Failed to create upscale task with Novita AI.');
    }
    return { taskId: response.task_id };
  }
);
