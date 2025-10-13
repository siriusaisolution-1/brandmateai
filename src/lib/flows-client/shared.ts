import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebase';

/**
 * Generic helper for invoking Firebase callable functions that wrap Genkit flows.
 */
export async function callFlow<Request, Response>(
  name: string,
  data: Request
): Promise<Response> {
  const callable = httpsCallable<Request, Response>(functions, name);
  const result = await callable(data);
  return result.data;
}
