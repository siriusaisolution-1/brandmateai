// src/components/ui/input.tsx
'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  isInvalid?: boolean;
};

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, isInvalid, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          'flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm',
          'ring-offset-background placeholder:text-muted-foreground',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-50',
          isInvalid && 'ring-1 ring-destructive',
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input };