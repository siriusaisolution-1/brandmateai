// functions/src/auth-triggers.ts
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { Encryption } from './utils/encryption';

// Init Admin SDK
if (admin.apps.length === 0) {
  admin.initializeApp();
}
const db = admin.firestore();

/**
 * ENCRYPTION_KEY iz okruženja ili iz functions.config()
 * - Preferiramo process.env (nova preporuka)
 * - Fallback na functions.config() (legacy) – radi do marta 2026.
 */
const ENV_KEY = process.env.ENCRYPTION_KEY;
const CFG_KEY = (() => {
  try {
    // @ts-ignore - types mogu biti strogi u nekim setup-ima
    return functions.config()?.crypto?.key as string | undefined;
  } catch {
    return undefined;
  }
})();
const ENCRYPTION_KEY = ENV_KEY || CFG_KEY;
const KEY_VALID = !!ENCRYPTION_KEY && ENCRYPTION_KEY.length === 32;

if (!KEY_VALID) {
  console.warn(
    'ENCRYPTION_KEY nije postavljen ili nije tačno 32 znaka. ' +
    'Privremeno ću preskočiti čuvanje OAuth tokena dok ne postaviš ključ. ' +
    'Preporuka: postavi ENCRYPTION_KEY preko env var (ili firebase functions:config:set crypto.key="...").'
  );
}

/**
 * Trigger: pre svakog sign-ina.
 * Ako sign-in ima OAuth credential, enkriptuje i snima access token u
 * users/{uid}/integrations/{providerId}.
 */
export const storeUserCredential = functions.auth.user().beforeSignIn(async (user, context) => {
  // Ako nema validnog ključa, ne pokušavamo da pišemo
  if (!KEY_VALID) {
    console.warn('Skipping credential storage due to invalid/missing ENCRYPTION_KEY.');
    return;
  }

  if (!context.credential || !context.credential.accessToken) {
    return;
  }

  const { credential } = context;
  const providerId = credential.providerId; // npr. 'facebook.com'
  const accessToken = credential.accessToken;
  const refreshToken = credential.refreshToken ?? null;

  if (!accessToken) return;

  const encryptedAccessToken = Encryption.encrypt(accessToken, ENCRYPTION_KEY!);

  const integrationData = {
    provider: providerId,
    accessToken: encryptedAccessToken,
    refreshToken,
    updatedAt: FieldValue.serverTimestamp(),
  };

  const integrationRef = db
    .collection('users')
    .doc(user.uid)
    .collection('integrations')
    .doc(providerId);

  await integrationRef.set(integrationData, { merge: true });
  console.log(`Stored credential for user ${user.uid} and provider ${providerId}.`);
});