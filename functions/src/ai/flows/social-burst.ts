// functions/src/ai/flows/social-burst.ts
import { defineFlow, run } from '@genkit-ai/flow';
import { z } from 'zod';
import { geminiPro } from 'genkitx-googleai'; // Use our chosen model
import { deductBmkCredits } from '../../billing';
import { BMK_COSTS } from '../../utils/bmk-costs';
import { enhancePromptFlow } from './prompt-enhancer';

const SocialBurstInputSchema = z.object({
  brandId: z.string(),
  userId: z.string(),
  topic: z.string().min(3),
  durationDays: z.number().int().positive(),
});

export const socialBurstFlow = defineFlow(
  {
    name: 'socialBurstFlow',
    inputSchema: SocialBurstInputSchema,
    outputSchema: z.any(), // Define a proper output schema later
  },
  async (input) => {
    const { userId, brandId, topic } = input;

    // 1. Deduct credits FIRST
    const paymentSuccess = await deductBmkCredits(userId, BMK_COSTS.SOCIAL_BURST);
    if (!paymentSuccess) {
      throw new Error('Payment failed. Please check your BMK credit balance.');
    }

    // 2. Enhance the prompt using the MCP
    const enhancedResult = await run('enhance-social-prompt', () =>
      enhancePromptFlow.run({
        userId,
        brandId,
        basePrompt: `Create a series of social media posts about: ${topic}`,
        taskType: 'social',
      })
    );

    // 3. Execute the task with the enhanced prompt
    try {
      const llmResponse = await geminiPro.generate({
          prompt: enhancedResult.enhancedPrompt,
          // Add specific configurations for social burst if needed
      });
      // Process and return the response
      return { success: true, content: llmResponse.text() };
    } catch (e) {
      // Refund credits on failure
      await deductBmkCredits(userId, -BMK_COSTS.SOCIAL_BURST);
      console.error("Social Burst generation failed:", e);
      throw new Error("Failed to generate social burst.");
    }
  }
);
