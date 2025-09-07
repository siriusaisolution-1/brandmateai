// src/lib/genkit-react.ts
// STUB FILE: This is a temporary replacement for '@genkit-ai/react'
// It provides the necessary hooks and types to prevent build errors.

import { z } from 'zod';

// A generic type for a flow.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Flow<I extends z.ZodTypeAny, O extends z.ZodTypeAny> = (input: z.infer<I>) => Promise<z.infer<O>>;

// A mock implementation of the useFlow hook.
export function useFlow<I extends z.ZodTypeAny, O extends z.ZodTypeAny>(
  flow: Flow<I, O>
): [(input: z.infer<I>) => void, { loading: boolean; error?: Error; data?: z.infer<O> }] {
  const runFlow = (input: z.infer<I>) => {
    console.log('useFlow STUB: Running flow with input:', input);
  };

  const state = {
    loading: false,
    error: undefined,
    data: undefined,
  };

  return [runFlow, state];
}
