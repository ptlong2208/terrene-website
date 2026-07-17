'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Section from '@/app/components/ui/Section';
import CtaLink from '@/app/components/ui/CtaLink';
import TerreneElement from '@/app/components/TerreneElement';
import { useLineReveal } from '@/app/hooks/useLineReveal';
import { usePreloaderDone } from '@/app/hooks/usePreloaderDone';
import { strapiMediaUrl } from '@/lib/strapi';
import type { NavLink, SectionHeaderData, StrapiMedia } from '@/lib/types';

interface StorySectionProps {
  header?: SectionHeaderData | null;
  image?: StrapiMedia | null;
  sideLabel?: string | null;
  body?: string | null;
  cta?: NavLink | null;
}

export default function StorySection({ header, image, sideLabel, body, cta }: StorySectionProps) {
  const imgWrapRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const sideLabelTextRef = useRef<HTMLSpanElement>(null);
  const paragraphsRef = useRef<HTMLDivElement>(null);
  const preloaderDone = usePreloaderDone();

  useLineReveal(sideLabelTextRef, { start: 'top 86%', duration: 0.9 });

  useEffect(() => {
    if (!preloaderDone) return;

    gsap.registerPlugin(ScrollTrigger);

    const imgWrap = imgWrapRef.current;
    const img = imgRef.current;
    const paragraphs = paragraphsRef.current
      ? Array.from(paragraphsRef.current.querySelectorAll<HTMLElement>('p'))
      : [];

    let isActive = true;
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
        })
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
            }
          )
        );
      }
    }

    // Per-paragraph fade-up with stagger
    if (paragraphs.length && isActive) {
      gsap.set(paragraphs, { y: 24, opacity: 0 });
      tweens.push(
        gsap.to(paragraphs, {
          y: 0,
          opacity: 1,
          duration: 0.9,
          stagger: 0.12,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: paragraphsRef.current,
            start: 'top 86%',
            once: true,
          },
        })
      );
    }

    return () => {
      isActive = false;
      tweens.forEach((t) => {
        t.scrollTrigger?.kill();
        t.kill();
      });
      if (paragraphs.length) gsap.set(paragraphs, { clearProps: 'opacity,y' });
    };
  }, [preloaderDone]);

  return (
    <Section
      title={header?.title}
      titleClassName="mb-[clamp(40px,6vh,72px)]"
      className="max-lg:min-h-0"
    >
      <div
        ref={imgWrapRef}
        className="relative mx-auto mb-[clamp(32px,4vh,52px)] aspect-5/4 w-[min(38vw,480px)] overflow-hidden opacity-0 max-lg:w-[72vw] max-md:w-[88vw]"
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

      <div className="mx-auto w-[min(38vw,480px)] max-lg:w-[72vw] max-md:w-[88vw]">
        {sideLabel && (
          <div className="text-ink-faint mb-4.5 flex items-center gap-2.5">
            <TerreneElement className="size-3.75 shrink-0" />
            <span
              ref={sideLabelTextRef}
              className="text-[11px] font-medium tracking-[0.14em] uppercase opacity-0"
            >
              {sideLabel}
            </span>
          </div>
        )}

        <div ref={paragraphsRef}>
          {body?.split('\n\n').map((para, i) => (
            <p
              key={i}
              className={`text-ink-soft text-[clamp(14px,1.15vw,17px)] leading-normal font-normal opacity-0${i > 0 ? 'mt-[clamp(16px,2vh,28px)]' : ''}`}
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
