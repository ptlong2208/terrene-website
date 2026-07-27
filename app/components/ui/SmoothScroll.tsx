'use client';

import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';

gsap.registerPlugin(ScrollTrigger);

export default function SmoothScroll() {
  const pathname = usePathname();
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    lenisRef.current?.scrollTo(0, { immediate: true });
    const id = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(id);
  }, [pathname]);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1,
    });

    lenisRef.current = lenis;
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
      lenisRef.current = null;
      delete (window as unknown as Record<string, unknown>).lenis;
      lenis.destroy();
    };
  }, []);

  return null;
}
