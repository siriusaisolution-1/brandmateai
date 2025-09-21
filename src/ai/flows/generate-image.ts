// src/ai/flows/generate-image.ts
// Front-end stub: ovde ne koristimo SDK-eve ni tajne.
// Kada budeš imao backend endpoint (Cloud Function / API route),
// samo zameni implementaciju da pozove taj endpoint.

export type GenerateImageInput = {
  prompt: string;
  userId: string;
  brandId: string;
  model_name?: string;
};

export type GenerateImageResult = {
  taskId: string;
};

export async function generateImageFlow(
  _input: GenerateImageInput
): Promise<GenerateImageResult> {
  // TODO: zameni ovim:
  // const res = await fetch("/api/generate-image", { method: "POST", body: JSON.stringify(_input) });
  // const json = await res.json();
  // return json as GenerateImageResult;
  return { taskId: "stub-task" };
}