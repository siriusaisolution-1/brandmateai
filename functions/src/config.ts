import { getRequiredSecretValue, getSecretValue } from './utils/secrets';

export const getRequiredSecret = (name: string): Promise<string> => {
  return getRequiredSecretValue(name);
};

export const getOptionalSecret = (name: string): Promise<string | undefined> => {
  return getSecretValue(name);
};

export const getNovitaApiKey = (): Promise<string> => getRequiredSecret('NOVITA_API_KEY');

export const getGoogleGenAiApiKey = (): Promise<string> => getRequiredSecret('GOOGLE_GENAI_API_KEY');

export const getGeminiModelId = async (): Promise<string> => {
  return (await getOptionalSecret('GEMINI_MODEL_ID')) ?? 'gemini-1.5-pro-latest';
};

export const getEncryptionKey = (): Promise<string | undefined> => getOptionalSecret('ENCRYPTION_KEY');

export const hasValidEncryptionKey = async (): Promise<boolean> => {
  const encryptionKey = await getEncryptionKey();
  return typeof encryptionKey === 'string' && encryptionKey.length === 32;
};

