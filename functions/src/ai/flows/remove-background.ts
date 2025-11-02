import { ai, ensureGoogleGenAiApiKeyReady } from '../../genkit/ai';
import { z } from 'zod';
import { NovitaSDK } from 'novita-sdk';
import { getNovitaApiKey } from '../../config';
import { novitaImageTransformResultSchema } from './novita-schemas';

let novitaSdkPromise: Promise<NovitaSDK | null> | null = null;

const getNovitaSdk = async (): Promise<NovitaSDK | null> => {
  if (!novitaSdkPromise) {
    novitaSdkPromise = (async () => {
      try {
        const apiKey = await getNovitaApiKey();
        return new NovitaSDK(apiKey);
      } catch (error) {
        return null;
      }
    })();
  }
  return novitaSdkPromise;
};

type RemoveBgFn = (params: { image_base64: string }) =>
  | Promise<unknown>
  | unknown;

export const removeBackgroundFlow = ai.defineFlow({
  name: 'removeBackgroundFlow',
  inputSchema: z.object({ image_base64: z.string() }),
  outputSchema: z.object({
    image_base64: z.string(),
    image_type: z.string(),
  }),
}, async ({ image_base64 }) => {
  await ensureGoogleGenAiApiKeyReady();

  const novitaSdk = await getNovitaSdk();
  const removeBg = (novitaSdk as unknown as { removeBg?: RemoveBgFn })?.removeBg;
  if (!removeBg) {
    return { image_base64, image_type: 'image/png' };
  }
  const response = await removeBg({ image_base64 });
  const parsed = novitaImageTransformResultSchema.parse(response);
  return parsed;
});