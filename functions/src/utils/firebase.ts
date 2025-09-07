import * as admin from 'firebase-admin';

try {
  if (!admin.apps.length) admin.initializeApp();
} catch {}

export async function getAssetUrl(assetId: string): Promise<string> {
  // TODO: real GCS signed URL
  return `https://storage.example.com/assets/${assetId}`;
}