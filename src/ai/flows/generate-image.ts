// functions/src/ai/flows/generate-image.ts
import { defineFlow, run } from '@genkit-ai/flow';
import { z } from 'zod';
import { NovitaSDK } from 'novita-sdk';
import { NOVITA_API_KEY } from '../../config';
import { deductBmkCredits } from '../../billing';
import { BMK_COSTS } from '../../utils/bmk-costs';
import { enhancePromptFlow } from './prompt-enhancer'; // Import the new enhancer flow

const novitaSdk = new NovitaSDK(NOVITA_API_KEY);

export const ImageGenerationInputSchema = z.object({
  prompt: z.string(),
  userId: z.string(),
  brandId: z.string(),
  model_name: z.string().optional(),
  // All other Novita.ai parameters can be passed here
  width: z.number().optional().default(1024),
  height: z.number().optional().default(1024),
});

export const generateImageFlow = defineFlow(
  {
    name: 'generateImageFlow',
    inputSchema: ImageGenerationInputSchema,
    outputSchema: z.object({ taskId: z.string() }),
  },
  async (input) => {
    const { userId, brandId, prompt } = input;
    
    // --- MCP Step 1: Enhance the Prompt ---
    const enhancedResult = await run('enhance-user-prompt', () => 
      enhancePromptFlow.run({
        userId,
        brandId,
        basePrompt: prompt,
        taskType: 'image',
      })
    );

    // --- MCP Step 2: Billing ---
    const isPremium = input.model_name === 'seedream-3-0-t2i-250415';
    const cost = isPremium ? BMK_COSTS.SEEDREAM_PREMIUM : BMK_COSTS.TEXT_TO_IMAGE_STANDARD;
    const paymentSuccess = await deductBmkCredits(userId, cost);
    if (!paymentSuccess) {
      throw new Error('Payment failed. Please check your BMK credit balance.');
    }
    
    // --- MCP Step 3: Execute the Task with the Enhanced Prompt ---
    const executionPayload = {
      ...input, // Pass all original params like width, height, etc.
      prompt: enhancedResult.enhancedPrompt, // Use the enhanced prompt
    };

    try {
        const response = await novitaSdk.img2img(executionPayload);
        if (!response.task_id) throw new Error('Task ID not returned from Novita.ai');
        return { taskId: response.task_id };
    } catch(e) {
        await deductBmkCredits(userId, -cost); // Refund on failure
        console.error("Novita.ai API call failed:", e);
        throw new Error('Image generation failed.');
    }
  }
);

// ... (checkImageTaskStatusFlow remains the same as it's a generic utility)
