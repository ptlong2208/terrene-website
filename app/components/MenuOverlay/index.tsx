'use client';

import { motion } from 'framer-motion';
import gsap from 'gsap';
import { CustomEase } from 'gsap/CustomEase';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useEffect, useRef } from 'react';

import SlotText from '@/app/components/ui/SlotText';
import { strapiMediaUrl } from '@/lib/strapi';
import type { NavLink, StrapiMedia } from '@/lib/types';

import styles from './MenuOverlay.module.css';

export type MenuState = 'closed' | 'open' | 'closing';

const linkVariants = {
  open: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: 0.45 + i * 0.07, ease: [0.215, 0.61, 0.355, 1] as const },
  }),
  closed: { opacity: 0, y: 24, transition: { duration: 0 } },
  closing: {
    opacity: 0,
    y: -16,
    transition: { duration: 0.3, ease: [0.55, 0.085, 0.68, 0.53] as const },
  },
};

interface MenuOverlayProps {
  menuState: MenuState;
  navLinks: NavLink[];
  overlayImage?: StrapiMedia | null;
  onClose: () => void;
  onClosed: () => void;
}

export default function MenuOverlay({
  menuState,
  navLinks,
  overlayImage,
  onClose,
  onClosed,
}: MenuOverlayProps) {
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const curtain1Ref = useRef<HTMLDivElement | null>(null);
  const curtain2Ref = useRef<HTMLDivElement | null>(null);
  const curtain3Ref = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const footerRef = useRef<HTMLDivElement | null>(null);

  const t = useTranslations('nav');
  const tCommon = useTranslations('common');
  const onClosedRef = useRef(onClosed);
  useEffect(() => {
    onClosedRef.current = onClosed;
  });

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
      gsap.set(curtains, { yPercent: -100 });

      gsap.to(curtains[0], { yPercent: 0, duration: 0.74, ease });
      gsap.to(curtains[1], { yPercent: 0, duration: 0.74, ease, delay: 0.08 });
      gsap.to(curtains[2], { yPercent: 0, duration: 0.74, ease, delay: 0.16 });

      gsap.fromTo(content, { y: 18 }, { y: 0, duration: 0.7, ease, delay: 0.38 });
      gsap.fromTo(
        content,
        { opacity: 0 },
        { opacity: 1, duration: 0.4, ease: 'power1.inOut', delay: 0.42 }
      );

      if (footer) gsap.to(footer, { autoAlpha: 1, duration: 0.6, ease: 'power2.out', delay: 0.7 });
    }

    if (menuState === 'closing') {
      gsap.to(content, { y: -18, duration: 0.38, ease });
      gsap.to(content, { opacity: 0, duration: 0.24, ease: 'power1.inOut' });
      if (footer) gsap.to(footer, { autoAlpha: 0, duration: 0.25 });

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

  useEffect(() => {
    const overlay = overlayRef.current;
    const curtain1 = curtain1Ref.current;
    const curtain2 = curtain2Ref.current;
    const curtain3 = curtain3Ref.current;
    const content = contentRef.current;
    const footer = footerRef.current;
    return () => {
      gsap.killTweensOf([overlay, curtain1, curtain2, curtain3, content, footer].filter(Boolean));
    };
  }, []);

  return (
    <div
      ref={overlayRef}
      className="invisible fixed inset-0 z-1100 text-(--brown)"
      aria-hidden={menuState === 'closed'}
    >
      <div ref={curtain1Ref} className="absolute inset-0 z-1 origin-top bg-(--brown)" />
      <div ref={curtain2Ref} className="absolute inset-0 z-2 origin-top bg-(--green-deep)" />
      <div ref={curtain3Ref} className="bg-cream absolute inset-0 z-3 origin-top" />

      <div ref={contentRef} className="relative z-4 flex h-full flex-col overflow-hidden">
        <div className="px-gutter flex h-16 shrink-0 items-center justify-center">
          <button type="button" className={`${styles.closeBtn} group`} onClick={onClose}>
            <SlotText text={tCommon('close')} />
          </button>
        </div>

        <div className="px-gutter flex min-h-0 flex-1 flex-col items-center justify-center gap-12 pb-5">
          <nav className="flex flex-col items-center gap-2" aria-label={t('overlayLabel')}>
            {navLinks.map((link, i) => (
              <motion.div
                key={link.id}
                custom={i}
                variants={linkVariants}
                animate={menuState}
                initial="closed"
              >
                <Link href={link.href} className={`group ${styles.primaryLink}`} onClick={onClose}>
                  <SlotText text={link.label} />
                </Link>
              </motion.div>
            ))}
          </nav>
        </div>

        {overlayImage && (
          <div
            ref={footerRef}
            className="relative h-[clamp(300px,42vh,520px)] shrink-0 overflow-hidden"
          >
            <Image
              src={strapiMediaUrl(overlayImage.url)}
              alt={overlayImage.alternativeText ?? ''}
              fill
              className="object-cover"
              sizes="100vw"
            />
          </div>
        )}
      </div>
    </div>
  );
}
