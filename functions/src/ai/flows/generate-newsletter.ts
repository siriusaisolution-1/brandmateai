import { HttpsError } from 'firebase-functions/v1/https';
import { z } from 'zod';

import { ai, ensureGoogleGenAiApiKeyReady } from '../../genkit/ai';
import { extractAuthUserId } from '../../utils/flow-context';
import { trackAiCall } from '../../utils/ai-usage-tracker';

export const generateNewsletterFlow = ai.defineFlow(
  {
    name: 'generateNewsletter',
    inputSchema: z.object({
      audience: z.string(),
      keyPoints: z.array(z.string()),
      brandId: z.string().optional(),
    }),
    outputSchema: z.object({ newsletterContent: z.string() }),
  },
  async ({ audience, keyPoints, brandId }) => {
    await ensureGoogleGenAiApiKeyReady();

    const context = typeof ai.currentContext === 'function' ? ai.currentContext() : undefined;
    const uid = extractAuthUserId(context);

    if (!uid) {
      throw new HttpsError('unauthenticated', 'Authentication is required to generate newsletters.');
    }

    const prompt = `Write a concise newsletter for audience: ${audience}. Cover key points: ${keyPoints.join(', ')}`;
    const startedAt = Date.now();
    const out = await ai.generate({ prompt });
    const latencyMs = Date.now() - startedAt;

    const responseForMetrics =
      typeof out === 'object' && out !== null && 'response' in out
        ? (out as { response?: unknown }).response ?? out
        : out;

    await trackAiCall(uid, responseForMetrics, {
      flow: 'generateNewsletter',
      brandId,
      latencyMs,
    });

    return { newsletterContent: out.text ?? '' };
  }
);
