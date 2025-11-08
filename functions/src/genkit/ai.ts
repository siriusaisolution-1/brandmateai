import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

import { getGeminiModelId, getGoogleGenAiApiKey } from '../config';

const fallbackModelId = process.env.GEMINI_MODEL_ID ?? 'gemini-1.5-pro-latest';

const preloadGeminiModelId = getGeminiModelId()
  .then((modelId) => {
    process.env.GEMINI_MODEL_ID = modelId;
    return modelId;
  })
  .catch((error) => {
    void error;
    return fallbackModelId;
  });

const preloadGoogleGenAiKey = getGoogleGenAiApiKey()
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

export const ai = genkit({
  plugins: [googleAI()],
  model: googleAI.model(defaultModelId),
});

export const ensureGoogleGenAiApiKeyReady = async (): Promise<string | undefined> => {
  const apiKey = await preloadGoogleGenAiKey;
  await preloadGeminiModelId;
  return apiKey;
};
