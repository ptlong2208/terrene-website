'use client';

import { type RefObject, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { splitIntoLines } from '@/app/utils/splitLines';
import { usePreloaderDone } from '@/app/hooks/usePreloaderDone';

interface UseLineRevealOptions {
  start?: string;
  duration?: number;
  stagger?: number;
  ease?: string;
}

export function useLineReveal<T extends HTMLElement>(
  ref: RefObject<T | null>,
  {
    start = 'top 86%',
    duration = 0.9,
    stagger = 0.055,
    ease = 'power3.out',
  }: UseLineRevealOptions = {},
): void {
  const preloaderDone = usePreloaderDone();

  useEffect(() => {
    if (!preloaderDone || !ref.current) return;

    gsap.registerPlugin(ScrollTrigger);

    const el = ref.current;
    const restoreFns: Array<() => void> = [];
    let tween: gsap.core.Tween | null = null;
    let isActive = true;

    const run = () => {
      if (!isActive || !el) return;
      const lines = splitIntoLines(el, restoreFns);
      // Lines are wrapped in overflow:hidden — restoring opacity shows nothing until yPercent animates
      gsap.set(el, { opacity: 1 });
      if (!lines.length) return;
      gsap.set(lines, { yPercent: 110 });
      tween = gsap.to(lines, {
        yPercent: 0,
        duration,
        stagger,
        ease,
        scrollTrigger: { trigger: el, start, once: true },
      });
    };

    if (document.fonts?.ready) {
      void document.fonts.ready.then(run);
    } else {
      run();
    }

    return () => {
      isActive = false;
      tween?.scrollTrigger?.kill();
      tween?.kill();
      restoreFns.forEach((fn) => fn());
      gsap.set(el, { clearProps: 'opacity' });
    };
  }, [ref, preloaderDone, start, duration, stagger, ease]);
}
