'use client';

import { useCallback, useEffect, useRef } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { CustomEase } from 'gsap/CustomEase';
import { motion } from 'framer-motion';
import type { NavLink } from '@/lib/types';

export type MenuState = 'closed' | 'open' | 'closing';

// Framer Motion variants per nav link — custom = index for per-link stagger delay
const linkVariants = {
  open: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: 0.45 + i * 0.07, ease: [0.25, 1, 0.5, 1] as const },
  }),
  closed: { opacity: 0, y: 24, transition: { duration: 0 } },
  closing: {
    opacity: 0,
    y: -16,
    transition: { duration: 0.3, ease: [0.5, 0, 0.75, 0] as const },
  },
};

interface MenuOverlayProps {
  menuState: MenuState;
  navLinks: NavLink[];
  onClose: () => void;
  onClosed: () => void;
}

export default function MenuOverlay({
  menuState,
  navLinks,
  onClose,
  onClosed,
}: MenuOverlayProps) {
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const curtain1Ref = useRef<HTMLDivElement | null>(null);
  const curtain2Ref = useRef<HTMLDivElement | null>(null);
  const curtain3Ref = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const footerRef = useRef<HTMLDivElement | null>(null);

  // Keep onClosed stable so the animation effect doesn't re-run when the
  // parent re-renders (e.g. hasBg / isAudioPlaying state changes in Header)
  const onClosedRef = useRef(onClosed);
  useEffect(() => { onClosedRef.current = onClosed; });

  // Register CustomEase and set all elements to their initial hidden state
  useEffect(() => {
    const overlay = overlayRef.current;
    const curtains = [curtain1Ref.current, curtain2Ref.current, curtain3Ref.current];
    const content = contentRef.current;
    if (!overlay || curtains.some((c) => !c) || !content) return;

    gsap.registerPlugin(CustomEase);
    CustomEase.create('menuCurtain', 'M0,0 C0.77,0 0.175,1 1,1');

    gsap.set(overlay, { autoAlpha: 0, pointerEvents: 'none' });
    gsap.set(curtains, { yPercent: -100 });
    gsap.set(content, { opacity: 0, y: 18 });
    if (footerRef.current) gsap.set(footerRef.current, { autoAlpha: 0 });
  }, []);

  // Drive all animation from menuState — no classList, no setTimeout
  useEffect(() => {
    const overlay = overlayRef.current;
    const curtains = [curtain1Ref.current, curtain2Ref.current, curtain3Ref.current];
    const content = contentRef.current;
    const footer = footerRef.current;
    if (!overlay || curtains.some((c) => !c) || !content) return;

    const ease = 'menuCurtain';

    if (menuState === 'open') {
      gsap.killTweensOf([overlay, ...curtains, content, footer].filter(Boolean));
      gsap.set(overlay, { autoAlpha: 1, pointerEvents: 'auto' });
      gsap.set(curtains, { yPercent: -100 }); // reset if interrupted mid-close

      // Three curtains wipe down — staggered 0.08 s each
      gsap.to(curtains[0], { yPercent: 0, duration: 0.74, ease });
      gsap.to(curtains[1], { yPercent: 0, duration: 0.74, ease, delay: 0.08 });
      gsap.to(curtains[2], { yPercent: 0, duration: 0.74, ease, delay: 0.16 });

      // Content rises in after curtains have mostly settled
      gsap.fromTo(content,
        { opacity: 0, y: 18 },
        { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', delay: 0.38 },
      );

      // Footer image fades in last
      if (footer) gsap.to(footer, { autoAlpha: 1, duration: 0.6, ease: 'power2.out', delay: 0.7 });
    }

    if (menuState === 'closing') {
      // Content leaves immediately
      gsap.to(content, { opacity: 0, y: -18, duration: 0.38, ease: 'power3.in' });
      if (footer) gsap.to(footer, { autoAlpha: 0, duration: 0.25 });

      // Curtains wipe out in reverse order (3 → 2 → 1)
      gsap.to(curtains[2], { yPercent: 100, duration: 0.74, ease });
      gsap.to(curtains[1], { yPercent: 100, duration: 0.74, ease, delay: 0.08 });
      gsap.to(curtains[0], {
        yPercent: 100,
        duration: 0.74,
        ease,
        delay: 0.16,
        onComplete: () => {
          gsap.set(overlay, { autoAlpha: 0, pointerEvents: 'none' });
          gsap.set(curtains, { yPercent: -100 });
          gsap.set(content, { opacity: 0, y: 18 });
          if (footer) gsap.set(footer, { autoAlpha: 0 });
          onClosedRef.current();
        },
      });
    }
  }, [menuState]);

  // Kill all tweens on unmount
  useEffect(() => {
    const overlay = overlayRef.current;
    const curtain1 = curtain1Ref.current;
    const curtain2 = curtain2Ref.current;
    const curtain3 = curtain3Ref.current;
    const content = contentRef.current;
    const footer = footerRef.current;
    return () => {
      gsap.killTweensOf(
        [overlay, curtain1, curtain2, curtain3, content, footer].filter(Boolean),
      );
    };
  }, []);

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-1100 text-(--brown)"
      aria-hidden={menuState === 'closed'}
    >
      {/* Three curtains — wipe in/out via GSAP yPercent */}
      <div ref={curtain1Ref} className="absolute inset-0 z-1 bg-(--brown) origin-top" />
      <div ref={curtain2Ref} className="absolute inset-0 z-2 bg-(--green-deep) origin-top" />
      <div ref={curtain3Ref} className="absolute inset-0 z-3 bg-cream origin-top" />

      {/* Content layer — opacity + y animated by GSAP */}
      <div ref={contentRef} className="relative z-4 h-full flex flex-col overflow-hidden">

        {/* Close button */}
        <div className="flex items-center justify-end px-gutter h-16 shrink-0">
          <button type="button" className="menu-close-btn" onClick={onClose}>
            Đóng
          </button>
        </div>

        {/* Nav links — each animated individually by Framer Motion */}
        <div className="flex-1 min-h-0 flex flex-col items-center justify-center gap-12 px-gutter pb-5">
          <nav className="flex flex-col items-center gap-2" aria-label="Overlay navigation">
            {navLinks.map((link, i) => (
              <motion.div
                key={link.id}
                custom={i}
                variants={linkVariants}
                animate={menuState}
                initial="closed"
              >
                <Link href={link.href} className="menu-primary-link" onClick={onClose}>
                  {link.label}
                </Link>
              </motion.div>
            ))}
          </nav>
        </div>

        {/* Footer image area — opacity animated by GSAP */}
        <div
          ref={footerRef}
          className="h-[clamp(300px,42vh,520px)] shrink-0 overflow-hidden"
        />
      </div>
    </div>
  );
}
