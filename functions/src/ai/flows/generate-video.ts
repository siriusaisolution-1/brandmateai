// functions/src/ai/flows/generate-video.ts
import { defineFlow } from '@genkit-ai/flow';
import { z } from 'zod';
import { NovitaSDK } from 'novita-sdk';
import { NOVITA_API_KEY } from '../../config';
import * as admin from 'firebase-admin';
import { deductBmkCredits } from '../../billing';
import { BMK_COSTS } from '../../utils/bmk-costs';

const novitaSdk = new NovitaSDK(NOVITA_API_KEY);

const VideoGenerationInputSchema = z.object({
  imageUrls: z.array(z.string().url()),
  userPrompt: z.string(),
  brandId: z.string(),
  userId: z.string(),
  duration: z.number().optional().default(6),
});

export const generateVideoFlow = defineFlow(
  {
    name: 'generateVideoFlow',
    inputSchema: VideoGenerationInputSchema,
    outputSchema: z.string(),
  },
  async (input) => {
    const { userId, duration } = input;
    
    // Determine cost and deduct credits BEFORE making the API call
    const cost = duration === 12 ? BMK_COSTS.VIDEO_GENERATION_12S : BMK_COSTS.VIDEO_GENERATION_6S;
    const paymentSuccess = await deductBmkCredits(userId, cost);
    if (!paymentSuccess) {
      throw new Error('Payment failed. Please check your BMK credit balance.');
    }

    // ... (rest of the logic remains the same)
    const brandRef = admin.firestore().collection('users').doc(input.userId).collection('brands').doc(input.brandId);
    const brandDoc = await brandRef.get();
    const brandData = brandDoc.data();
    const brandStyle = brandData?.style || 'a timeless, nostalgic style';
    const brandTone = brandData?.tone || 'cinematic';
    
    const technicalPrompt = `Style: ${brandStyle}, ${brandTone}. Action: ${input.userPrompt}.`;

    try {
      const response = await novitaSdk.img2video({
        model_name: 'minimax-hailuo-02',
        prompt: technicalPrompt,
        image_url: input.imageUrls[0],
        duration: duration,
        resolution: '1080P',
        enable_prompt_expansion: true,
      });
      return response.task_id;
    } catch (error) {
      console.error('Minimax Hailuo-02 failed:', error);
      try {
        const fallbackResponse = await novitaSdk.img2video({
          model_name: 'kling-v1.6-i2v',
          mode: 'Professional',
          image_url: input.imageUrls[0],
          prompt: technicalPrompt,
          duration: duration === 12 ? 10 : 5,
        });
        return fallbackResponse.task_id;
      } catch (fallbackError) {
        // IMPORTANT: Refund credits if the fallback also fails
        await deductBmkCredits(userId, -cost); // Refund by deducting a negative amount
        console.error('KLING V1.6 also failed:', fallbackError);
        throw new Error('Both video generation models failed.');
      }
    }
  }
);
