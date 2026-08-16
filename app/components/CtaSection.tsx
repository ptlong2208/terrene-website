import CtaPhysics from '@/app/components/CtaPhysics';
import CtaLink from '@/app/components/ui/CtaLink';
import Section from '@/app/components/ui/Section';
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
          <CtaLink href={link.href} label={link.label} className="mt-[clamp(34px,4.5vh,52px)]" />
        )}
      </div>
      <CtaPhysics />
    </Section>
  );
}
