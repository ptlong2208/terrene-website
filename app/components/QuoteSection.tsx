'use client';

import { useRef, useEffect } from 'react';
import Section from '@/app/components/ui/Section';
import TerreneElement from '@/app/components/TerreneElement';
import { usePreloaderDone } from '@/app/hooks/usePreloaderDone';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

interface QuoteSectionProps {
  quote?: string | null;
  attribution?: string | null;
}

export default function QuoteSection({ quote, attribution }: QuoteSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);
  const blockquoteRef = useRef<HTMLQuoteElement>(null);
  const attrRef = useRef<HTMLParagraphElement>(null);
  const preloaderDone = usePreloaderDone();

  useEffect(() => {
    const section = sectionRef.current;
    const icon = iconRef.current;
    if (!preloaderDone || !section || !icon) return;
    gsap.registerPlugin(ScrollTrigger);

    const targets = [blockquoteRef.current, attrRef.current].filter(Boolean);
    gsap.set(icon, { opacity: 0, scale: 0.78, rotation: -18 });
    gsap.set(targets, { opacity: 0, y: 34 });

    const tl = gsap.timeline({
      scrollTrigger: { trigger: section, start: 'top 76%', once: true },
    })
      .to(icon, { opacity: 0.3, scale: 1, rotation: 0, duration: 0.7, ease: 'power3.out' })
      .to(targets, { opacity: 1, y: 0, duration: 1, stagger: 0.16, ease: 'power3.out' }, '-=0.25');

    return () => {
      tl.scrollTrigger?.kill();
      tl.kill();
      gsap.set([icon, ...targets], { clearProps: 'all' });
    };
  }, [preloaderDone]);

  if (!quote && !attribution) return null;

  return (
    <Section ref={sectionRef} className="items-center text-center max-md:min-h-0 max-md:py-20">
      <div className="max-w-185 mx-auto">
        <div ref={iconRef} className="mb-[clamp(28px,4vh,44px)] opacity-0">
          <TerreneElement className="size-9.5 mx-auto" />
        </div>

        {quote && (
          <blockquote
            ref={blockquoteRef}
            className="text-[clamp(12px,2vw,28px)] font-[380] leading-tight tracking-[-0.02em] text-(--green-deep) mb-[clamp(20px,2.5vh,30px)] opacity-0"
          >
            {quote.split('\n').map((line, i) => (
              <span key={i} className="block whitespace-nowrap">{line}</span>
            ))}
          </blockquote>
        )}

        {attribution && (
          <p
            ref={attrRef}
            className="text-[11px] font-medium tracking-[0.14em] uppercase text-ink-faint opacity-0"
          >
            {attribution}
          </p>
        )}
      </div>
    </Section>
  );
}
