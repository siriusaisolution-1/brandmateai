import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { GEMINI_MODEL_ID, GOOGLE_GENAI_API_KEY } from '../config';

export const ai = genkit({
  plugins: [googleAI()],
  model: googleAI.model(defaultModelId),
});

export const ensureGoogleGenAiApiKeyReady = (): Promise<string | undefined> => preloadGoogleGenAiKey;