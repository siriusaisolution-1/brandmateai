import { NovitaSDK } from 'novita-sdk';
import { NOVITA_API_KEY } from '../config';
import {
  novitaAsyncTaskSchema,
  novitaTaskStatusSchema,
  type NovitaAsyncTask,
} from '../ai/flows/novita-schemas';

const novitaSdk = new NovitaSDK(NOVITA_API_KEY);

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export type NovitaStatus = 'queued' | 'processing' | 'succeeded' | 'failed';

type GetTaskStatusFn = (params: { task_id: string }) => Promise<unknown> | unknown;

export async function pollNovitaTask(
  taskId: string,
  {
    maxAttempts = 12,
    baseDelayMs = 5000,
    factor = 1.5,
  }: { maxAttempts?: number; baseDelayMs?: number; factor?: number } = {}
) : Promise<NovitaAsyncTask> {
  for (let i = 0; i < maxAttempts; i++) {
    const getTaskStatus = (novitaSdk as unknown as { getTaskStatus?: GetTaskStatusFn }).getTaskStatus;
    const res = await getTaskStatus?.({ task_id: taskId });
    if (!res) {
      await sleep(Math.floor(baseDelayMs * Math.pow(factor, i)));
      continue;
    }
    const parsed = novitaAsyncTaskSchema.parse(res);
    const status: NovitaStatus = parsed.status
      ? novitaTaskStatusSchema.parse(parsed.status)
      : 'queued';
    if (status === 'succeeded' || status === 'failed') return parsed;
    await sleep(Math.floor(baseDelayMs * Math.pow(factor, i)));
  }
  throw new Error(`Novita task ${taskId} polling timed out`);
}