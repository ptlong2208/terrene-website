'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import SectionHeader from '@/app/components/ui/SectionHeader';
import CtaLink from '@/app/components/ui/CtaLink';
import ProcessItem from './ProcessItem';
import { usePreloaderDone } from '@/app/hooks/usePreloaderDone';
import { strapiMediaUrl } from '@/lib/strapi';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { ProcessStep, SectionHeaderData, NavLink } from '@/lib/types';

interface ProcessSectionProps {
  header?: SectionHeaderData | null;
  steps?: ProcessStep[];
  cta?: NavLink | null;
}

export default function ProcessSection({ header, steps = [], cta }: ProcessSectionProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const mediaRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLOListElement>(null);
  const preloaderDone = usePreloaderDone();

  useEffect(() => {
    if (!preloaderDone) return;
    gsap.registerPlugin(ScrollTrigger);
    const kills: (() => void)[] = [];

    if (mediaRef.current) {
      const t = gsap.to(mediaRef.current, {
        clipPath: 'inset(0% 0 0 0)', duration: 1.2, ease: 'power3.out',
        scrollTrigger: { trigger: mediaRef.current, start: 'top 75%', once: true },
      });
      kills.push(() => { t.scrollTrigger?.kill(); t.kill(); });
    }

    const list = listRef.current;
    if (list) {
      const items = list.querySelectorAll('li');
      gsap.set(items, { y: 36, opacity: 0 });
      const tl = gsap.timeline({
        scrollTrigger: { trigger: list, start: 'top 72%', once: true },
        onStart: () => gsap.set(list, { opacity: 1 }),
      })
        .to(items, { y: 0, opacity: 1, duration: 0.75, stagger: 0.09, ease: 'power2.out' });
      kills.push(() => { tl.scrollTrigger?.kill(); tl.kill(); gsap.set([list, ...Array.from(items)], { clearProps: 'all' }); });
    }

    return () => kills.forEach(fn => fn());
  }, [preloaderDone]);

  if (!steps.length) return null;

  return (
    <section className="min-h-svh grid grid-cols-[42%_1fr] gap-[clamp(40px,6vw,100px)] py-[clamp(80px,10vh,140px)] px-gutter items-start max-lg:grid-cols-1 max-lg:min-h-0">
      <div
        ref={mediaRef}
        className="sticky top-[12vh] aspect-square overflow-hidden bg-(--green-deep)/10 [clip-path:inset(100%_0_0_0)] max-lg:relative max-lg:top-0"
      >
        {steps.map((step, i) => step.image && (
          <Image
            key={step.id}
            src={strapiMediaUrl(step.image.url)}
            alt={step.image.alternativeText ?? step.name}
            fill
            className={`object-cover scale-125 transition-opacity duration-300 ${i === activeIndex ? 'opacity-100' : 'opacity-0'}`}
            sizes="(max-width: 1024px) 100vw, 42vw"
          />
        ))}
      </div>

      <div>
        <SectionHeader
          kicker={header?.kicker}
          title={header?.title}
          titleClassName="mb-14"
        />
        <ol ref={listRef} className="opacity-0">
          {steps.map((step, i) => (
            <ProcessItem
              key={step.id}
              step={step}
              index={i}
              isActive={i === activeIndex}
              onMouseEnter={() => setActiveIndex(i)}
            />
          ))}
        </ol>
        {cta && (
          <div className="mt-12">
            <CtaLink href={cta.href} label={cta.label} />
          </div>
        )}
      </div>
    </section>
  );
}
