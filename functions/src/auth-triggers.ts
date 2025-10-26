// functions/src/auth-triggers.ts
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { Encryption } from './utils/encryption';
import { ENCRYPTION_KEY, HAS_VALID_ENCRYPTION_KEY } from './config';
import { instrumentBeforeSignIn, structuredLogger } from './utils/observability';

type BeforeSignInContext = functions.auth.UserRecordMetadata & {
  credential?: {
    providerId: string;
    accessToken?: string;
    refreshToken?: string | null;
  };
  eventId?: string;
};

// Init Admin SDK
if (admin.apps.length === 0) {
  admin.initializeApp();
}
const db = admin.firestore();

if (!HAS_VALID_ENCRYPTION_KEY) {
  structuredLogger.warn('Invalid or missing encryption key', {
    traceId: null,
    userId: null,
    brandId: null,
    flow: 'auth.storeUserCredential',
    latencyMs: null,
  });
}

/**
 * Trigger: pre svakog sign-ina.
 * Ako sign-in ima OAuth credential, enkriptuje i snima access token u
 * users/{uid}/integrations/{providerId}.
 */
const storeUserCredentialHandler = async (
  user: functions.auth.UserRecord,
  context: BeforeSignInContext,
) => {
  if (!HAS_VALID_ENCRYPTION_KEY || !ENCRYPTION_KEY) {
    structuredLogger.warn('Skipping credential storage due to invalid encryption key', {
      traceId: context.eventId ?? null,
      userId: user.uid,
      brandId: null,
      flow: 'auth.storeUserCredential',
      latencyMs: null,
    });
    return;
  }

  if (!('credential' in context) || !context.credential || !context.credential.accessToken) {
    return;
  }

  const { credential } = context;
  const providerId = credential.providerId;
  const accessToken = credential.accessToken;
  const refreshToken = credential.refreshToken ?? null;

  if (!accessToken) {
    return;
  }

  const encryptedAccessToken = Encryption.encrypt(accessToken, ENCRYPTION_KEY);

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
  structuredLogger.info('Stored OAuth credential', {
    traceId: context.eventId ?? null,
    userId: user.uid,
    brandId: null,
    flow: 'auth.storeUserCredential',
    latencyMs: null,
    providerId,
  });
};

export const storeUserCredential = instrumentBeforeSignIn(
  'auth.storeUserCredential',
  storeUserCredentialHandler,
  { flow: 'auth.storeUserCredential' },
);