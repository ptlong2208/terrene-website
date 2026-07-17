'use client';

import { useRef, useEffect, useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Section from '@/app/components/ui/Section';
import { usePreloaderDone } from '@/app/hooks/usePreloaderDone';
import { strapiMediaUrl } from '@/lib/strapi';
import type { TestimonialItem, SectionHeaderData } from '@/lib/types';

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
      onComplete: () => { busyRef.current = false; },
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
      className="bg-(--green-deep) text-cream max-lg:min-h-0"
    >
      {/* Body */}
      <div
        ref={bodyRef}
        className="mt-[clamp(48px,8vh,100px)] grid grid-cols-[clamp(160px,16vw,230px)_1fr] gap-[clamp(36px,6vw,90px)] items-start opacity-0 max-md:grid-cols-1 max-md:gap-8"
      >
        {/* Portrait */}
        <div
          ref={portraitRef}
          className="aspect-3/4 overflow-hidden bg-cream/18 max-md:w-35"
        >
          {item.image ? (
            <Image
              src={strapiMediaUrl(item.image.url)}
              alt={item.image.alternativeText ?? item.name}
              width={230}
              height={307}
              className="w-full h-full object-cover grayscale"
              sizes="(max-width: 768px) 140px, clamp(160px, 16vw, 230px)"
            />
          ) : (
            <div className="w-full h-full bg-cream/10" />
          )}
        </div>

        {/* Content */}
        <div>
          <blockquote
            ref={quoteRef}
            className="relative max-w-[26ch] text-[clamp(26px,3.6vw,54px)] font-[360] leading-[1.18] tracking-tight"
          >
            <span className="absolute left-[-0.5em] top-[-0.08em] text-[1.1em] text-cream/45 max-md:left-0 max-md:top-[-0.7em]">
              &ldquo;
            </span>
            {item.quote}
          </blockquote>

          <div
            ref={metaRef}
            className="flex items-end justify-between gap-[clamp(20px,4vw,48px)] mt-[clamp(36px,5vh,64px)] flex-wrap"
          >
            {/* Name + role */}
            <div>
              <p className="text-[clamp(17px,1.5vw,22px)] font-[450] mb-2">{item.name}</p>
              {item.role && (
                <p className="text-[11px] tracking-[0.14em] uppercase text-cream/55">
                  {item.role}
                </p>
              )}
            </div>

            {/* Counter + nav */}
            <div className="flex items-center gap-[clamp(16px,2vw,28px)] shrink-0">
              <span className="text-[12px] tabular-nums tracking-[0.14em] uppercase text-cream/60">
                {String(activeIndex + 1).padStart(2, '0')} /{' '}
                {String(total).padStart(2, '0')}
              </span>
              <div className="flex gap-2.5">
                <button
                  onClick={() => go(-1)}
                  aria-label={t('prev')}
                  className="w-13 h-13 border border-cream text-cream text-[17px] flex items-center justify-center cursor-pointer transition-[background-color,color,border-color] duration-300 hover:bg-cream hover:text-(--green-deep) active:scale-[0.94] max-md:w-11.5 max-md:h-11.5"
                >
                  ←
                </button>
                <button
                  onClick={() => go(1)}
                  aria-label={t('next')}
                  className="w-13 h-13 border border-cream text-cream text-[17px] flex items-center justify-center cursor-pointer transition-[background-color,color,border-color] duration-300 hover:bg-cream hover:text-(--green-deep) active:scale-[0.94] max-md:w-11.5 max-md:h-11.5"
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
