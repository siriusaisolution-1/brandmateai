// functions/src/ai/flows/remove-background.ts
import { defineFlow } from '@genkit-ai/flow';
import { z } from 'zod';
import { NovitaSDK } from 'novita-sdk';
import { NOVITA_API_KEY } from '../../config';

const novitaSdk = new NovitaSDK(NOVITA_API_KEY);

export const removeBackgroundFlow = defineFlow(
  {
    name: 'removeBackgroundFlow',
    inputSchema: z.object({ image_base64: z.string() }),
    outputSchema: z.object({ image_base64: z.string(), image_type: z.string() }),
  },
  async ({ image_base64 }) => {
    const response = await novitaSdk.removeBackground({ image_file: image_base64 });
    return {
      image_base64: response.image_file,
      image_type: response.image_type,
    };
  }
);
