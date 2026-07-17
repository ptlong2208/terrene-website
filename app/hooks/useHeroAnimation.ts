'use client';

import { type RefObject, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { usePreloaderDone } from '@/app/hooks/usePreloaderDone';

interface HeroAnimationRefs {
  sectionRef: RefObject<HTMLElement | null>;
  titleRef: RefObject<HTMLHeadingElement | null>;
  descRef: RefObject<HTMLParagraphElement | null>;
  videoRef: RefObject<HTMLVideoElement | null>;
}

export function useHeroAnimation({
  sectionRef,
  titleRef,
  descRef,
  videoRef,
}: HeroAnimationRefs): void {
  const preloaderDone = usePreloaderDone();

  useEffect(() => {
    if (!preloaderDone || !sectionRef.current) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return;

    gsap.registerPlugin(ScrollTrigger);

    const section = sectionRef.current;
    let introTl: gsap.core.Timeline | null = null;
    let videoTween: gsap.core.Tween | null = null;

    if (videoRef.current) {
      videoTween = gsap.fromTo(
        videoRef.current,
        { yPercent: 0 },
        {
          yPercent: -8,
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: 'bottom top',
            scrub: true,
          },
        }
      );
    }

    introTl = gsap.timeline();

    if (titleRef.current) {
      introTl.fromTo(
        titleRef.current,
        { y: 32, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.1, ease: 'power3.out' }
      );
    }

    if (descRef.current) {
      introTl.fromTo(
        descRef.current,
        { y: 24, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.95, ease: 'power3.out' },
        '-=0.72'
      );
    }

    return () => {
      introTl?.kill();
      videoTween?.scrollTrigger?.kill();
      videoTween?.kill();
    };
  }, [sectionRef, titleRef, descRef, videoRef, preloaderDone]);
}
