import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { FieldValue } from 'firebase-admin/firestore';
import { Encryption } from './utils/encryption'; // We will create this utility

// This should be initialized in index.ts
if (admin.apps.length === 0) {
    admin.initializeApp();
}
const db = admin.firestore();

// IMPORTANT: Set this in your Firebase environment configuration
// firebase functions:config:set crypto.key="your-super-secret-32-byte-key"
const ENCRYPTION_KEY = functions.config().crypto.key;
if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length !== 32) {
    console.error("CRITICAL: Encryption key is not set or is not 32 bytes long. Set it via `firebase functions:config:set crypto.key=...`");
}
const crypto = new Encryption(ENCRYPTION_KEY);

/**
 * Triggered on every user sign-in. If the sign-in included a credential 
 * from an OAuth provider (like Facebook), this function encrypts and stores the access token.
 */
export const storeUserCredential = functions.auth.user().beforeSignIn(async (user, context) => {
    // We only care about sign-ins that have an OAuth credential
    if (!context.credential || !context.credential.accessToken) {
        return;
    }

    const { credential } = context;
    const providerId = credential.providerId; // e.g., 'facebook.com'
    const accessToken = credential.accessToken;
    const refreshToken = credential.refreshToken;

    if (!accessToken) {
        // This can happen on subsequent sign-ins, so it's not an error.
        return;
    }

    // Encrypt the access token before storing it
    const encryptedAccessToken = crypto.encrypt(accessToken);
    
    const integrationData = {
        provider: providerId,
        accessToken: encryptedAccessToken, // Store the encrypted token
        refreshToken: refreshToken, // Refresh tokens are often not provided or needed in this flow
        updatedAt: FieldValue.serverTimestamp(),
    };

    // Store it in a secure, locked-down subcollection
    const integrationRef = db.collection('users').doc(user.uid).collection('integrations').doc(providerId);
    
    await integrationRef.set(integrationData, { merge: true });

    console.log(`Successfully stored/updated credential for user ${user.uid} and provider ${providerId}.`);
});
