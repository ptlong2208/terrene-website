'use client';

import { useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Section from '@/app/components/ui/Section';
import PartnerItem from './PartnerItem';
import { usePreloaderDone } from '@/app/hooks/usePreloaderDone';
import type { PartnerItem as PartnerItemType, SectionHeaderData } from '@/lib/types';

interface PartnersSectionProps {
  header?: SectionHeaderData | null;
  partners?: PartnerItemType[];
}

export default function PartnersSection({ header, partners = [] }: PartnersSectionProps) {
  const t = useTranslations('partners');
  const sectionRef = useRef<HTMLElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const preloaderDone = usePreloaderDone();

  useEffect(() => {
    if (!preloaderDone || !sectionRef.current || !listRef.current) return;
    gsap.registerPlugin(ScrollTrigger);

    const list = listRef.current;
    const items = list.querySelectorAll('li');
    gsap.set(items, { y: 32, opacity: 0 });

    const tween = gsap.to(items, {
      y: 0, opacity: 1, duration: 0.75, stagger: 0.08, ease: 'power2.out', delay: 0.12,
      onStart: () => gsap.set(list, { opacity: 1 }),
      onComplete: () => gsap.set(items, { clearProps: 'opacity,y' }),
      scrollTrigger: { trigger: sectionRef.current, start: 'top 76%', once: true },
    });

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
      gsap.set([list, ...Array.from(items)], { clearProps: 'all' });
    };
  }, [preloaderDone]);

  if (!partners.length) return null;

  return (
    <Section
      ref={sectionRef}
      kicker={header?.kicker}
      title={header?.title}
      inverted
      titleClassName="mb-[clamp(40px,5vh,72px)]"
      className="bg-(--green-deep) text-cream max-md:min-h-0"
    >
      <ul
        ref={listRef}
        className="opacity-0 [&:has(li:hover)>li:not(:hover)]:opacity-[0.32]"
      >
        {partners.map((partner) => (
          <PartnerItem key={partner.id} item={partner} visitLabel={t('visit')} />
        ))}
      </ul>
    </Section>
  );
}
