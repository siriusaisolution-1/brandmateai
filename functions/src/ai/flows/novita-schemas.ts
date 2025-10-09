// functions/src/ai/flows/novita-schemas.ts
import { z } from 'zod';

// zašto: Centralize Novita response contracts so flows avoid `any` and share parsing logic.
export const novitaTaskStatusSchema = z.enum([
  'queued',
  'processing',
  'succeeded',
  'failed',
]);

export const novitaAsyncTaskSchema = z.object({
  task_id: z.string(),
  status: novitaTaskStatusSchema.optional(),
  video_url: z.string().url().optional(),
  output: z.unknown().optional(),
  failure_reason: z.string().optional(),
});

export type NovitaAsyncTask = z.infer<typeof novitaAsyncTaskSchema>;

export const novitaImageTransformResultSchema = z.object({
  image_base64: z.string(),
  image_type: z.string(),
});

export type NovitaImageTransformResult = z.infer<
  typeof novitaImageTransformResultSchema
>;
