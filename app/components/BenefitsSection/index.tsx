'use client';

import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Section from '@/app/components/Section';
import BenefitCard from './BenefitCard';
import { usePreloaderDone } from '@/app/hooks/usePreloaderDone';
import type { BenefitItem, SectionHeaderData } from '@/lib/types';

interface BenefitsSectionProps {
  header?: SectionHeaderData | null;
  items?: BenefitItem[];
}

export default function BenefitsSection({ header, items = [] }: BenefitsSectionProps) {
  const gridRef = useRef<HTMLDivElement>(null);
  const preloaderDone = usePreloaderDone();

  useEffect(() => {
    if (!preloaderDone || !gridRef.current) return;
    gsap.registerPlugin(ScrollTrigger);
    const cards = gridRef.current.querySelectorAll('article');
    gsap.set(cards, { y: 20, opacity: 0 });
    const tween = gsap.to(cards, {
      y: 0, opacity: 1, duration: 0.85, stagger: 0.12, ease: 'power3.out',
      scrollTrigger: { trigger: gridRef.current, start: 'top 80%', once: true },
    });
    return () => { tween.scrollTrigger?.kill(); tween.kill(); gsap.set(cards, { clearProps: 'opacity,y' }); };
  }, [preloaderDone]);

  if (!items.length) return null;

  return (
    <Section
      kicker={header?.kicker}
      title={header?.title}
      titleClassName="mb-18"
    >
      <div
        ref={gridRef}
        className="grid grid-cols-4 gap-[clamp(24px,3vw,48px)] max-[860px]:grid-cols-2 max-[560px]:grid-cols-1"
      >
        {items.map((item, i) => (
          <BenefitCard key={item.id} item={item} index={i} />
        ))}
      </div>
    </Section>
  );
}
