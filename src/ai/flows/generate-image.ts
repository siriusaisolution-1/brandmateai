import { defineFlow } from '@genkit-ai/flow';
import { z } from 'zod';
import { generate } from '@genkit-ai/ai';
import { imagen2 } from '@genkit-ai/googleai';
import * as admin from 'firebase-admin';
import { Brand, MediaAsset } from '@/types/firestore';
import { getStorage } from 'firebase-admin/storage';
import { v4 as uuidv4 } from 'uuid';
import { trackAiCall } from '../utils/ai-usage-tracker'; // <-- IMPORT TRACKER

// ... (Initialization, schemas, and helper function are unchanged)

export const generateImageFlow = defineFlow(
  {
    name: 'generateImageFlow',
    inputSchema: z.object({ /* ... schema unchanged ... */ }),
    outputSchema: z.object({ assetId: z.string(), url: z.string() }),
    auth: { user: true },
  },
  async (input, context) => {
    const uid = context.auth!.uid;
    // ... (logic for loading brand and constructing prompt is unchanged)

    const llmResponse = await generate({
      model: imagen2,
      prompt: enhancedPrompt,
      config: { aspectRatio: '1:1' },
    });

    // Track the AI call usage
    await trackAiCall(uid, llmResponse);

    const generatedImage = llmResponse.output();
    if (!generatedImage) {
      throw new Error('AI failed to generate an image.');
    }
    
    // ... (logic for saving image to storage and Firestore is unchanged)
    
    await mediaAssetRef.set(newAsset);
    await updateBrandTimestamp(brandId);

    return {
      assetId: newAsset.assetId,
      url: newAsset.url,
    };
  }
);
