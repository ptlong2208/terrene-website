'use client';

import { useRef, type Ref } from 'react';
import TerreneLogo from '@/app/components/TerreneLogo';
import { useLineReveal } from '@/app/hooks/useLineReveal';

interface SectionProps {
  id?: string;
  className?: string;
  children: React.ReactNode;
  ref?: Ref<HTMLElement>;
  kicker?: string | null;
  title?: string | null;
  kickerClassName?: string;
  titleClassName?: string;
}

export default function Section({
  id,
  className,
  children,
  ref,
  kicker,
  title,
  kickerClassName,
  titleClassName,
}: SectionProps) {
  const kickerTextRef = useRef<HTMLSpanElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  useLineReveal(kickerTextRef, { start: 'top 86%', duration: 0.9, stagger: 0.055 });
  useLineReveal(titleRef, { start: 'top 82%', duration: 1.1, stagger: 0.09 });

  return (
    <section
      ref={ref}
      id={id}
      className={`min-h-svh flex flex-col justify-center py-[clamp(80px,10vh,140px)] px-gutter${className ? ` ${className}` : ''}`}
    >
      {(kicker || title) && (
        <div>
          {kicker && (
            <div
              className={`flex items-center gap-2.5 text-ink-soft${kickerClassName ? ` ${kickerClassName}` : ''}`}
            >
              <TerreneLogo className="size-3.75 shrink-0" />
              <span
                ref={kickerTextRef}
                className="text-[11px] font-medium tracking-[0.14em] uppercase"
              >
                {kicker}
              </span>
            </div>
          )}
          {title && (
            <h2
              ref={titleRef}
              className={`font-[380] text-[clamp(28px,3.2vw,54px)] leading-[1.12] tracking-[-0.02em] max-w-[15em] text-balance text-(--green-deep)${titleClassName ? ` ${titleClassName}` : ''}`}
            >
              {title}
            </h2>
          )}
        </div>
      )}
      {children}
    </section>
  );
}
