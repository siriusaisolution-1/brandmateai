// functions/src/ai/flows/check-video-status.ts
import { defineFlow } from '@genkit-ai/flow';
import { z } from 'zod';
import { NovitaSDK } from 'novita-sdk';
import { NOVITA_API_KEY } from '../../config';

// Initialize Novita SDK
const novitaSdk = new NovitaSDK(NOVITA_API_KEY);

// Define the input schema for the flow
const CheckStatusInputSchema = z.object({
  taskId: z.string(),
});

// Define the output schema for the flow
const VideoResultSchema = z.object({
  status: z.string(),
  videoUrl: z.string().optional(),
});

// Define the flow to check the task status
export const checkVideoStatusFlow = defineFlow(
  {
    name: 'checkVideoStatusFlow',
    inputSchema: CheckStatusInputSchema,
    outputSchema: VideoResultSchema,
  },
  async ({ taskId }) => {
    try {
      const result = await novitaSdk.getTaskResult(taskId);
      
      if (result.task.status === 'TASK_STATUS_SUCCEED') {
        return {
          status: 'succeeded',
          videoUrl: result.videos?.[0]?.video_url,
        };
      } else if (result.task.status === 'TASK_STATUS_FAILED') {
        throw new Error(`Video generation failed: ${result.task.reason}`);
      } else {
        return {
          status: 'processing',
        };
      }
    } catch (error) {
      console.error('Failed to get task result:', error);
      throw new Error('Failed to check video generation status.');
    }
  }
);
