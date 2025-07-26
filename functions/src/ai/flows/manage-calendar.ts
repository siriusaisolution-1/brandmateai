import { defineFlow } from '@genkit-ai/flow';
import { z } from 'zod';
import * as admin from 'firebase-admin';
import { firestore } from 'firebase-admin';
import { CalendarEvent } from '@/types/firestore';
import { Encryption } from '../utils/encryption';
import * as functions from "firebase-functions";
import * as sgMail from '@sendgrid/mail';

// ... (Initialization code is unchanged)

// Helper function to update the brand's activity timestamp
const updateBrandTimestamp = async (brandId: string) => {
    const brandRef = admin.firestore().collection('brands').doc(brandId);
    await brandRef.update({ lastUpdatedAt: firestore.FieldValue.serverTimestamp() });
};

export const schedulePostFlow = defineFlow(
  {
    name: 'schedulePostFlow',
    inputSchema: z.object({ /* ... schema unchanged ... */ }),
    outputSchema: z.object({ eventId: z.string() }),
    auth: { user: true },
  },
  async (input, context) => {
    // ... (existing logic)
    await newEventRef.set(newEvent);
    
    // Update brand activity timestamp
    await updateBrandTimestamp(input.brandId);

    return { eventId: newEventRef.id };
  }
);

export const sendNewsletterFlow = defineFlow(
  {
    name: 'sendNewsletterFlow',
    inputSchema: z.object({ /* ... schema unchanged ... */ }),
    outputSchema: z.object({ success: z.boolean(), message: z.string() }),
    auth: { user: true },
  },
  async (input, context) => {
    // ... (existing logic)
    await sgMail.send(msg);

    // Update brand activity timestamp
    await updateBrandTimestamp(input.brandId);
    
    return { success: true, message: `Newsletter sent to ${recipientList.length} recipients.` };
  }
);

// ... (publishContentFlow is unchanged as it only reads data)
