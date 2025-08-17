// functions/src/ai/flows/train-lora-model.ts
import { defineFlow } from '@genkit-ai/flow';
import { z } from 'zod';
import { NovitaSDK } from 'novita-sdk';
import { NOVITA_API_KEY } from '../../config';
import * as admin from 'firebase-admin';
import axios from 'axios';
import { deductBmkCredits } from '../../billing';
import { BMK_COSTS } from '../../utils/bmk-costs';

const novitaSdk = new NovitaSDK(NOVITA_API_KEY);

const LoraTrainingInputSchema = z.object({
  userId: z.string(),
  brandId: z.string(),
  trainingType: z.enum(['subject', 'style']),
  modelName: z.string(),
  imageAssetIds: z.array(z.string()),
});

export const trainLoraModelFlow = defineFlow(
  {
    name: 'trainLoraModelFlow',
    inputSchema: LoraTrainingInputSchema,
    outputSchema: z.object({ taskId: z.string() }),
  },
  async (input) => {
    const { userId } = input;
    
    // Deduct credits for training
    const paymentSuccess = await deductBmkCredits(userId, BMK_COSTS.LORA_TRAINING);
    if (!paymentSuccess) {
      throw new Error('Payment failed. Please check your BMK credit balance.');
    }

    // ... (rest of the logic)
    try {
        let response;
        if (input.trainingType === 'subject') {
          response = await novitaSdk.trainSubject({ name: input.modelName, image_dataset_items: input.imageAssetIds.map(id => ({ assets_id: id })) });
        } else {
          response = await novitaSdk.trainStyle({ name: input.modelName, image_dataset_items: input.imageAssetIds.map(id => ({ assets_id: id })) });
        }
        if (!response.task_id) throw new Error('Task ID not returned');
        return { taskId: response.task_id };
    } catch(e) {
        await deductBmkCredits(userId, -BMK_COSTS.LORA_TRAINING); // Refund
        throw new Error('LoRA training failed to start.');
    }
  }
);
// ... (getUploadUrlFlow remains the same)
