'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Section from '@/app/components/Section';
import CtaLink from '@/app/components/CtaLink';
import TerreneLogo from '@/app/components/TerreneLogo';
import { useLineReveal } from '@/app/hooks/useLineReveal';
import { usePreloaderDone } from '@/app/hooks/usePreloaderDone';
import { splitIntoLines } from '@/app/utils/splitLines';
import { strapiMediaUrl } from '@/lib/strapi';
import type { NavLink, SectionHeaderData, StrapiMedia } from '@/lib/types';

interface StorySectionProps {
  header?: SectionHeaderData | null;
  image?: StrapiMedia | null;
  sideLabel?: string | null;
  body?: string | null;
  cta?: NavLink | null;
}

export default function StorySection({
  header,
  image,
  sideLabel,
  body,
  cta,
}: StorySectionProps) {
  const imgWrapRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const sideLabelTextRef = useRef<HTMLSpanElement>(null);
  const paragraphsRef = useRef<HTMLDivElement>(null);
  const preloaderDone = usePreloaderDone();

  // Side label text: body-copy line reveal
  useLineReveal(sideLabelTextRef, { start: 'top 86%', duration: 0.9, stagger: 0.055 });

  useEffect(() => {
    if (!preloaderDone) return;

    gsap.registerPlugin(ScrollTrigger);

    const imgWrap = imgWrapRef.current;
    const img = imgRef.current;
    const paragraphs = paragraphsRef.current
      ? Array.from(paragraphsRef.current.querySelectorAll<HTMLElement>('p'))
      : [];

    let isActive = true;
    const restoreFns: Array<() => void> = [];
    const tweens: gsap.core.Tween[] = [];

    // Image clip-path reveal
    if (imgWrap) {
      gsap.set(imgWrap, { clipPath: 'inset(100% 0 0 0)', opacity: 0 });
      tweens.push(
        gsap.to(imgWrap, {
          clipPath: 'inset(0% 0 0 0)',
          opacity: 1,
          duration: 1.3,
          ease: 'expo.inOut',
          scrollTrigger: { trigger: imgWrap, start: 'top 65%', once: true },
        }),
      );

      if (img) {
        tweens.push(
          gsap.fromTo(
            img,
            { scale: 1.25 },
            {
              scale: 1.2,
              duration: 1.6,
              ease: 'power2.out',
              scrollTrigger: { trigger: imgWrap, start: 'top 65%', once: true },
            },
          ),
        );
      }
    }

    // Paragraph per-line reveal (waits for font metrics)
    const runParaAnimation = () => {
      if (!isActive) return;
      paragraphs.forEach((p) => {
        const lines = splitIntoLines(p, restoreFns);
        if (!lines.length) return;
        gsap.set(lines, { yPercent: 110 });
        tweens.push(
          gsap.to(lines, {
            yPercent: 0,
            duration: 0.9,
            stagger: 0.055,
            ease: 'power3.out',
            scrollTrigger: { trigger: p, start: 'top 86%', once: true },
          }),
        );
      });
    };

    if (document.fonts?.ready) {
      void document.fonts.ready.then(runParaAnimation);
    } else {
      runParaAnimation();
    }

    return () => {
      isActive = false;
      tweens.forEach((t) => {
        t.scrollTrigger?.kill();
        t.kill();
      });
      restoreFns.forEach((fn) => fn());
    };
  }, [preloaderDone]);

  return (
    <Section
      title={header?.title}
      titleClassName="mb-[clamp(40px,6vh,72px)]"
    >
      <div
        ref={imgWrapRef}
        className="relative w-[min(38vw,480px)] max-md:w-[88vw] aspect-5/4 mx-auto mb-[clamp(32px,4vh,52px)] overflow-hidden"
      >
        {image ? (
          <Image
            ref={imgRef}
            src={strapiMediaUrl(image.url)}
            alt={image.alternativeText ?? ''}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 88vw, min(38vw, 480px)"
          />
        ) : (
          <div className="absolute inset-0 bg-(--green-deep)/10" />
        )}
      </div>

      <div className="w-[min(38vw,480px)] max-md:w-[88vw] mx-auto">
        {sideLabel && (
          <div className="flex items-center gap-2.5 text-ink-faint mb-4.5">
            <TerreneLogo className="size-3.75 shrink-0" />
            <span
              ref={sideLabelTextRef}
              className="text-[11px] font-medium tracking-[0.14em] uppercase"
            >
              {sideLabel}
            </span>
          </div>
        )}

        <div ref={paragraphsRef}>
          {body?.split('\n\n').map((para, i) => (
            <p
              key={i}
              className={`text-[clamp(14px,1.15vw,17px)] font-normal leading-[1.72] text-ink-soft${i > 0 ? ' mt-[clamp(16px,2vh,28px)]' : ''}`}
            >
              {para}
            </p>
          ))}
        </div>

        {cta && (
          <CtaLink
            href={cta.href || '/philosophy'}
            label={cta.label}
            className="mt-[clamp(28px,3.5vh,44px)]"
          />
        )}
      </div>
    </Section>
  );
}
