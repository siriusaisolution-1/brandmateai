export interface NovitaVideoRequest {
  prompt: string;
  styleId?: string;
  ratio?: '16:9' | '9:16' | '1:1';
  durationSec?: number;
}

export interface NovitaVideoResult {
  url?: string;
  storagePath?: string;
  durationSec?: number;
}

/**
 * Placeholder video generation adapter. In production this should call Novita's video API.
 */
export async function generateNovitaVideo(request: NovitaVideoRequest): Promise<NovitaVideoResult> {
  const keyPresent = Boolean(process.env.NOVITA_API_KEY);
  const safePrompt = request.prompt.slice(0, 48).replace(/\s+/g, '-').toLowerCase();
  const storagePath = `novita/videos/${safePrompt || 'video'}-${Date.now()}.mp4`;
  const durationSec = request.durationSec ?? 8;

  return {
    storagePath,
    durationSec,
    url: keyPresent ? `https://cdn.novita.ai/${storagePath}` : `https://example.com/${storagePath}`,
  };
}
