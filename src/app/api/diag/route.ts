import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    FIREBASE_STORAGE_BUCKET: process.env.FIREBASE_STORAGE_BUCKET ?? null,
    HAS_SERVICE_ACCOUNT_B64: Boolean(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64),
    NODE_ENV: process.env.NODE_ENV ?? null,
  });
}
