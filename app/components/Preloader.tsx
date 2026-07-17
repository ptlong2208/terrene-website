'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import TerreneLogo from '@/app/components/TerreneLogo';
import { isPreloaderDone } from '@/app/hooks/usePreloaderDone';

interface PreloaderProps {
  siteName: string;
  quote: string;
}

export default function Preloader({ siteName, quote }: PreloaderProps) {
  const loaderRef = useRef<HTMLDivElement>(null);
  const markRef = useRef<HTMLDivElement>(null);
  const brandLineRef = useRef<HTMLSpanElement>(null);
  const quoteLineRef = useRef<HTMLSpanElement>(null);
  const countRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loader = loaderRef.current;
    const mark = markRef.current;
    const brandLine = brandLineRef.current;
    const quoteLine = quoteLineRef.current;
    const count = countRef.current;
    if (!loader || !mark || !brandLine || !quoteLine || !count) return;

    if (isPreloaderDone()) {
      gsap.set(loader, { display: 'none' });
      return;
    }

    document.body.classList.add('is-locked');

    gsap.set(mark, { scale: 0.7, rotation: -90 });
    gsap.set(brandLine, { yPercent: 110, visibility: 'visible' });
    gsap.set(quoteLine, { yPercent: 110, visibility: 'visible' });

    const countObj = { value: 0 };

    const tl = gsap.timeline({
      onComplete: () => {
        document.body.classList.remove('is-locked');
        gsap.set(loader, { display: 'none' });
        window.dispatchEvent(new CustomEvent('preloader:complete'));
      },
    });

    tl.to(mark, { opacity: 1, scale: 1, rotation: 0, duration: 1.1, ease: 'power3.out' })
      .to(brandLine, { yPercent: 0, duration: 1, ease: 'power3.out' }, '-=0.7')
      .to(quoteLine, { yPercent: 0, duration: 0.9, ease: 'power3.out' }, '-=0.6')
      .to(
        countObj,
        {
          value: 100,
          duration: 1.6,
          ease: 'power2.inOut',
          onUpdate: () => {
            count.textContent = String(Math.round(countObj.value));
          },
        },
        0
      )
      .to(brandLine, { yPercent: -110, duration: 0.7, ease: 'power3.in' }, '+=0.2')
      .to(quoteLine, { yPercent: -110, duration: 0.6, ease: 'power3.in' }, '<')
      .to(mark, { opacity: 0, y: -24, duration: 0.5, ease: 'power2.in' }, '<')
      .to(loader, { yPercent: -100, duration: 1, ease: 'expo.inOut' }, '-=0.25');

    return () => {
      tl.kill();
      document.body.classList.remove('is-locked');
    };
  }, []);

  return (
    <div
      ref={loaderRef}
      className="fixed inset-0 z-2000 flex flex-col items-center justify-center gap-7 bg-(--green-deep)"
    >
      <div ref={markRef} className="opacity-0">
        <TerreneLogo className="text-cream size-11.5" />
      </div>

      <div className="overflow-hidden">
        <span
          ref={brandLineRef}
          className="font-display text-cream invisible block text-[clamp(40px,6vw,80px)] leading-[0.95] font-normal tracking-[-0.02em] lowercase"
        >
          {siteName}
        </span>
      </div>

      <div className="overflow-hidden">
        <span
          ref={quoteLineRef}
          className="text-cream/55 invisible block text-[clamp(13px,1.1vw,16px)] tracking-[-0.02em]"
        >
          {quote}
        </span>
      </div>

      <div
        ref={countRef}
        className="font-display text-cream/55 absolute right-(--gutter) bottom-7 text-[clamp(40px,8vw,80px)] tracking-[-0.02em] tabular-nums"
      >
        0
      </div>
    </div>
  );
}
