'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CustomEase } from 'gsap/CustomEase';
import { strapiMediaUrl } from '@/lib/strapi';
import type { NavLink, StrapiMedia } from '@/lib/types';
import { useTranslations } from 'next-intl';
import MenuOverlay, { type MenuState } from '@/app/components/MenuOverlay';
import MusicConsentBanner from '@/app/components/MusicConsentBanner';
import { useBodyScrollLock } from '@/app/hooks/useBodyScrollLock';
import { usePreloaderDone } from '@/app/hooks/usePreloaderDone';
import HeaderLeft from './HeaderLeft';
import HeaderLogo from './HeaderLogo';
import HeaderRight from './HeaderRight';

interface HeaderProps {
  siteName: string;
  ambientAudio?: StrapiMedia;
  navLinks?: NavLink[];
  navShopLink?: NavLink;
  navCartLabel?: string;
  navOverlayImage?: StrapiMedia | null;
  musicConsentText?: string | null;
  musicConsentAccept?: string | null;
  musicConsentDecline?: string | null;
}

export default function Header({
  siteName,
  ambientAudio,
  navLinks = [],
  navShopLink,
  navCartLabel,
  navOverlayImage,
  musicConsentText,
  musicConsentAccept,
  musicConsentDecline,
}: HeaderProps) {
  const t = useTranslations('audio');
  const pathname = usePathname();
  const isHomepage = /^\/[a-z]{2}\/?$/.test(pathname);
  const [menuState, setMenuState] = useState<MenuState>('closed');
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [scrolledPast60, setScrolledPast60] = useState(false);
  const hasBg = !isHomepage || scrolledPast60;
  const [showConsent, setShowConsent] = useState(false);
  const preloaderDone = usePreloaderDone();

  const headerRef = useRef<HTMLElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hideHeaderAnimRef = useRef<gsap.core.Timeline | null>(null);
  const isOverFooterRef = useRef(false);
  const audioSrc = ambientAudio ? strapiMediaUrl(ambientAudio.url) : '';

  useEffect(() => {
    if (!headerRef.current) return;
    gsap.registerPlugin(ScrollTrigger, CustomEase);
    CustomEase.create('headerSlide', 'M0,0 C0.77,0 0.175,1 1,1');

    const hideHeaderAnim = gsap.timeline({ paused: true })
      .to(headerRef.current, { opacity: 0, duration: 0.8, ease: 'power1.inOut' }, 0)
      .to(headerRef.current, { yPercent: -110, duration: 0.8, ease: 'headerSlide' }, 0);

    hideHeaderAnimRef.current = hideHeaderAnim;

    const headerScrollTrigger = ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: (self) => {
        const currentScroll = self.scroll();

        if (isOverFooterRef.current) {
          hideHeaderAnim.reverse();
          setScrolledPast60(true);
          return;
        }

        setScrolledPast60(currentScroll > 60);

        if (currentScroll <= 0) {
          hideHeaderAnim.reverse();
          return;
        }

        const isTimelineTrapped = (window as Window & { isTimelineTrapped?: boolean }).isTimelineTrapped;
        if (isTimelineTrapped) return;

        if (self.direction === 1) {
          hideHeaderAnim.play();
        } else {
          hideHeaderAnim.reverse();
        }
      },
    });

    return () => {
      headerScrollTrigger.kill();
      hideHeaderAnim.kill();
      hideHeaderAnimRef.current = null;
    };
  }, []);

  useEffect(() => {
    hideHeaderAnimRef.current?.reverse();
  }, [pathname]);

  useBodyScrollLock(menuState !== 'closed');

  const openMenu = () => setMenuState('open');
  const closeMenu = () => setMenuState('closing');
  const handleMenuClosed = useCallback(() => setMenuState('closed'), []);

  useEffect(() => {
    if (!preloaderDone || !audioSrc || !musicConsentText || !musicConsentAccept || !musicConsentDecline) return;
    const timer = setTimeout(() => setShowConsent(true), 2000);
    return () => clearTimeout(timer);
  }, [preloaderDone, audioSrc, musicConsentText, musicConsentAccept, musicConsentDecline]);

  const playMusic = async () => {
    const audio = audioRef.current;
    if (!audio || !audioSrc) return;
    try {
      await audio.play();
      setIsAudioPlaying(true);
    } catch {
      setIsAudioPlaying(false);
    }
  };

  const handleAudioToggle = async () => {
    const audio = audioRef.current;
    if (!audio || !audioSrc) return;
    if (audio.paused) {
      await playMusic();
    } else {
      audio.pause();
      setIsAudioPlaying(false);
    }
  };

  const handleConsentAccept = () => {
    setShowConsent(false);
    void playMusic();
  };

  return (
    <>
      <header
        ref={headerRef}
        className={`fixed top-0 left-0 right-0 z-1000 grid grid-cols-[1fr_auto_1fr] items-center h-22 md:h-16 px-5 md:px-gutter transition-colors duration-400 ${
          hasBg ? 'bg-cream text-(--green-deep)' : 'bg-transparent text-cream'
        }`}
      >
        <audio ref={audioRef} src={audioSrc} loop preload="metadata" />

        <HeaderLeft
          isAudioPlaying={isAudioPlaying}
          onAudioToggle={handleAudioToggle}
          isMenuOpen={menuState === 'open'}
          onMenuToggle={menuState === 'open' ? closeMenu : openMenu}
        />

        <HeaderLogo siteName={siteName} />

        <HeaderRight
          navShopLink={navShopLink}
          navCartLabel={navCartLabel}
        />
      </header>

      <MenuOverlay
        menuState={menuState}
        navLinks={navLinks}
        overlayImage={navOverlayImage}
        onClose={closeMenu}
        onClosed={handleMenuClosed}
      />

      <MusicConsentBanner
        show={showConsent}
        dialogLabel={t('consentDialogLabel')}
        text={musicConsentText ?? ''}
        acceptLabel={musicConsentAccept ?? ''}
        declineLabel={musicConsentDecline ?? ''}
        onAccept={handleConsentAccept}
        onDecline={() => setShowConsent(false)}
      />
    </>
  );
}
