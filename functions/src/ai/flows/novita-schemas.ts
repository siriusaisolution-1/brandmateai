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

export const novitaProgressSchema = z.object({
  task: z.object({
    task_id: z.string(),
    status: z.string(),
    reason: z.string().optional(),
  }),
  videos: z
    .array(
      z.object({
        video_url: z.string().url(),
        video_type: z.string().optional(),
      })
    )
    .optional(),
  images: z
    .array(
      z.object({
        image_url: z.string().url(),
        image_type: z.string().optional(),
      })
    )
    .optional(),
});

export const novitaImageTransformResultSchema = z.object({
  image_base64: z.string(),
  image_type: z.string(),
});

export type NovitaImageTransformResult = z.infer<
  typeof novitaImageTransformResultSchema
>;
