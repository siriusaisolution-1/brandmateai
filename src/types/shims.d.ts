// src/types/shims.d.ts
/* eslint-disable @typescript-eslint/no-explicit-any */

// ---- genkit flow stubs (server/client) ----
declare module '@genkit-ai/flow' {
  export class GenkitError extends Error {}
  export function defineFlow(...args: any[]): any;
  export function run<T = any>(...args: any[]): Promise<T>;
}
declare module '@genkit-ai/flow/client' {
  export function run<T = any>(...args: any[]): Promise<T>;
}

// ---- UI komponente (ako nedostaju stvarne datoteke)
declare module '@/components/ui/alert' {
  export const Alert: any;
  export const AlertDescription: any;
}
declare module '@/components/ui/sheet' {
  export const Sheet: any;
  export const SheetContent: any;
  export const SheetTrigger: any;
}
declare module '@/components/ui/select' {
  export const Select: any;
  export const SelectContent: any;
  export const SelectItem: any;
  export const SelectTrigger: any;
  export const SelectValue: any;
}

// ---- externi paketi bez tipova
declare module 'react-dropzone' {
  export const useDropzone: any;
}
declare module '@radix-ui/react-switch' {
  const x: any;
  export = x;
}
declare module 'novita-sdk' {
  export class NovitaSDK {
    constructor(apiKey: string);
  }
}

// ---- next-themes tipovi (ako neki file još uvek traži dist/types)
declare module 'next-themes/dist/types' {
  export type ThemeProviderProps = {
    children?: React.ReactNode;
    attribute?: string;
    defaultTheme?: string;
    enableSystem?: boolean;
    disableTransitionOnChange?: boolean;
  };
}