import { defineFlow } from '@genkit-ai/flow';
import { z } from 'zod';
import * as admin from 'firebase-admin';
import { firestore } from 'firebase-admin';
import { CalendarEvent, AdCampaign, Brand } from '@/types/firestore';
import { Encryption } from '../utils/encryption';
import * as functions from "firebase-functions";

// ... (Initialization is unchanged)

export const launchAdCampaignFlow = defineFlow(
  {
    // ... (schema is unchanged)
    auth: { user: true },
  },
  async ({ eventId, adAccountId }, context) => {
    // ... (auth checks and event fetching is unchanged)
    const event = eventDoc.data() as CalendarEvent;
    
    // ... (token fetching is unchanged)

    try {
      // ... (Simulated API call is unchanged)
      const simulatedPlatformCampaignId = `simulated_${Date.now()}`;
      
      const newCampaignRef = db.collection('adCampaigns').doc();
      const newCampaign: Omit<AdCampaign, 'id'> = {
        eventId,
        brandId: event.brandId, // <-- ADDED THIS LINE
        ownerId: uid,
        platform: 'Meta',
        platformCampaignId: simulatedPlatformCampaignId,
        status: 'Active',
        createdAt: firestore.Timestamp.now(),
      };
      await newCampaignRef.set(newCampaign);

      return {
        success: true,
        campaignId: newCampaignRef.id,
        message: 'Ad campaign has been successfully created (simulation).',
      };

    } catch (error: any) {
      console.error("Failed to create ad campaign:", error);
      return { success: false, message: error.message };
    }
  }
);
