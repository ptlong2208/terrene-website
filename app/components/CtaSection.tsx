'use client';

import Link from 'next/link';
import Section from '@/app/components/Section';
import SlotText from '@/app/components/SlotText';
import CtaPhysics from '@/app/components/CtaPhysics';
import type { SectionHeaderData, NavLink } from '@/lib/types';

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
      className="min-h-[60vh]! flex-1 py-[clamp(48px,8vh,110px)]! relative overflow-hidden"
    >
      <div className="relative z-10">
        {link && (
          <Link
            href={link.href}
            className="group self-start inline-flex items-center gap-2.5 text-[12px] font-semibold tracking-[0.12em] uppercase text-(--green-deep) border-b border-current pb-0.75 no-underline mt-[clamp(34px,4.5vh,52px)]"
          >
            <SlotText text={link.label} />
          </Link>
        )}
      </div>
      <CtaPhysics />
    </Section>
  );
}
