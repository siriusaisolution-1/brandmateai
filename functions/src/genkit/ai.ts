import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

import { getGeminiModelId, getGoogleGenAiApiKey } from '../config';

const isTestEnv = process.env.VITEST || process.env.NODE_ENV === 'test';

const fallbackModelId = process.env.GEMINI_MODEL_ID ?? 'gemini-1.5-pro-latest';

const preloadGeminiModelId = isTestEnv
  ? Promise.resolve(fallbackModelId)
  : getGeminiModelId()
      .then((modelId) => {
        process.env.GEMINI_MODEL_ID = modelId;
        return modelId;
      })
      .catch((error) => {
        void error;
        return fallbackModelId;
      });

const preloadGoogleGenAiKey = isTestEnv
  ? Promise.resolve(process.env.GOOGLE_GENAI_API_KEY)
  : getGoogleGenAiApiKey()
      .then((key) => {
        process.env.GOOGLE_GENAI_API_KEY = key;
        return key;
      })
      .catch((error) => {
        void error;
        return undefined;
      });

let defaultModelId = fallbackModelId;
preloadGeminiModelId.then((modelId) => {
  defaultModelId = modelId;
});

const createAi = () =>
  genkit({
    plugins: [googleAI()],
    model: googleAI.model(defaultModelId),
  });

export const ai = isTestEnv
  ? {
      defineFlow: <I = unknown, O = unknown>(
        _config: unknown,
        handler: (input: I, context?: { context?: unknown }) => Promise<O> | O,
      ) =>
        async (input: I, context?: { context?: unknown }) => handler(input, context),
    }
  : createAi();

export const ensureGoogleGenAiApiKeyReady = async (): Promise<string | undefined> => {
  const apiKey = await preloadGoogleGenAiKey;
  await preloadGeminiModelId;
  return apiKey;
};
