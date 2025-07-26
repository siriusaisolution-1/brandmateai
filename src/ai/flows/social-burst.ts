import { defineFlow, runFlow } from '@genkit-ai/flow';
import { z } from 'zod';
import { geminiPro } from '@genkit-ai/googleai';
import { generate } from '@genkit-ai/ai';
import * as admin from 'firebase-admin';
import { Brand } from '@/types/firestore';
import { trackAiCall } from '../utils/ai-usage-tracker';
import { moderateTextFlow } from './moderation'; // <-- IMPORT MODERATION FLOW

// ... (Initialization and schemas are unchanged)

export const generateSocialBurstFlow = defineFlow(
  {
    name: 'generateSocialBurstFlow',
    inputSchema: z.object({ /* ... schema unchanged ... */ }),
    outputSchema: z.array(z.object({ /* ... schema unchanged ... */ })),
    auth: { user: true },
  },
  async (input, context) => {
    const uid = context.auth!.uid;
    // ... (logic for fetching brand and creating prompt is unchanged)

    const llmResponse = await generate({ /* ... */ });
    await trackAiCall(uid, llmResponse);

    const posts = llmResponse.output();
    if (!posts) {
        throw new Error("The AI failed to generate social media posts.");
    }
    
    // Check all generated posts for safety
    const allTextContent = posts.map(p => p.content).join(' 
 ');
    const moderationResult = await runFlow(moderateTextFlow, allTextContent);
    if (!moderationResult.isSafe) {
        throw new Error(`Generated content violates safety policies (${moderationResult.categories.join(', ')}). Please try a different topic.`);
    }
    
    return posts;
  }
);
