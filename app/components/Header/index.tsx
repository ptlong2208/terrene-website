'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CustomEase } from 'gsap/CustomEase';
import { strapiMediaUrl } from '@/lib/strapi';
import type { NavLink, StrapiMedia } from '@/lib/types';
import MenuOverlay, { type MenuState } from '@/app/components/MenuOverlay';
import { useBodyScrollLock } from '@/app/hooks/useBodyScrollLock';
import HeaderLeft from './HeaderLeft';
import HeaderLogo from './HeaderLogo';
import HeaderRight from './HeaderRight';

interface HeaderProps {
  siteName: string;
  logo?: StrapiMedia;
  ambientAudio?: StrapiMedia;
  navLinks?: NavLink[];
  navShopLink?: NavLink;
  navCartLabel?: string;
  cartCount?: number;
}

export default function Header({
  siteName,
  logo,
  ambientAudio,
  navLinks = [],
  navShopLink,
  navCartLabel,
  cartCount = 0,
}: HeaderProps) {
  const [menuState, setMenuState] = useState<MenuState>('closed');
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [hasBg, setHasBg] = useState(false);

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
          setHasBg(true);
          return;
        }

        setHasBg(currentScroll > 60);

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

  useBodyScrollLock(menuState !== 'closed');

  const openMenu = () => setMenuState('open');
  const closeMenu = () => setMenuState('closing');
  const handleMenuClosed = useCallback(() => setMenuState('closed'), []);

  const handleAudioToggle = async () => {
    const audio = audioRef.current;
    if (!audio || !audioSrc) return;
    if (audio.paused) {
      try {
        await audio.play();
        setIsAudioPlaying(true);
      } catch {
        setIsAudioPlaying(false);
      }
    } else {
      audio.pause();
      setIsAudioPlaying(false);
    }
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

        <HeaderLogo siteName={siteName} logo={logo} hasBg={hasBg} />

        <HeaderRight
          navShopLink={navShopLink}
          navCartLabel={navCartLabel}
          cartCount={cartCount}
        />
      </header>

      <MenuOverlay
        menuState={menuState}
        navLinks={navLinks}
        onClose={closeMenu}
        onClosed={handleMenuClosed}
      />
    </>
  );
}
