import { ai } from '../../genkit/ai';
import { z } from 'zod';
import * as functions from 'firebase-functions';
import { NovitaSDK } from 'novita-sdk';

const NOVITA_API_KEY =
  (functions.config().novita?.key as string) ||
  process.env.NOVITA_API_KEY ||
  '';

const novitaSdk = new NovitaSDK(NOVITA_API_KEY);

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
  const response: any =
    (novitaSdk as any).inpaint?.(input) ?? { task_id: 'stub-task' };
  const result = await response;
  return { taskId: result?.task_id ?? 'stub-task' };
});