'use client';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useEffect, useRef } from 'react';

import TerreneElement from '@/app/components/TerreneElement';
import Section from '@/app/components/ui/Section';
import { usePreloaderDone } from '@/app/hooks/usePreloaderDone';

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

    const tl = gsap
      .timeline({
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
      <div className="mx-auto max-w-185">
        <div ref={iconRef} className="mb-[clamp(28px,4vh,44px)] opacity-0">
          <TerreneElement className="mx-auto size-9.5" />
        </div>

        {quote && (
          <blockquote
            ref={blockquoteRef}
            className="mb-[clamp(20px,2.5vh,30px)] text-[clamp(12px,2vw,28px)] leading-tight font-[380] tracking-[-0.02em] text-(--green-deep) opacity-0"
          >
            {quote.split('\n').map((line, i) => (
              <span key={i} className="block whitespace-nowrap">
                {line}
              </span>
            ))}
          </blockquote>
        )}

        {attribution && (
          <p
            ref={attrRef}
            className="text-ink-faint text-[11px] font-medium tracking-[0.14em] uppercase opacity-0"
          >
            {attribution}
          </p>
        )}
      </div>
    </Section>
  );
}
