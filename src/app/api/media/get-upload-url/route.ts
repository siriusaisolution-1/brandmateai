// src/app/api/media/get-upload-url/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getAdminApp, getBucket } from '@/lib/firebase-admin';

function stripBOM(s: string) {
  return s.charCodeAt(0) === 0xFEFF ? s.slice(1) : s;
}
function assertString(name: string, val: unknown): asserts val is string {
  if (typeof val !== 'string' || !val.trim()) {
    throw new Error(`Invalid "${name}"`);
  }
}

export async function POST(req: NextRequest) {
  // ----- DEBUG BLOK: vrati šta zaista stiže -----
  const debug = req.nextUrl.searchParams.get('debug');
  const raw = await req.text();
  const clean = stripBOM(raw || '').trim();

  if (debug === '1') {
    // pokaži sve što može pomoći da uočimo “nevidljive” znakove
    const preview = clean.slice(0, 200);
    const rawPreview = raw.slice(0, 200);
    const rawHex = Buffer.from(rawPreview, 'utf8').toString('hex').slice(0, 200);
    return NextResponse.json({
      note: 'DEBUG ECHO',
      headers: Object.fromEntries(req.headers),
      rawPreview,
      cleanPreview: preview,
      rawHexPreview: rawHex,
      rawLength: raw.length,
      cleanLength: clean.length,
      contentType: req.headers.get('content-type') || null,
    });
  }
  // ------------------------------------------------

  try {
    let body: unknown = {};
    if (clean.length > 0) {
      try {
        body = JSON.parse(clean) as unknown;
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : 'Unexpected parse failure';
        return NextResponse.json(
          {
            error: 'Invalid JSON body',
            details: message,
            sample: clean.slice(0, 200),
          },
          { status: 400 }
        );
      }
    }

    const parsedBody = (body ?? {}) as Record<string, unknown>;
    const { filename, contentType, brandId } = parsedBody;
    assertString('filename', filename);
    assertString('contentType', contentType);
    assertString('brandId', brandId);

    // (Opcioni) Auth verifikacija — tolerantan DEV
    let userId = 'anonymous';
    const authHeader = req.headers.get('authorization') || req.headers.get('Authorization');
    if (authHeader?.startsWith('Bearer ')) {
      try {
        const token = authHeader.slice('Bearer '.length).trim();
        const decoded = await getAdminApp().auth().verifyIdToken(token);
        userId = decoded.uid;
      } catch {
        // u produkciji vratiti 401
      }
    }

    const timestamp = Date.now();
    const safeName = String(filename).replace(/\s+/g, '_');
    const objectPath = `brands/${brandId}/${userId}/${timestamp}_${safeName}`;

    const bucket = getBucket();
    const file = bucket.file(objectPath);

    const [signedUrl] = await file.getSignedUrl({
      version: 'v4',
      action: 'write',
      expires: Date.now() + 15 * 60 * 1000,
      contentType,
    });

    return NextResponse.json({
      uploadUrl: signedUrl,
      storagePath: objectPath,
      publicUrl: `https://storage.googleapis.com/${bucket.name}/${encodeURIComponent(objectPath)}`,
      bucket: bucket.name,
    });
  } catch (err: unknown) {
    console.error('get-upload-url error', err);
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json(
      { error: message },
      { status: 400 }
    );
  }
}