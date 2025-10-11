import * as admin from 'firebase-admin';

try {
  if (!admin.apps.length) admin.initializeApp();
} catch {}

export async function getAssetUrl(assetId: string): Promise<string> {
  // zašto: Resolve real media asset URLs needed by Novita flows.
  const doc = await admin.firestore().collection('mediaAssets').doc(assetId).get();

  if (!doc.exists) {
    throw new Error(`Media asset ${assetId} does not exist.`);
  }

  const data = doc.data() as { url?: string; storagePath?: string } | undefined;

  if (!data) {
    throw new Error(`Media asset ${assetId} is missing data.`);
  }

  if (data.url) {
    return data.url;
  }

  if (data.storagePath) {
    const [signedUrl] = await admin
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
