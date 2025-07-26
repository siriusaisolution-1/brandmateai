import { defineFlow, runFlow } from '@genkit-ai/flow';
import { z } from 'zod';
import { gemini10Pro } from '@genkit-ai/googleai';      // ← novi naziv modela
import { generate } from '@genkit-ai/ai';
import * as admin from 'firebase-admin';
import { Brand } from '@/types/firestore';
import { trackAiCall } from '../utils/ai-usage-tracker';
import { moderateTextFlow } from './moderation';

// ────────────────────────────────────────────────────────────────

// ❶ Definišemo šemu ulaza/izlaza (prilagodi po potrebi)
const InputSchema = z.object({
  brandId: z.string(),
  topic: z.string().min(3),
  durationDays: z.number().int().positive(),
});

const OutputItemSchema = z.object({
  platform: z.string(),                // npr. "Instagram"
  content: z.string(),                 // tekst objave
  mediaType: z.enum(['image', 'video', 'carousel', 'none']),
  suggestedTime: z.string(),           // npr. "2025-08-01T10:00:00"
});

// ────────────────────────────────────────────────────────────────

export const generateSocialBurstFlow = defineFlow(
  {
    name: 'generateSocialBurstFlow',
    inputSchema: InputSchema,
    outputSchema: z.array(OutputItemSchema),
    auth: { user: true },
  },
  async (input, context) => {
    const uid = context.auth!.uid;

    // ❷ Učitaj brend iz Firestore-a (primer)
    const brandSnap = await admin
      .firestore()
      .doc(`users/${uid}/brands/${input.brandId}`)
      .get();

    if (!brandSnap.exists) {
      throw new Error('Brand not found.');
    }

    const brand = brandSnap.data() as Brand;

    // ❸ Konstruisi prompt za LLM
    const prompt = `
You are a social-media marketing assistant.
Generate a ${input.durationDays}-day posting plan for the brand "${brand.name}".
Brand voice: ${brand.brandVoice || 'neutral'}.
Topic: "${input.topic}".

Return ONLY valid JSON array with:
[{ platform, content, mediaType, suggestedTime }]
`.trim();

    // ❹ Pozovi Gemini 1.0-pro (gemini10Pro)
    const llmResponse = await generate({
      model: gemini10Pro,
      prompt,
      output: { format: 'json' },
    });

    await trackAiCall(uid, llmResponse);        // evidentiraj potrošnju

    const posts = llmResponse.output<typeof OutputItemSchema['_type'][]>();
    if (!posts) {
      throw new Error('The AI failed to generate social media posts.');
    }

    // ❺ Moderacija celog teksta
    const allTextContent = posts.map(p => p.content).join('\n');
    const moderationResult = await runFlow(moderateTextFlow, allTextContent);

    if (!moderationResult.isSafe) {
      throw new Error(
        `Generated content violates safety policies (${moderationResult.categories.join(
          ', ',
        )}). Please try a different topic.`,
      );
    }

    return posts;
  },
);