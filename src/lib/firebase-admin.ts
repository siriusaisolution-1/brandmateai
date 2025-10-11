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
    throw new Error('FIREBASE_STORAGE_BUCKET is missing');
  }

  // Dozvoli moderni (.firebasestorage.app) i legacy (.appspot.com) domen
  const bucketOk = /\.(firebasestorage\.app|appspot\.com)$/i.test(bucket);
  if (!bucketOk) {
    console.warn(
      `Suspicious bucket name "${bucket}". Expected *.firebasestorage.app or *.appspot.com`
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

export function getAuth() {
  return getAdminApp().auth();
}