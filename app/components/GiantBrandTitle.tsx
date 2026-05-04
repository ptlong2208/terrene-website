'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

interface GiantBrandTitleProps {
  title: string;
}

export default function GiantBrandTitle({ title }: GiantBrandTitleProps) {
  const titleRef = useRef<HTMLHeadingElement | null>(null);

  useEffect(() => {
    if (!titleRef.current) return;

    gsap.registerPlugin(ScrollTrigger);

    const titleAnim = gsap.to(titleRef.current, {
      scale: 0.05,
      y: -80,
      opacity: 0,
      transformOrigin: 'top center',
      ease: 'power1.inOut',
      scrollTrigger: {
        trigger: '.hero-birchmore',
        start: 'top top',
        end: 'bottom 70%',
        scrub: true,
      },
    });

    return () => {
      titleAnim.scrollTrigger?.kill();
      titleAnim.kill();
    };
  }, []);

  return (
    <h1
      ref={titleRef}
      className="giant-brand-text w-full text-center text-[clamp(3.75rem,24vw,24rem)] text-dark leading-[0.74] uppercase tracking-tighter whitespace-nowrap font-extrabold px-2 sm:px-0"
    >
      {title}
    </h1>
  );
}
