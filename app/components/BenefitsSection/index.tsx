'use client';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useEffect, useRef } from 'react';

import Section from '@/app/components/ui/Section';
import { usePreloaderDone } from '@/app/hooks/usePreloaderDone';
import type { BenefitItem, SectionHeaderData } from '@/lib/types';

import BenefitCard from './BenefitCard';

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
    const grid = gridRef.current;
    const cards = grid.querySelectorAll('article');
    gsap.set(cards, { y: 20, opacity: 0 });
    const tween = gsap.to(cards, {
      y: 0,
      opacity: 1,
      duration: 0.85,
      stagger: 0.12,
      ease: 'power3.out',
      onStart: () => gsap.set(grid, { opacity: 1 }),
      scrollTrigger: { trigger: grid, start: 'top 80%', once: true },
    });
    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
      gsap.set([grid, ...Array.from(cards)], { clearProps: 'all' });
    };
  }, [preloaderDone]);

  if (!items.length) return null;

  return (
    <Section
      kicker={header?.kicker}
      title={header?.title}
      titleClassName="mb-18"
      className="max-md:min-h-0"
    >
      <div
        ref={gridRef}
        className="grid grid-cols-4 gap-[clamp(24px,3vw,48px)] opacity-0 max-lg:grid-cols-2 max-md:grid-cols-1"
      >
        {items.map((item, i) => (
          <BenefitCard key={item.id} item={item} index={i} />
        ))}
      </div>
    </Section>
  );
}
