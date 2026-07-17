'use client';

import { useRef } from 'react';
import { useHeroAnimation } from '@/app/hooks/useHeroAnimation';

interface HeroSectionProps {
  title?: string;
  description?: string;
  videoUrl?: string;
  posterUrl?: string;
  posterAlt?: string;
}

export default function HeroSection({
  title,
  description,
  videoUrl,
  posterUrl,
  posterAlt,
}: HeroSectionProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const titleRef = useRef<HTMLHeadingElement | null>(null);
  const descRef = useRef<HTMLParagraphElement | null>(null);

  useHeroAnimation({ sectionRef, titleRef, descRef, videoRef });

  return (
    <section
      ref={sectionRef}
      className="px-gutter sticky top-0 z-0 flex min-h-svh items-end overflow-hidden pt-27 pb-[clamp(28px,5vh,56px)] lg:pt-24"
    >
      {videoUrl ? (
        <video
          ref={videoRef}
          className="absolute top-[-10%] left-0 z-1 h-[120%] w-full object-cover will-change-transform"
          autoPlay
          muted
          loop
          playsInline
          poster={posterUrl}
        >
          <source src={videoUrl} type="video/mp4" />
        </video>
      ) : (
        <div className="bg-cream absolute inset-0 z-1" />
      )}

      <div
        className="absolute inset-0 z-2"
        style={{
          background:
            'linear-gradient(180deg, color-mix(in srgb, var(--green-deep) 30%, transparent) 0%, color-mix(in srgb, var(--green-deep) 8%, transparent) 36%, color-mix(in srgb, var(--green-deep) 26%, transparent) 66%, color-mix(in srgb, var(--green-deep) 58%, transparent) 100%)',
        }}
      />

      <div className="text-cream relative z-3 grid w-full grid-cols-1 items-start gap-4.5 lg:grid-cols-[minmax(0,1fr)_minmax(280px,46ch)] lg:items-end lg:gap-[clamp(24px,5vw,90px)]">
        {title ? (
          <h1
            ref={titleRef}
            className="max-w-[16ch] text-[2.25rem] leading-[1.1] tracking-[-0.02em] text-balance break-keep hyphens-none opacity-0 sm:text-[2.875rem] lg:text-[3.5rem] xl:text-[4.25rem]"
          >
            {title}
          </h1>
        ) : (
          <div aria-hidden="true" />
        )}

        {description ? (
          <p
            ref={descRef}
            className="text-cream/86 max-w-152 text-[0.875rem] leading-normal text-pretty opacity-0 sm:text-[0.9375rem] lg:max-w-[46ch] lg:justify-self-end lg:text-[1rem]"
          >
            {description}
          </p>
        ) : null}
      </div>

      {posterUrl && posterAlt ? <span className="sr-only">{posterAlt}</span> : null}
    </section>
  );
}
