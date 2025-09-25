'use client'
import * as React from 'react'
import * as SwitchPrimitives from '@radix-ui/react-switch'

type ClassValue = string | undefined
function cx(...c: ClassValue[]) { return c.filter(Boolean).join(' ') }

export type SwitchProps = React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>

export const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  SwitchProps
>(function Switch({ className, ...props }, ref) {
  return (
    <SwitchPrimitives.Root
      ref={ref}
      className={cx(
        'peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border border-transparent transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'data-[state=checked]:bg-primary data-[state=unchecked]:bg-muted',
        className
      )}
      {...props}
    >
      <SwitchPrimitives.Thumb
        className={cx(
          'pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform',
          'data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0'
        )}
      />
    </SwitchPrimitives.Root>
  )
})
export default Switch