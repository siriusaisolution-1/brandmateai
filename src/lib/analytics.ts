import { functions } from './firebase';
import { httpsCallable } from 'firebase/functions';

// Lazy load the function to avoid cold start issues on every import
const trackEventFunction = httpsCallable(functions, 'trackEvent');

/**
 * Tracks a custom event.
 * This function will not throw an error if the tracking fails,
 * ensuring that analytics failures do not impact user experience.
 * @param eventName The name of the event to track.
 * @param properties Optional metadata for the event.
 */
export const track = (eventName: string, properties?: Record<string, any>): void => {
    trackEventFunction({ eventName, properties })
        .catch(error => {
            // We log the error to the console for debugging, but don't interrupt the user.
            console.error("Analytics tracking failed:", error);
        });
};
