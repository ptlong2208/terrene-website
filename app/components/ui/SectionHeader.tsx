'use client';

import { useRef } from 'react';
import TerreneElement from '@/app/components/TerreneElement';
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
  const kickerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  useLineReveal(kickerRef, { start: 'top 86%', duration: 0.9 });
  useLineReveal(titleRef, { start: 'top 82%', duration: 1.1 });

  if (!kicker && !title) return null;

  return (
    <div className="flex flex-col gap-[clamp(12px,1.4vw,20px)]">
      {kicker && (
        <div ref={kickerRef} className={`flex items-center gap-2.5 opacity-0 ${inverted ? 'text-cream/70' : 'text-ink-soft'}${kickerClassName ? ` ${kickerClassName}` : ''}`}>
          <TerreneElement className="size-3.75 shrink-0" />
          <span className="text-[11px] font-medium tracking-[0.14em] uppercase">
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
