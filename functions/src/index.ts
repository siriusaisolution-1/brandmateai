import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

// ... (Initialization and other exports are unchanged)

// ANALYTICS FUNCTIONS
// ===================================
import { trackEvent } from './analytics';
export { trackEvent };
