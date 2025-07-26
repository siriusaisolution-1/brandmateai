import { defineFlow, run } from '@genkit-ai/flow';
import { z } from 'zod';
import { firebase } from '@genkit-ai/firebase';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import * as admin from 'firebase-admin';
import { Brand } from '@/types/firestore';

// ... (Initialization is unchanged)

const BrandInputSchema = z.object({
    name: z.string(),
    logoUrl: z.string(), // Assuming logo is already uploaded
    colors: z.array(z.string()),
    fonts: z.array(z.string()),
    brandVoice: z.string(),
    keyInfo: z.string(),
    industry: z.string().optional(),
    competitorWebsites: z.array(z.string()).optional(),
});

export const saveBrandFlow = defineFlow(
    {
        name: 'saveBrandFlow',
        inputSchema: BrandInputSchema,
        outputSchema: z.object({ brandId: z.string() }),
        auth: { user: true },
    },
    async (input, context) => {
        if (!context.auth) throw new Error("Authentication is required.");
        const uid = context.auth.uid;

        const brandRef = db.collection('brands').doc();
        const newBrand: Omit<Brand, 'id'> = {
            ownerId: uid,
            ...input,
            lastUpdatedAt: FieldValue.serverTimestamp(), // Set initial timestamp
        };

        await brandRef.set(newBrand);
        return { brandId: brandRef.id };
    }
);


// ... (existing uploadMediaAssetFlow)
// Helper function to update the brand's activity timestamp
const updateBrandTimestamp = async (brandId: string) => { /* ... */ };
export const uploadMediaAssetFlow = defineFlow({ /* ... */ });
