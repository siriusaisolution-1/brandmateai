// functions/src/utils/firebase.ts
import * as admin from 'firebase-admin';

import { structuredLogger } from './observability';

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

  // Dozvoli i moderni i legacy domen
  const bucketOk = /\.(firebasestorage\.app|appspot\.com)$/i.test(bucket);
  if (!bucketOk) {
    structuredLogger.warn('Suspicious Firebase storage bucket', {
      traceId: null,
      userId: null,
      brandId: null,
      flow: 'firebase.getAdminApp',
      latencyMs: null,
      bucket,
    });
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

/**
 * Resolve real media asset URL:
 * - ako doc ima `url`, vrati ga direktno
 * - ako ima `storagePath`, izdati potpisani READ URL (1h)
 */
export async function getAssetUrl(assetId: string): Promise<string> {
  const app = getAdminApp(); // garantuje da je Admin inicijalizovan
  const db = app.firestore();

  const snap = await db.collection('mediaAssets').doc(assetId).get();
  if (!snap.exists) {
    throw new Error(`Media asset ${assetId} does not exist.`);
  }

  const data = snap.data() as { url?: string; storagePath?: string } | undefined;
  if (!data) {
    throw new Error(`Media asset ${assetId} is missing data.`);
  }

  if (data.url) {
    return data.url;
  }

  if (data.storagePath) {
    const [signedUrl] = await app
      .storage()
      .bucket()
      .file(data.storagePath)
      .getSignedUrl({
        action: 'read',
        expires: Date.now() + 60 * 60 * 1000,
      });

    return signedUrl;
  }

  throw new Error(`Media asset ${assetId} is missing a url or storagePath.`);
}