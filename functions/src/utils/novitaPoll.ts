import * as admin from 'firebase-admin';
import { NovitaSDK } from 'novita-sdk';

import { NOVITA_API_KEY } from '../config';
import { novitaAsyncTaskSchema, novitaProgressSchema, type NovitaAsyncTask } from '../ai/flows/novita-schemas';
import { upsertNovitaTask } from './novita-tasks';

const novitaSdk = new NovitaSDK(NOVITA_API_KEY);
const NOVITA_BASE = 'https://api.novita.ai';

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export type NovitaStatus = 'queued' | 'processing' | 'succeeded' | 'failed' | 'timeout';

function mapTaskStatus(status: string | undefined): NovitaStatus {
  if (!status) return 'queued';
  switch (status) {
    case 'TASK_STATUS_SUCCEED':
    case 'succeeded':
      return 'succeeded';
    case 'TASK_STATUS_FAILED':
    case 'failed':
      return 'failed';
    case 'TASK_STATUS_PROCESSING':
    case 'processing':
      return 'processing';
    case 'TASK_STATUS_QUEUED':
    case 'queued':
      return 'queued';
    default:
      return 'queued';
  }
}

async function fetchStatusViaSdk(taskId: string): Promise<NovitaAsyncTask | null> {
  const progressFn = (novitaSdk as unknown as {
    progress?: (params: { task_id: string }) => Promise<unknown>;
  }).progress;
  if (!progressFn) {
    return null;
  }

  const raw = await progressFn({ task_id: taskId });
  const parsed = novitaProgressSchema.parse(raw);
  const status = mapTaskStatus(parsed.task.status);
  return {
    task_id: parsed.task.task_id,
    status,
    video_url: parsed.videos?.[0]?.video_url,
    output: raw,
    failure_reason: parsed.task.reason,
  };
}

async function fetchStatusViaRest(taskId: string): Promise<NovitaAsyncTask | null> {
  if (!NOVITA_API_KEY) {
    return null;
  }

  const res = await fetch(`${NOVITA_BASE}/v3/async/task-result?task_id=${encodeURIComponent(taskId)}`, {
    headers: {
      Authorization: `Bearer ${NOVITA_API_KEY}`,
    },
  });

  if (!res.ok) {
    return null;
  }

  const json = await res.json();
  return novitaAsyncTaskSchema.parse(json);
}

export async function pollNovitaTask(
  taskId: string,
  {
    maxAttempts = 24,
    baseDelayMs = 4000,
    factor = 1.5,
    hardTimeoutMs = 5 * 60_000,
  }: { maxAttempts?: number; baseDelayMs?: number; factor?: number; hardTimeoutMs?: number } = {}
): Promise<NovitaAsyncTask> {
  const startedAt = Date.now();
  let lastError: unknown;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    if (Date.now() - startedAt > hardTimeoutMs) {
      await upsertNovitaTask(taskId, { status: 'timeout', error: 'Timed out while waiting for Novita task.' });
      throw new Error(`Novita task ${taskId} polling timed out after ${hardTimeoutMs}ms`);
    }

    try {
      const status = (await fetchStatusViaSdk(taskId)) ?? (await fetchStatusViaRest(taskId));

      if (!status) {
        await sleep(Math.floor(baseDelayMs * Math.pow(factor, attempt)));
        continue;
      }

      await upsertNovitaTask(taskId, {
        status: status.status,
        error: status.failure_reason ?? null,
        metadata: { lastPollAt: admin.firestore.FieldValue.serverTimestamp() },
        mediaUrl: status.video_url,
      });

      if (status.status === 'succeeded' || status.status === 'failed') {
        return status;
      }
    } catch (error) {
      lastError = error;
    }

    await sleep(Math.floor(baseDelayMs * Math.pow(factor, attempt)));
  }

  await upsertNovitaTask(taskId, { status: 'timeout', error: 'Max polling attempts exceeded.' });
  throw lastError instanceof Error
    ? lastError
    : new Error(`Novita task ${taskId} polling exceeded maximum attempts.`);
}