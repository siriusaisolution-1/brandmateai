import * as functions from 'firebase-functions';
import { NovitaSDK } from 'novita-sdk';

const NOVITA_API_KEY =
  (functions.config().novita?.key as string) ||
  process.env.NOVITA_API_KEY ||
  '';

const novitaSdk = new NovitaSDK(NOVITA_API_KEY);

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export type NovitaStatus = 'queued' | 'processing' | 'succeeded' | 'failed';

export async function pollNovitaTask(
  taskId: string,
  {
    maxAttempts = 12,
    baseDelayMs = 5000,
    factor = 1.5,
  }: { maxAttempts?: number; baseDelayMs?: number; factor?: number } = {}
) {
  for (let i = 0; i < maxAttempts; i++) {
    const res: any = await (novitaSdk as any).getTaskStatus?.({ task_id: taskId });
    const status: NovitaStatus = res?.status ?? 'queued';
    if (status === 'succeeded' || status === 'failed') return res;
    await sleep(Math.floor(baseDelayMs * Math.pow(factor, i)));
  }
  throw new Error(`Novita task ${taskId} polling timed out`);
}