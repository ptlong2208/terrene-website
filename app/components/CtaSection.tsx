'use client';

import Link from 'next/link';

import CtaPhysics from '@/app/components/CtaPhysics';
import Section from '@/app/components/ui/Section';
import SlotText from '@/app/components/ui/SlotText';
import type { NavLink, SectionHeaderData } from '@/lib/types';

interface CtaSectionProps {
  header?: SectionHeaderData | null;
  link?: NavLink | null;
}

export default function CtaSection({ header, link }: CtaSectionProps) {
  return (
    <Section
      kicker={header?.kicker}
      title={header?.title}
      kickerClassName="text-(--brown)!"
      titleClassName="mb-0"
      className="relative min-h-[60vh]! flex-1 overflow-hidden py-[clamp(48px,8vh,110px)]!"
    >
      <div className="relative z-10">
        {link && (
          <Link
            href={link.href}
            className="group mt-[clamp(34px,4.5vh,52px)] inline-flex items-center gap-2.5 self-start border-b border-current pb-0.75 text-[12px] font-semibold tracking-[0.12em] text-(--green-deep) uppercase no-underline"
          >
            <SlotText text={link.label} />
          </Link>
        )}
      </div>
      <CtaPhysics />
    </Section>
  );
}
