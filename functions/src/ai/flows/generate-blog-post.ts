import { defineFlow, runFlow } from '@genkit-ai/flow';
import { z } from 'zod';
import { gemini15Flash } from '@genkit-ai/googleai';
import { generate } from '@genkit-ai/ai';
import * as admin from 'firebase-admin';
import { Brand } from '@/types/firestore';
import { trackAiCall } from '../utils/ai-usage-tracker';
import { moderateTextFlow } from './moderation'; // <-- IMPORT MODERATION FLOW

// ... (Initialization and schemas are unchanged)

export const generateBlogPostFlow = defineFlow(
  {
    name: 'generateBlogPostFlow',
    inputSchema: z.object({ /* ... schema unchanged ... */ }),
    outputSchema: z.object({ /* ... schema unchanged ... */ }),
    auth: { user: true },
  },
  async (input, context) => {
    const uid = context.auth!.uid;
    // ... (logic for fetching brand and creating prompt is unchanged)
    
    const llmResponse = await generate({ /* ... */ });
    await trackAiCall(uid, llmResponse);

    const blogPost = llmResponse.output();
    if (!blogPost) {
      throw new Error("The AI failed to generate a blog post.");
    }
    
    // Check the generated content for safety
    const moderationResult = await runFlow(moderateTextFlow, blogPost.body);
    if (!moderationResult.isSafe) {
        throw new Error(`Generated content violates safety policies (${moderationResult.categories.join(', ')}). Please try a different topic.`);
    }

    return blogPost;
  }
);
