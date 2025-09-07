import { ai } from '../../genkit/ai';
import { z } from 'zod';
import * as functions from 'firebase-functions';
import { NovitaSDK } from 'novita-sdk';

const NOVITA_API_KEY =
  (functions.config().novita?.key as string) ||
  process.env.NOVITA_API_KEY ||
  '';

const novitaSdk = new NovitaSDK(NOVITA_API_KEY);

export const removeBackgroundFlow = ai.defineFlow({
  name: 'removeBackgroundFlow',
  inputSchema: z.object({ image_base64: z.string() }),
  outputSchema: z.object({
    image_base64: z.string(),
    image_type: z.string(),
  }),
}, async ({ image_base64 }) => {
  const res: any =
    (novitaSdk as any).removeBg?.({ image_base64 }) ??
    { image_base64, image_type: 'image/png' };
  return res;
});