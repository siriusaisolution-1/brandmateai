// functions/src/ai/flows/generate-image.ts
import { defineFlow } from '@genkit-ai/flow';
import { z } from 'zod';
import { NovitaSDK } from 'novita-sdk';
import { NOVITA_API_KEY } from '../../config';
import * as admin from 'firebase-admin';
import { deductBmkCredits } from '../../billing';
import { BMK_COSTS } from '../../utils/bmk-costs';

const novitaSdk = new NovitaSDK(NOVITA_API_KEY);

export const ImageGenerationInputSchema = z.object({
  prompt: z.string(),
  // ... other image params
  userId: z.string(),
  brandId: z.string(),
  model_name: z.string().optional(),
});

export const generateImageFlow = defineFlow(
  {
    name: 'generateImageFlow',
    inputSchema: ImageGenerationInputSchema,
    outputSchema: z.object({ taskId: z.string() }),
  },
  async (input) => {
    const { userId, model_name } = input;
    
    // Determine cost and deduct credits
    const isPremium = model_name === 'seedream-3-0-t2i-250415';
    const cost = isPremium ? BMK_COSTS.SEEDREAM_PREMIUM : BMK_COSTS.TEXT_TO_IMAGE_STANDARD;
    const paymentSuccess = await deductBmkCredits(userId, cost);
    if (!paymentSuccess) {
      throw new Error('Payment failed. Please check your BMK credit balance.');
    }
    
    // ... rest of the logic
    const brandRef = admin.firestore().collection('users').doc(input.userId).collection('brands').doc(input.brandId);
    const brandDoc = await brandRef.get();
    const brandData = brandDoc.data();
    const brandStyle = brandData?.style || 'photorealistic';
    const brandTone = brandData?.tone || 'professional';
    const enhancedPrompt = `${input.prompt}, style: ${brandStyle}, tone: ${brandTone}`;
    
    try {
        const response = await novitaSdk.img2img({ ...input, prompt: enhancedPrompt });
        if (!response.task_id) throw new Error('Task ID not returned');
        return { taskId: response.task_id };
    } catch(e) {
        await deductBmkCredits(userId, -cost); // Refund
        throw new Error('Image generation failed.');
    }
  }
);
// ... (checkImageTaskStatusFlow remains the same)
