export const googleAI = () => ({
  model: (modelId: string) => ({ providerId: 'googleai', modelId }),
});

(googleAI as unknown as { model: (modelId: string) => { providerId: string; modelId: string } }).model = (modelId: string) => ({
  providerId: 'googleai',
  modelId,
});

export const generateModeration = async (input: string) => {
  void input;
  return { categories: [], flagged: false };
};
