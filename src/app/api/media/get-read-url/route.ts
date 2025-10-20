// src/app/api/media/get-read-url/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getStorage } from "@/lib/firebase-admin";

function assertString(name: string, val: unknown): asserts val is string {
  if (typeof val !== "string" || !val.trim()) {
    throw new Error(`Invalid "${name}"`);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { storagePath } = body || {};
    assertString("storagePath", storagePath);

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
    const message =
      err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json(
      { error: message },
      { status: 400 }
    );
  }
}