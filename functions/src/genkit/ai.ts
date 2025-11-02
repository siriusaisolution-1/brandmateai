import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';
import { getGeminiModelId, getGoogleGenAiApiKey } from '../config';

const preloadGoogleGenAiKey = getGoogleGenAiApiKey()
  .then((apiKey) => {
    if (!process.env.GOOGLE_GENAI_API_KEY) {
      process.env.GOOGLE_GENAI_API_KEY = apiKey;
    }
    if (!process.env.GOOGLE_API_KEY) {
      process.env.GOOGLE_API_KEY = apiKey;
    }
    if (!process.env.GEMINI_API_KEY) {
      process.env.GEMINI_API_KEY = apiKey;
    }
    return apiKey;
  })
  .catch((error) => {
    console.error('Failed to preload GOOGLE_GENAI_API_KEY from Secret Manager', error);
    return undefined;
  });

void getGeminiModelId()
  .then((modelId) => {
    process.env.GEMINI_MODEL_ID = modelId;
  })
  .catch(() => undefined);

const defaultModelId = process.env.GEMINI_MODEL_ID ?? 'gemini-1.5-pro-latest';

export const ai = genkit({
  plugins: [googleAI()],
  model: googleAI.model(defaultModelId),
});

export const ensureGoogleGenAiApiKeyReady = (): Promise<string | undefined> => preloadGoogleGenAiKey;