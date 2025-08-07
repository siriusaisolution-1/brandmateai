// functions/src/ai/flows/prompt-enhancer.ts
import { defineFlow } from '@genkit-ai/flow';
import { z } from 'zod';
import { geminiPro } from 'genkitx-googleai'; // Assuming we'll use a specific model instance
import * as admin from 'firebase-admin';

// Using Gemini Flash as our primary text model, as decided.
const enhancerModel = geminiPro; 

// Define input schema
const EnhancePromptInputSchema = z.object({
  userId: z.string(),
  brandId: z.string(),
  basePrompt: z.string(),
  taskType: z.enum(['image', 'video', 'blog', 'social']),
});

// Define output schema based on the proposal
const EnhancedOutputSchema = z.object({
  enhancedPrompt: z.string(),
  technicalDetails: z.record(z.any()).optional(),
});

export const enhancePromptFlow = defineFlow(
  {
    name: 'enhancePromptFlow',
    inputSchema: EnhancePromptInputSchema,
    outputSchema: EnhancedOutputSchema,
  },
  async (input) => {
    const { userId, brandId, basePrompt, taskType } = input;

    // 1. Fetch brand data
    const brandRef = admin.firestore().collection('users').doc(userId).collection('brands').doc(brandId);
    const brandDoc = await brandRef.get();
    const brandData = brandDoc.data() || {};
    const brandStyle = brandData.style || 'default style';
    const brandTone = brandData.tone || 'neutral tone';
    const loraId = brandData.loraId || null; // Fetch the trained LoRA model ID

    // 2. Define the System Prompt based on the task
    let systemPrompt = '';
    if (taskType === 'image') {
      systemPrompt = `You are a professional photo art-director. Use the provided BRAND_STYLE and LoRA model to expand the user's prompt into a detailed, technical prompt for an image generation model. Return only the final prompt string.`;
    } else if (taskType === 'video') {
      systemPrompt = `You are a film DOP. Optimize the user's prompt for a 10s product shot, incorporating the brand's LoRA model. Return a detailed, cinematic prompt.`;
    } else {
      systemPrompt = `You are BrandMate AI Copywriter. Follow the BRAND_TONE strictly.`;
    }

    // 3. Construct the user template for the enhancer model
    const userPromptForEnhancer = `
      BASE_PROMPT: ${basePrompt}
      BRAND_STYLE: ${brandStyle}
      BRAND_TONE: ${brandTone}
      ${loraId ? `BRAND_LORA_ID: ${loraId}` : ''}
    `;
    
    // 4. Call the enhancer model
    const llmResponse = await enhancerModel.generate({
        prompt: userPromptForEnhancer,
        systemPrompt: systemPrompt,
    });
    
    const enhancedPrompt = llmResponse.text();
    
    // If LoRA exists, prepend it to the prompt for Novita.ai
    const finalPrompt = loraId ? `<lora:${loraId}> ${enhancedPrompt}` : enhancedPrompt;

    return {
      enhancedPrompt: finalPrompt,
    };
  }
);
