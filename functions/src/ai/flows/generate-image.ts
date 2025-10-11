// functions/src/ai/flows/generate-image.ts
import { ai } from "../../genkit/ai";
import { z } from "zod";
import { NOVITA_API_KEY } from "../../config";
import { novitaAsyncTaskSchema } from "./novita-schemas";

const NOVITA_BASE = "https://api.novita.ai";

export const generateImageFlow = ai.defineFlow(
  {
    name: "generateImageFlow",
    inputSchema: z.object({
      prompt: z.string(),
      userId: z.string(),
      brandId: z.string(),
      width: z.number().int().min(128).max(2048).default(1024),
      height: z.number().int().min(128).max(2048).default(1024),
      model_name: z.string().default("sd_xl_base_1.0.safetensors"),
    }),
    outputSchema: z.object({ taskId: z.string() }),
  },
  async (input) => {
    if (!NOVITA_API_KEY) {
      throw new Error("NOVITA_API_KEY not configured");
    }

    const body = {
      extra: { response_image_type: "jpeg" },
      request: {
        prompt: input.prompt,
        model_name: input.model_name,
        width: input.width,
        height: input.height,
        image_num: 1,
        steps: 20,
        guidance_scale: 7.5,
        sampler_name: "Euler a",
      },
    };

    const res = await fetch(`${NOVITA_BASE}/v3/async/txt2img`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${NOVITA_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const t = await res.text();
      throw new Error(`Novita txt2img failed: ${res.status} ${t}`);
    }

    const json = await res.json();
    const parsed = novitaAsyncTaskSchema.parse(json);
    return { taskId: parsed.task_id };
  }
);