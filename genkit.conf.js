import { configureGenkit } from '@genkit-ai/core';
import { firebase } from '@genkit-ai/firebase';
import { googleAI } from '@genkit-ai/googleai';

export default configureGenkit({
  plugins: [
    firebase(),
    googleAI(), // No API key needed here when running in Google Cloud environment
  ],
  logSinks: ['firebase'],
  enableTracingAndMetrics: true,
});
