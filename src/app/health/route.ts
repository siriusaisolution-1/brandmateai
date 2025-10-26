import { NextResponse } from 'next/server';

import { buildHealthSnapshot, getServiceStartedAt } from '@/lib/health/metrics';

export async function GET() {
  const snapshot = buildHealthSnapshot();

  return NextResponse.json({
    ...snapshot,
    startedAt: getServiceStartedAt(),
  });
}
