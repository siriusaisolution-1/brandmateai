import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    commit: process.env.VERCEL_GIT_COMMIT_SHA ?? 'local',
  });
}
