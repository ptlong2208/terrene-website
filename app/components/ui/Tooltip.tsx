'use client';

import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { type ReactNode } from 'react';

interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
}

/** Accessible hover/focus tooltip (Radix) for a short explanatory note attached to some trigger. */
export default function Tooltip({ content, children }: TooltipProps) {
  return (
    <TooltipPrimitive.Provider delayDuration={200}>
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            sideOffset={8}
            className="z-200 max-w-64 bg-(--green-deep) p-2.5 text-[11px] leading-relaxed font-normal text-(--bg-cream) shadow-[0_12px_32px_rgba(29,64,37,0.24)] outline-none"
          >
            {content}
            <TooltipPrimitive.Arrow className="fill-(--green-deep)" />
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
}
