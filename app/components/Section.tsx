'use client';

import { type Ref } from 'react';
import SectionHeader from '@/app/components/SectionHeader';

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
  return (
    <section
      ref={ref}
      id={id}
      className={`min-h-svh flex flex-col justify-center py-[clamp(80px,10vh,140px)] px-gutter${className ? ` ${className}` : ''}`}
    >
      <SectionHeader
        kicker={kicker}
        title={title}
        kickerClassName={kickerClassName}
        titleClassName={titleClassName}
      />
      {children}
    </section>
  );
}
