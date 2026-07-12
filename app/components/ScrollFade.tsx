'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

interface ScrollFadeProps {
  children: ReactNode;
  className?: string;
}

export default function ScrollFade({ children, className = '' }: ScrollFadeProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [overflowing, setOverflowing] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const check = () => setOverflowing(el.scrollHeight > el.clientHeight);

    check();
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      data-lenis-prevent
      className={`${className} ${overflowing ? 'mask-[linear-gradient(to_bottom,black_calc(100%-48px),transparent_100%)]' : ''}`}
    >
      {children}
    </div>
  );
}
