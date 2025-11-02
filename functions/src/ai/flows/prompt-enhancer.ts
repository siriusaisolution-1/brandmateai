import { ai, ensureGoogleGenAiApiKeyReady } from '../../genkit/ai';
import { z } from 'zod';

const MCP_SYSTEM_PROMPT = `You are the Master Control Prompt (MCP), an expert in prompt engineering...`;

export const enhancePromptFlow = ai.defineFlow(
  {
    name: 'enhancePromptFlow',
    inputSchema: z.object({
      userId: z.string(),
      brandId: z.string(),
      basePrompt: z.string(),
      taskType: z.enum(['image', 'video', 'blog', 'social']),
      style: z.string().optional(),
    }),
    outputSchema: z.object({ enhancedPrompt: z.string() }),
  },
  async (input) => {
    await ensureGoogleGenAiApiKeyReady();

    const userPrompt = `Base Prompt: "${input.basePrompt}"\nTask Type: ${input.taskType}\nUser ID: ${input.userId}\nDesired Style: ${
      input.style ?? 'Default'
    }`;
    const llm = await ai.generate({ prompt: userPrompt, system: MCP_SYSTEM_PROMPT });
    return { enhancedPrompt: llm.text ?? '' };
  },
);

