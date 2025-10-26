import { ai } from '../../genkit/ai';
import { z } from 'zod';
import { deductBmkCredits } from '../../billing';
import { BMK_COSTS } from '../../utils/bmk-costs';
import { enhancePromptFlow } from './prompt-enhancer';
export const socialBurstFlow = ai.defineFlow({
  name: 'socialBurstFlow',
  inputSchema: z.object({ brandId: z.string(), userId: z.string(), topic: z.string().min(3), durationDays: z.number().int().positive() }),
  outputSchema: z.object({ success: z.boolean(), content: z.string().optional() })
}, async ({ userId, brandId, topic }) => {
  const ok = await deductBmkCredits(userId, BMK_COSTS.SOCIAL_BURST);
  if(!ok) throw new Error('Payment failed');
  const enhanced = (await enhancePromptFlow.run({
    userId,
    brandId,
    basePrompt: `Create a series of social media posts about: ${topic}`,
    taskType: 'social',
  })) as {
    enhancedPrompt?: string;
    output?: { enhancedPrompt?: string };
  };
  const prompt =
    enhanced.output?.enhancedPrompt ?? enhanced.enhancedPrompt ?? `Create social posts about: ${topic}`;
  const out = await ai.generate({ prompt });
  return { success: true, content: out.text ?? '' };
});
