// src/app/api/media/get-read-url/route.ts
export const runtime = 'nodejs';
export const maxDuration = 10;

import { NextRequest, NextResponse } from "next/server";
import { getStorage } from "@/lib/firebase-admin";
import { requireBearerAuth } from '@/lib/auth/verify-id-token';

import { getMediaRateLimiter } from "../rate-limit";

function assertString(name: string, val: unknown): asserts val is string {
  if (typeof val !== "string" || !val.trim()) {
    throw new Error(`Invalid "${name}"`);
  }
}


export async function POST(req: NextRequest) {
  try {
    await requireBearerAuth(req);
    const body = await req.json();
    const { storagePath } = body || {};
    assertString("storagePath", storagePath);

    const rateKey = `read:${storagePath}`;
    const rateResult = await getMediaRateLimiter().attempt(rateKey);

    if (!rateResult.ok) {
      return NextResponse.json(
        { error: "Rate limit exceeded", retryAfter: rateResult.retryAfterSeconds },
        {
          status: 429,
          headers: { "Retry-After": rateResult.retryAfterSeconds.toString() },
        }
      );
    }

    const bucket = getStorage().bucket();
    const file = bucket.file(storagePath);

    // Kreiraj signed URL za čitanje (GET)
    const [signedUrl] = await file.getSignedUrl({
      version: "v4",
      action: "read",
      expires: Date.now() + 15 * 60 * 1000, // 15 minuta
    });

    return NextResponse.json({
      readUrl: signedUrl,
      bucket: bucket.name,
      storagePath,
    });
  } catch (err: unknown) {
    console.error("get-read-url error", err);
    const status = (err as { status?: number }).status ?? 400;
    const message =
      err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json(
      { error: message },
      { status }
    );
  }
}
