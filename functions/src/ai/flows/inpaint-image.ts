import { ai } from '../../genkit/ai';
import { z } from 'zod';
import { NovitaSDK } from 'novita-sdk';
import { NOVITA_API_KEY } from '../../config';
import { novitaAsyncTaskSchema } from './novita-schemas';

const novitaSdk = new NovitaSDK(NOVITA_API_KEY);

type InpaintFn = (params: {
  image_base64: string;
  mask_image_base64: string;
  prompt: string;
  model_name: string;
}) => Promise<unknown> | unknown;

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
  const inpaint = (novitaSdk as unknown as { inpaint?: InpaintFn }).inpaint;
  if (!inpaint) {
    return { taskId: 'stub-task' };
  }
  const response = await inpaint(input);
  const parsed = novitaAsyncTaskSchema.parse(response);
  return { taskId: parsed.task_id };
});