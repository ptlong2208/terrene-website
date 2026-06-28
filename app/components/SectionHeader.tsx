'use client';

import { useRef } from 'react';
import TerreneLogo from '@/app/components/TerreneLogo';
import { useLineReveal } from '@/app/hooks/useLineReveal';

interface SectionHeaderProps {
  kicker?: string | null;
  title?: string | null;
  kickerClassName?: string;
  titleClassName?: string;
  inverted?: boolean;
}

export default function SectionHeader({
  kicker,
  title,
  kickerClassName,
  titleClassName,
  inverted = false,
}: SectionHeaderProps) {
  const kickerRef = useRef<HTMLSpanElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  useLineReveal(kickerRef, { start: 'top 86%', duration: 0.9 });
  useLineReveal(titleRef, { start: 'top 82%', duration: 1.1 });

  if (!kicker && !title) return null;

  return (
    <div className="flex flex-col gap-[clamp(12px,1.4vw,20px)]">
      {kicker && (
        <div className={`flex items-center gap-2.5 ${inverted ? 'text-cream/70' : 'text-ink-soft'}${kickerClassName ? ` ${kickerClassName}` : ''}`}>
          <TerreneLogo className="size-3.75 shrink-0" />
          <span
            ref={kickerRef}
            className="text-[11px] font-medium tracking-[0.14em] uppercase opacity-0"
          >
            {kicker}
          </span>
        </div>
      )}
      {title && (
        <h2
          ref={titleRef}
          className={`font-[380] text-[clamp(28px,3.2vw,54px)] leading-[1.1] tracking-[-0.02em] max-w-[15em] text-balance ${inverted ? 'text-cream' : 'text-(--green-deep)'} opacity-0${titleClassName ? ` ${titleClassName}` : ''}`}
        >
          {title}
        </h2>
      )}
    </div>
  );
}
