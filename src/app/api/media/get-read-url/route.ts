// src/app/api/media/get-read-url/route.ts
import { NextRequest, NextResponse } from "next/server";
import { adminStorage } from "@/lib/firebase-admin";

function assertString(name: string, val: unknown) {
  if (typeof val !== "string" || !val.trim()) {
    throw new Error(`Invalid "${name}"`);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { storagePath } = body || {};
    assertString("storagePath", storagePath);

    const storage = adminStorage();
    const bucket = storage.bucket();
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
  } catch (err: any) {
    console.error("get-read-url error", err);
    return NextResponse.json(
      { error: err?.message ?? "Unknown error" },
      { status: 400 }
    );
  }
}