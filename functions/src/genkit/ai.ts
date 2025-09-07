import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';
import * as functions from 'firebase-functions';

const GOOGLE_GENAI_API_KEY =
  (functions.config().google?.genai_key as string) ||
  process.env.GOOGLE_GENAI_API_KEY ||
  '';

const GEMINI_MODEL_ID =
  (functions.config().google?.gemini_model_id as string) ||
  process.env.GEMINI_MODEL_ID ||
  'gemini-1.5-pro-latest';

export const ai = genkit({
  plugins: [googleAI({ apiKey: GOOGLE_GENAI_API_KEY })],
  model: googleAI.model(GEMINI_MODEL_ID),
});