export async function GET() {
  return Response.json({
    node: process.version,
    hasServiceAccountB64: Boolean(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64),
    bucket: process.env.FIREBASE_STORAGE_BUCKET ?? null,
    nextPublicBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? null,
    env: process.env.NODE_ENV,
  });
}
