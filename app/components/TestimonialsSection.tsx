'use client';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';

import Section from '@/app/components/ui/Section';
import { usePreloaderDone } from '@/app/hooks/usePreloaderDone';
import type { SectionHeaderData, TestimonialItem } from '@/lib/types';

interface TestimonialsSectionProps {
  header?: SectionHeaderData | null;
  testimonials?: TestimonialItem[];
}

export default function TestimonialsSection({
  header,
  testimonials = [],
}: TestimonialsSectionProps) {
  const t = useTranslations('testimonials');
  const [activeIndex, setActiveIndex] = useState(0);
  const busyRef = useRef(false);
  const hasNavigatedRef = useRef(false);

  const sectionRef = useRef<HTMLElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const portraitRef = useRef<HTMLDivElement>(null);
  const quoteRef = useRef<HTMLQuoteElement>(null);
  const metaRef = useRef<HTMLDivElement>(null);

  const preloaderDone = usePreloaderDone();

  // Entrance animation for body
  useEffect(() => {
    if (!preloaderDone || !bodyRef.current || !sectionRef.current) return;
    gsap.registerPlugin(ScrollTrigger);

    const body = bodyRef.current;
    const section = sectionRef.current;

    gsap.set(body, { y: 36 });
    const tween = gsap.to(body, {
      y: 0,
      opacity: 1,
      duration: 0.9,
      ease: 'power3.out',
      scrollTrigger: { trigger: section, start: 'top 78%', once: true },
    });

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [preloaderDone]);

  // Fade-in after slide change
  useEffect(() => {
    if (!hasNavigatedRef.current) return;
    const targets = [portraitRef.current, quoteRef.current, metaRef.current].filter(Boolean);
    gsap.to(targets, {
      opacity: 1,
      duration: 0.4,
      ease: 'power2.out',
      onComplete: () => {
        busyRef.current = false;
      },
    });
  }, [activeIndex]);

  function go(dir: number) {
    if (busyRef.current || testimonials.length <= 1) return;
    busyRef.current = true;
    hasNavigatedRef.current = true;

    const targets = [portraitRef.current, quoteRef.current, metaRef.current].filter(Boolean);
    gsap.to(targets, {
      opacity: 0,
      duration: 0.28,
      ease: 'power2.in',
      onComplete: () => {
        setActiveIndex((i) => (i + dir + testimonials.length) % testimonials.length);
      },
    });
  }

  if (!testimonials.length) return null;

  const item = testimonials[activeIndex];
  const total = testimonials.length;

  return (
    <Section
      ref={sectionRef}
      kicker={header?.kicker}
      inverted
      kickerClassName="border-t border-cream/22 pt-[22px]"
      className="text-cream bg-(--green-deep) max-lg:min-h-0"
    >
      {/* Body */}
      <div
        ref={bodyRef}
        className="mt-[clamp(48px,8vh,100px)] grid grid-cols-[clamp(160px,16vw,230px)_1fr] items-start gap-[clamp(36px,6vw,90px)] opacity-0 max-md:grid-cols-1 max-md:gap-8"
      >
        {/* Portrait */}
        <div ref={portraitRef} className="bg-cream/18 aspect-3/4 overflow-hidden max-md:w-35">
          {item.image ? (
            <Image
              src={item.image.url}
              alt={item.image.alternativeText ?? item.name}
              width={230}
              height={307}
              className="h-full w-full object-cover grayscale"
              sizes="(max-width: 768px) 140px, clamp(160px, 16vw, 230px)"
            />
          ) : (
            <div className="bg-cream/10 h-full w-full" />
          )}
        </div>

        {/* Content */}
        <div>
          <blockquote
            ref={quoteRef}
            className="relative max-w-[26ch] text-[clamp(26px,3.6vw,54px)] leading-[1.18] font-[360] tracking-tight"
          >
            <span className="text-cream/45 absolute top-[-0.08em] left-[-0.5em] text-[1.1em] max-md:top-[-0.7em] max-md:left-0">
              &ldquo;
            </span>
            {item.quote}
          </blockquote>

          <div
            ref={metaRef}
            className="mt-[clamp(36px,5vh,64px)] flex flex-wrap items-end justify-between gap-[clamp(20px,4vw,48px)]"
          >
            {/* Name + role */}
            <div>
              <p className="mb-2 text-[clamp(17px,1.5vw,22px)] font-[450]">{item.name}</p>
              {item.role && (
                <p className="text-cream/55 text-[11px] tracking-[0.14em] uppercase">{item.role}</p>
              )}
            </div>

            {/* Counter + nav */}
            <div className="flex shrink-0 items-center gap-[clamp(16px,2vw,28px)]">
              <span className="text-cream/60 text-[12px] tracking-[0.14em] uppercase tabular-nums">
                {String(activeIndex + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
              </span>
              <div className="flex gap-2.5">
                <button
                  onClick={() => go(-1)}
                  aria-label={t('prev')}
                  className="border-cream text-cream hover:bg-cream flex h-13 w-13 cursor-pointer items-center justify-center border text-[17px] transition-[background-color,color,border-color] duration-300 hover:text-(--green-deep) active:scale-[0.94] max-md:h-11.5 max-md:w-11.5"
                >
                  ←
                </button>
                <button
                  onClick={() => go(1)}
                  aria-label={t('next')}
                  className="border-cream text-cream hover:bg-cream flex h-13 w-13 cursor-pointer items-center justify-center border text-[17px] transition-[background-color,color,border-color] duration-300 hover:text-(--green-deep) active:scale-[0.94] max-md:h-11.5 max-md:w-11.5"
                >
                  →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}
