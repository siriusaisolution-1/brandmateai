// functions/src/ai/flows/inpaint-image.ts
import { defineFlow } from '@genkit-ai/flow';
import { z } from 'zod';
import { NovitaSDK } from 'novita-sdk';
import { NOVITA_API_KEY } from '../../config';

const novitaSdk = new NovitaSDK(NOVITA_API_KEY);

export const inpaintImageFlow = defineFlow(
  {
    name: 'inpaintImageFlow',
    inputSchema: z.object({
      image_base64: z.string(),
      mask_image_base64: z.string(),
      prompt: z.string(),
      model_name: z.string().default('realisticVisionV40_v40VAE-inpainting_81543.safetensors'),
    }),
    outputSchema: z.object({ taskId: z.string() }),
  },
  async (input) => {
    const response = await novitaSdk.inpainting(input);
     if (!response.task_id) {
        throw new Error('Failed to create inpainting task with Novita AI.');
    }
    return { taskId: response.task_id };
  }
);
