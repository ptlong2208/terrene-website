'use client';

import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Section from '@/app/components/ui/Section';
import SectionHeader from '@/app/components/ui/SectionHeader';
import CtaLink from '@/app/components/ui/CtaLink';
import JournalCard from './JournalCard';
import { usePreloaderDone } from '@/app/hooks/usePreloaderDone';
import type { JournalPost, SectionHeaderData, NavLink } from '@/lib/types';

interface JournalSectionProps {
  header?: SectionHeaderData | null;
  viewAll?: NavLink | null;
  posts?: JournalPost[];
}

export default function JournalSection({ header, viewAll, posts = [] }: JournalSectionProps) {
  const gridRef = useRef<HTMLDivElement>(null);
  const preloaderDone = usePreloaderDone();

  useEffect(() => {
    if (!preloaderDone || !gridRef.current) return;
    gsap.registerPlugin(ScrollTrigger);

    const kills: (() => void)[] = [];
    const grid = gridRef.current;
    const cards = Array.from(grid.querySelectorAll<HTMLElement>('article'));
    const mediaEls = Array.from(grid.querySelectorAll<HTMLElement>('[data-media]'));

    // Card stagger entrance
    if (cards.length) {
      gsap.set(cards, { y: 50, opacity: 0 });
      const t = gsap.to(cards, {
        y: 0,
        opacity: 1,
        stagger: 0.1,
        duration: 0.9,
        ease: 'power3.out',
        onStart: () => gsap.set(grid, { opacity: 1 }),
        onComplete: () => gsap.set(cards, { clearProps: 'opacity,y' }),
        scrollTrigger: { trigger: grid, start: 'top 85%', once: true },
      });
      kills.push(() => {
        t.scrollTrigger?.kill();
        t.kill();
      });
    }

    // Clip-path reveal per card image
    mediaEls.forEach((el) => {
      const tl = gsap.timeline({
        scrollTrigger: { trigger: el, start: 'top 80%', once: true },
      });
      tl.to(el, { clipPath: 'inset(0% 0 0 0)', duration: 1.2, ease: 'expo.inOut' });
      kills.push(() => {
        tl.scrollTrigger?.kill();
        tl.kill();
      });
    });

    return () => kills.forEach((fn) => fn());
  }, [preloaderDone]);

  if (!posts.length) return null;

  return (
    <Section className="max-lg:min-h-0">
      {(header?.title || viewAll) && (
        <div className="mb-14 flex items-end justify-between max-md:flex-col max-md:items-start max-md:gap-6">
          <SectionHeader title={header?.title} />
          {viewAll && <CtaLink href={viewAll.href} label={viewAll.label} className="shrink-0" />}
        </div>
      )}

      <div
        ref={gridRef}
        className="grid grid-cols-3 gap-[clamp(16px,2vw,32px)] opacity-0 max-xl:grid-cols-2 max-lg:grid-cols-1"
      >
        {posts.map((post) => (
          <JournalCard key={post.id} post={post} href={`/journal/${post.slug}`} />
        ))}
      </div>
    </Section>
  );
}
