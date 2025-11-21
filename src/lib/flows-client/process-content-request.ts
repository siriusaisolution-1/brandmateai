import { httpsCallable } from 'firebase/functions';

import { functions } from '@/lib/firebase';

export type ProcessContentRequestResponse = {
  message?: string;
};

export async function processContentRequest(contentRequestId: string) {
  const callable = httpsCallable<{ contentRequestId: string }, ProcessContentRequestResponse>(
    functions,
    'processContentRequest'
  );
  const result = await callable({ contentRequestId });
  return result.data;
}
