'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CustomEase } from 'gsap/CustomEase';
import { ShoppingBag } from 'lucide-react';
import { strapiMediaUrl } from '@/lib/strapi';
import type { NavLink, StrapiMedia } from '@/lib/types';
import SlotText from '@/app/components/SlotText';
import MenuToggleButton from '@/app/components/MenuToggleButton';
import MusicToggleButton from '@/app/components/MusicToggleButton';
import MenuOverlay, { type MenuState } from '@/app/components/MenuOverlay';

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

  // Hide header on scroll down, reveal on scroll up
  useEffect(() => {
    if (!headerRef.current) return;
    gsap.registerPlugin(ScrollTrigger, CustomEase);
    CustomEase.create('headerSlide', 'M0,0 C0.77,0 0.175,1 1,1');

    // Opacity fades with power1.inOut; transform slides with cubic-bezier(0.77,0,0.175,1) — matches reference
    const hideHeaderAnim = gsap.timeline({ paused: true })
      .to(headerRef.current, { opacity: 0, duration: 0.8, ease: 'power1.inOut' }, 0)
      .to(headerRef.current, { yPercent: -110, duration: 0.8, ease: 'headerSlide' }, 0);

    hideHeaderAnimRef.current = hideHeaderAnim;

    const headerScrollTrigger = ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: (self) => {
        const currentScroll = self.scroll();

        // Over footer: always show header with bg (matches reference isOverFooter guard)
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

  // Show header with bg when footer enters viewport (reference: isOverFooter IntersectionObserver)
  useEffect(() => {
    const footerEl = document.querySelector('footer');
    if (!footerEl) return;

    const observer = new IntersectionObserver(([entry]) => {
      isOverFooterRef.current = entry.isIntersecting;
      if (entry.isIntersecting) {
        hideHeaderAnimRef.current?.reverse();
        setHasBg(true);
      }
    }, { threshold: 0 });

    observer.observe(footerEl);
    return () => observer.disconnect();
  }, []);

  // Ensure body scroll is restored if component unmounts while menu is open
  useEffect(() => {
    return () => { document.body.classList.remove('is-locked'); };
  }, []);

  const openMenu = () => {
    document.body.classList.add('is-locked');
    setMenuState('open');
  };

  const closeMenu = () => {
    document.body.classList.remove('is-locked');
    setMenuState('closing');
  };

  // Stable reference so MenuOverlay's animation effect doesn't re-run on
  // every Header render (hasBg / isAudioPlaying changes)
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

  const cartText = `${navCartLabel} [${cartCount}]`;

  return (
    <>
      <header
        ref={headerRef}
        className={`fixed top-0 left-0 right-0 z-1000 grid grid-cols-[1fr_auto_1fr] items-start h-16 px-gutter pt-3.5 transition-colors duration-400 max-[720px]:h-22 max-[720px]:px-5 ${
          hasBg ? 'bg-cream text-(--green-deep)' : 'bg-transparent text-cream'
        }`}
      >
        <audio ref={audioRef} src={audioSrc} loop preload="metadata" />

        <div className="flex items-center gap-6 max-[720px]:gap-5">
          <MusicToggleButton isPlaying={isAudioPlaying} onToggle={handleAudioToggle} />
          <MenuToggleButton
            isOpen={menuState === 'open'}
            onToggle={menuState === 'open' ? closeMenu : openMenu}
          />
        </div>

        <Link href="/" className="justify-self-center hover:opacity-100!">
          {logo ? (
            <Image
              src={strapiMediaUrl(logo.url)}
              alt={siteName}
              width={34}
              height={34}
              className={`w-8 h-8 max-[720px]:w-8.5 max-[720px]:h-8.5 object-contain transition-[filter] duration-300 ${
                hasBg ? '' : 'brightness-0 invert'
              }`}
              priority
            />
          ) : (
            <span className="text-sm font-bold tracking-widest uppercase">{siteName}</span>
          )}
        </Link>

        <nav
          className="flex items-center gap-6 justify-end justify-self-end max-[720px]:gap-5"
          aria-label="Main navigation"
        >
          {navShopLink && (
            <Link
              href={navShopLink.href}
              className="group inline-flex whitespace-nowrap text-base max-[720px]:text-[18px] font-normal leading-none no-underline text-inherit transition-transform duration-120 ease-out hover:opacity-100! active:scale-[0.92]"
            >
              <SlotText text={navShopLink.label} />
            </Link>
          )}
          <button
            type="button"
            className="group header-cart inline-flex items-center whitespace-nowrap text-base max-[720px]:text-[18px] font-normal leading-none bg-transparent border-0 cursor-pointer p-0 text-inherit transition-transform duration-120 ease-out active:scale-[0.92]"
            aria-label={cartText}
          >
            <span className="max-[720px]:hidden">
              <SlotText text={cartText} />
            </span>
            <ShoppingBag size={18} strokeWidth={1.5} className="hidden max-[720px]:block" />
          </button>
        </nav>
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
