// src/lib/firebase-admin.ts
import * as admin from 'firebase-admin';

let _app: admin.app.App | undefined;

export function getAdminApp(): admin.app.App {
  if (_app) return _app;

  const svcB64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
  if (!svcB64) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_BASE64 is missing');
  }

  const bucket = process.env.FIREBASE_STORAGE_BUCKET;
  if (!bucket) {
    throw new Error(
      'FIREBASE_STORAGE_BUCKET is not set (expected e.g. brandmate-ai.appspot.com or brandmate-ai.firebasestorage.app)'
    );
  }

  const isAppspot = bucket.endsWith('.appspot.com');
  const isFirebaseStorageApp = bucket.endsWith('.firebasestorage.app');
  if (!isAppspot && !isFirebaseStorageApp) {
    console.warn(
      `[firebase-admin] WARN: FIREBASE_STORAGE_BUCKET="${bucket}" does not match expected storage host patterns (*.appspot.com or *.firebasestorage.app).`
    );
  }

  const serviceAccount = JSON.parse(
    Buffer.from(svcB64, 'base64').toString('utf8')
  );

  _app = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: bucket,
  });

  return _app;
}

export function getBucket() {
  return getAdminApp().storage().bucket();
}

export const adminAuth = () => getAuth(getAdminApp());
export const adminStorage = () => getStorage(getAdminApp());
