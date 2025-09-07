import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

if (admin.apps.length === 0) {
    admin.initializeApp();
}

/**
 * A generic, callable function to track user events from the frontend.
 * This provides a single entry point for all product analytics.
 * @param eventName The name of the event (e.g., 'Brand Created').
 * @param properties An object containing event metadata (e.g., { source: 'ai_audit' }).
 */
export const trackEvent = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        // We only track events for authenticated users.
        throw new functions.https.HttpsError('unauthenticated', 'You must be logged in to track events.');
    }

    const uid = context.auth.uid;
    const { eventName, properties } = data;

    if (typeof eventName !== 'string' || !eventName) {
        throw new functions.https.HttpsError('invalid-argument', 'A valid eventName string is required.');
    }

    // For now, we just log the event to Google Cloud's default logging.
    // In the future, you would add your analytics provider's SDK here.
    // For example: await posthog.capture({ distinctId: uid, event: eventName, properties });
    console.log(`Analytics Event Tracked:`, {
        userId: uid,
        event: eventName,
        properties: properties || {},
    });

    return { success: true };
});
