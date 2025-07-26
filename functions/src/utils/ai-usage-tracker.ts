import * as admin from 'firebase-admin';
import { GenerateResponse, ModelReference } from '@genkit-ai/ai';
import { gemini15Flash, geminiPro, imagen2 } from '@genkit-ai/googleai';

// Initialize Firestore if not already done
if (admin.apps.length === 0) {
    admin.initializeApp();
}
const db = admin.firestore();

// Price map in USD per 1000 tokens (or per image for image models)
const MODEL_PRICING: Record<string, { input: number; output: number; unit: 'tokens' | 'images' }> = {
    [geminiPro.name]: { input: 0.000125, output: 0.000375, unit: 'tokens' },
    [gemini15Flash.name]: { input: 0.000131, output: 0.000394, unit: 'tokens' }, // Using provided values, though official might be lower
    [imagen2.name]: { input: 0.02, output: 0, unit: 'images' }, // Price per image generated
};

// Conversion rate: 100 BMK = $1.00 USD
const USD_TO_BMK_CONVERSION_RATE = 100;

/**
 * Tracks AI model usage, calculates the cost in BrandMate Kredits (BMK),
 * and deducts it from the user's balance.
 * @param userId The ID of the user who made the call.
 * @param llmResponse The full response object from the Genkit `generate` call.
 */
export async function trackAiCall(userId: string, llmResponse: GenerateResponse<any>) {
    const modelRef = llmResponse.model as ModelReference;
    const modelPricing = MODEL_PRICING[modelRef.name];

    if (!modelPricing) {
        console.warn(`No pricing information for model: ${modelRef.name}. Skipping usage tracking.`);
        return;
    }

    const usage = llmResponse.usage;
    let costInUsd = 0;

    if (modelPricing.unit === 'tokens') {
        const inputTokens = usage.inputTokens || 0;
        const outputTokens = usage.outputTokens || 0;
        costInUsd = (inputTokens / 1000 * modelPricing.input) + (outputTokens / 1000 * modelPricing.output);
    } else if (modelPricing.unit === 'images') {
        // Assuming one image is generated per call for now
        costInUsd = modelPricing.input;
    }

    const costInBmk = Math.ceil(costInUsd * USD_TO_BMK_CONVERSION_RATE);

    if (costInBmk > 0) {
        const userRef = db.collection('users').doc(userId);
        await userRef.update({
            bmkUsage: admin.firestore.FieldValue.increment(costInBmk)
        });
        console.log(`Tracked usage for user ${userId}: ${costInBmk} BMK for model ${modelRef.name}.`);
    }
}
