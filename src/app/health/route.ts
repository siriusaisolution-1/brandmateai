// src/app/health/route.ts
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET() {
  return NextResponse.json({
    ok: true,                         // zbog CI provere
    ts: Date.now(),                   // kratki timestamp (ms)
    status: 'ok',                     // human-friendly
    timestamp: new Date().toISOString(),
    commit: process.env.VERCEL_GIT_COMMIT_SHA ?? 'local',
  });
}