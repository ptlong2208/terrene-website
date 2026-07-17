'use client';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { type RefObject, useEffect } from 'react';

import { usePreloaderDone } from '@/app/hooks/usePreloaderDone';

interface UseLineRevealOptions {
  start?: string;
  duration?: number;
  ease?: string;
  y?: number;
}

export function useLineReveal<T extends HTMLElement>(
  ref: RefObject<T | null>,
  { start = 'top 86%', duration = 0.9, ease = 'power3.out', y = 24 }: UseLineRevealOptions = {}
): void {
  const preloaderDone = usePreloaderDone();

  useEffect(() => {
    if (!preloaderDone || !ref.current) return;

    gsap.registerPlugin(ScrollTrigger);

    const el = ref.current;
    gsap.set(el, { y, opacity: 0 });
    const tween = gsap.to(el, {
      y: 0,
      opacity: 1,
      duration,
      ease,
      scrollTrigger: { trigger: el, start, once: true },
    });

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
      gsap.set(el, { clearProps: 'opacity,y' });
    };
  }, [ref, preloaderDone, start, duration, ease, y]);
}
