import { execFile } from 'node:child_process';
import path from 'node:path';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

export default async function globalSetup() {
  const seedScript = path.resolve(process.cwd(), 'scripts/seed_local.mjs');

  const env = {
    ...process.env,
    FIRESTORE_EMULATOR_HOST:
      process.env.FIRESTORE_EMULATOR_HOST ?? '127.0.0.1:8080',
    GCLOUD_PROJECT: process.env.GCLOUD_PROJECT ?? 'brandmateai-test',
  };

  let stdout = '';

  try {
    const result = await execFileAsync('node', [seedScript], { env });
    stdout = result.stdout.trim();
  } catch (error) {
    console.error('Failed to seed local emulator', error);
    throw error;
  }

  const payloadLine = stdout.split('\n').filter(Boolean).at(-1);

  if (payloadLine) {
    try {
      const payload = JSON.parse(payloadLine) as {
        brandId?: string;
        mediaId?: string;
        mediaFileName?: string;
        mediaUrl?: string;
      };

      console.log('E2E global setup seed payload:', payload);

      if (payload.brandId) {
        process.env.BRANDMATE_E2E_BRAND_ID = payload.brandId;
      }
      if (payload.mediaId) {
        process.env.BRANDMATE_E2E_MEDIA_ID = payload.mediaId;
      }
      if (payload.mediaFileName) {
        process.env.BRANDMATE_E2E_MEDIA_FILENAME = payload.mediaFileName;
      }
      if (payload.mediaUrl) {
        process.env.BRANDMATE_E2E_MEDIA_URL = payload.mediaUrl;
      }
    } catch (error) {
      console.warn('Unable to parse seed output:', payloadLine);
      throw error;
    }
  }

  await new Promise(resolve => setTimeout(resolve, 500));
}
