export interface NovitaImageRequest {
  prompt: string;
  styleId?: string;
  size?: 'square' | 'portrait' | 'landscape';
}

export interface NovitaImageResult {
  url?: string;
  storagePath?: string;
}

/**
 * Thin adapter around the Novita image API.
 * For M4 this implementation returns a deterministic placeholder payload so tests stay offline.
 */
export async function generateNovitaImage(request: NovitaImageRequest): Promise<NovitaImageResult> {
  const keyPresent = Boolean(process.env.NOVITA_API_KEY);
  const safePrompt = request.prompt.slice(0, 48).replace(/\s+/g, '-').toLowerCase();
  const storagePath = `novita/images/${safePrompt || 'image'}-${Date.now()}.png`;

  // In future milestones this should call Novita; for now we just surface placeholder URLs.
  return {
    storagePath,
    url: keyPresent ? `https://cdn.novita.ai/${storagePath}` : `https://example.com/${storagePath}`,
  };
}
