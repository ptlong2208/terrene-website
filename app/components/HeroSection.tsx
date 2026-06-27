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
      className="sticky top-0 z-0 min-h-svh overflow-hidden flex items-end pt-27 lg:pt-24 pb-[clamp(28px,5vh,56px)] px-gutter"
    >
      {videoUrl ? (
        <video
          ref={videoRef}
          className="absolute left-0 top-[-10%] w-full h-[120%] object-cover z-1 will-change-transform"
          autoPlay
          muted
          loop
          playsInline
          poster={posterUrl}
        >
          <source src={videoUrl} type="video/mp4" />
        </video>
      ) : (
        <div className="absolute inset-0 z-1 bg-cream" />
      )}

      <div
        className="absolute inset-0 z-2"
        style={{
          background:
            'linear-gradient(180deg, color-mix(in srgb, var(--green-deep) 30%, transparent) 0%, color-mix(in srgb, var(--green-deep) 8%, transparent) 36%, color-mix(in srgb, var(--green-deep) 26%, transparent) 66%, color-mix(in srgb, var(--green-deep) 58%, transparent) 100%)',
        }}
      />

      <div className="relative z-3 w-full grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(280px,46ch)] items-start lg:items-end gap-4.5 lg:gap-[clamp(24px,5vw,90px)] text-cream">
        {title ? (
          <h1
            ref={titleRef}
            className="opacity-0 max-w-[16ch] text-balance break-keep hyphens-none tracking-[-0.02em] text-[2.25rem] sm:text-[2.875rem] lg:text-[3.5rem] xl:text-[4.25rem] leading-[1.1]"
          >
            {title}
          </h1>
        ) : (
          <div aria-hidden="true" />
        )}

        {description ? (
          <p
            ref={descRef}
            className="opacity-0 max-w-152 lg:max-w-[46ch] lg:justify-self-end text-pretty text-[0.875rem] sm:text-[0.9375rem] lg:text-[1rem] leading-normal text-cream/86"
          >
            {description}
          </p>
        ) : null}
      </div>

      {posterUrl && posterAlt ? <span className="sr-only">{posterAlt}</span> : null}
    </section>
  );
}
