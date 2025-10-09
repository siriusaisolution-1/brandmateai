// src/lib/firebase-admin.ts
import { initializeApp, cert, App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getStorage } from 'firebase-admin/storage';

let app: App | null = null;

function getServiceAccountFromEnv() {
  const b64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
  if (!b64) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_BASE64 is not set');
  }
  const jsonStr = Buffer.from(b64, 'base64').toString('utf-8');
  const svc = JSON.parse(jsonStr);

  for (const k of ['project_id', 'client_email', 'private_key'] as const) {
    if (!svc[k]) throw new Error(`Service account JSON missing ${k}`);
  }
  return svc;
}

export function getAdminApp() {
  if (app) return app;

  const svc = getServiceAccountFromEnv();
  const bucket = process.env.FIREBASE_STORAGE_BUCKET;
  if (!bucket) {
    throw new Error(
      'FIREBASE_STORAGE_BUCKET is not set (expected e.g. brandmate-ai.appspot.com)'
    );
  }
  if (!bucket.endsWith('.appspot.com')) {
    console.warn(
      `[firebase-admin] WARN: FIREBASE_STORAGE_BUCKET="${bucket}" ne izgleda kao GCS bucket (*.appspot.com).`
    );
  }

  app = initializeApp({
    credential: cert({
      projectId: svc.project_id,
      clientEmail: svc.client_email,
      privateKey: svc.private_key,
    }),
    storageBucket: bucket,
  });
  return app;
}

export const adminAuth = () => getAuth(getAdminApp());
export const adminStorage = () => getStorage(getAdminApp());