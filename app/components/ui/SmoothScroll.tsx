'use client';

import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { useEffect } from 'react';

gsap.registerPlugin(ScrollTrigger);

export default function SmoothScroll() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1,
    });

    (window as unknown as Record<string, unknown>).lenis = lenis;

    lenis.on('scroll', ScrollTrigger.update);

    const onTick = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(onTick);
    gsap.ticker.lagSmoothing(0);

    lenis.stop();
    const onPreloaderDone = () => lenis.start();
    window.addEventListener('preloader:complete', onPreloaderDone, { once: true });

    return () => {
      gsap.ticker.remove(onTick);
      window.removeEventListener('preloader:complete', onPreloaderDone);
      delete (window as unknown as Record<string, unknown>).lenis;
      lenis.destroy();
    };
  }, []);

  return null;
}
