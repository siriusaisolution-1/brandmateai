import { getApps, initializeApp, cert, getApp } from 'firebase-admin/app';
import { getAuth as _getAuth } from 'firebase-admin/auth';
import { getStorage as _getStorage } from 'firebase-admin/storage';

/**
 * Pokuša da pročita service account iz:
 * - FIREBASE_SERVICE_ACCOUNT (JSON)
 * - FIREBASE_SERVICE_ACCOUNT_BASE64 (base64 kodiran JSON)
 */
function parseServiceAccount(): null | {
  project_id: string;
  client_email: string;
  private_key: string;
} {
  const rawJson = process.env.FIREBASE_SERVICE_ACCOUNT;
  const rawB64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;

  try {
    if (rawJson) {
      const svc = JSON.parse(rawJson);
      return {
        project_id: svc.project_id,
        client_email: svc.client_email,
        private_key: (svc.private_key || '').replace(/\\n/g, '\n'),
      };
    }
    if (rawB64) {
      const decoded = Buffer.from(rawB64, 'base64').toString('utf8');
      const svc = JSON.parse(decoded);
      return {
        project_id: svc.project_id,
        client_email: svc.client_email,
        private_key: (svc.private_key || '').replace(/\\n/g, '\n'),
      };
    }
  } catch (e) {
    console.warn('Failed to parse FIREBASE service account from env:', (e as Error).message);
  }
  return null;
}

function desiredBucket(projectIdFromSA?: string) {
  const envBucket = process.env.FIREBASE_STORAGE_BUCKET || null;
  if (envBucket) return envBucket;
  if (projectIdFromSA) return `${projectIdFromSA}.appspot.com`;
  return undefined; // dozvoli default ponašanje
}

function initApp() {
  if (!getApps().length) {
    const svc = parseServiceAccount();
    const projectId =
      process.env.GOOGLE_CLOUD_PROJECT ||
      process.env.GCP_PROJECT ||
      process.env.FIREBASE_PROJECT_ID ||
      svc?.project_id;

    const bucket = desiredBucket(svc?.project_id);

    if (svc) {
      initializeApp({
        credential: cert({
          projectId: svc.project_id,
          clientEmail: svc.client_email,
          privateKey: svc.private_key,
        }),
        storageBucket: bucket,
      });
    } else {
      // Fallback na ADC / varijable okruženja koje već postoje
      initializeApp({
        projectId,
        storageBucket: bucket,
      });
    }
  } else {
    getApp();
  }
}

// Public helpers
export function getAuth() {
  initApp();
  return _getAuth();
}

export function getStorage() {
  initApp();
  return _getStorage();
}
