'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence, cubicBezier } from 'framer-motion';
import { ShoppingCart, Phone } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { strapiMediaUrl } from '@/lib/strapi';
import type { NavLink, StrapiMedia } from '@/lib/types';
import MenuToggleButton from '@/app/components/MenuToggleButton';
import MusicToggleButton from '@/app/components/MusicToggleButton';

interface HeaderProps {
  siteName: string;
  logo?: StrapiMedia | null;
  ambientAudio?: StrapiMedia | null;
  navEmail?: string | null;
  navLinks?: NavLink[];
  cartCount?: number;
}

export default function Header({ siteName, logo, ambientAudio, navEmail, navLinks = [], cartCount = 0 }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const headerRef = useRef<HTMLElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioSrc = ambientAudio ? strapiMediaUrl(ambientAudio.url) : '';

  useEffect(() => {
    if (!headerRef.current) return;

    gsap.registerPlugin(ScrollTrigger);

    const hideHeaderAnim = gsap.to(headerRef.current, {
      yPercent: -100,
      paused: true,
      duration: 0.4,
      ease: 'power3.inOut',
    });

    const headerScrollTrigger = ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: (self) => {
        const currentScroll = self.scroll();

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
    };
  }, []);

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
      return;
    }

    audio.pause();
    setIsAudioPlaying(false);
  };

  const overlayVariants = {
    closed: {
      clipPath: 'circle(0% at 4% 5%)',
      pointerEvents: 'none' as const,
    },
    open: {
      clipPath: 'circle(150% at 4% 5%)',
      pointerEvents: 'auto' as const,
      transition: {
        duration: 0.8,
        ease: cubicBezier(0.77, 0, 0.175, 1),
      },
    },
  };

  const navListVariants = {
    open: {
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  };

  const navItemVariants = {
    closed: { opacity: 0, y: 40 },
    open: () => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: cubicBezier(0.25, 1, 0.5, 1),
      },
    }),
  };

  return (
    <>
      <motion.header
        ref={headerRef}
        className="fixed top-0 left-0 right-0 z-50 bg-cream px-4 py-4 sm:px-6 sm:py-5 md:px-8 md:py-6 flex items-center justify-between"
      >
        <audio ref={audioRef} src={audioSrc} loop preload="metadata" />

        <div className="flex items-center gap-3 sm:gap-5 md:gap-8 min-w-0">
          <Link href="/" className="sm:hidden flex items-center justify-start">
            {logo && (
              <Image
                src={strapiMediaUrl(logo.url)}
                alt={siteName}
                width={36}
                height={36}
                className="h-9 w-auto filter-[brightness(0)_saturate(100%)] opacity-[0.89]"
                priority
              />
            )}
          </Link>

          <MusicToggleButton
            isPlaying={isAudioPlaying}
            onToggle={handleAudioToggle}
            disabled={!audioSrc}
            className="sm:hidden"
          />

          <div className="hidden sm:flex items-center gap-3 sm:gap-5 md:gap-8">
            <MenuToggleButton isOpen={isMenuOpen} onToggle={() => setIsMenuOpen(!isMenuOpen)} />

            <MusicToggleButton
              isPlaying={isAudioPlaying}
              onToggle={handleAudioToggle}
              disabled={!audioSrc}
              className="md:px-2"
            />
          </div>
        </div>

        <Link href="/" className="hidden sm:flex absolute left-1/2 -translate-x-1/2 items-center justify-center gap-2">
          {logo && (
            <Image
              src={strapiMediaUrl(logo.url)}
              alt={siteName}
              width={36}
              height={36}
              className="h-7 sm:h-8 md:h-9 w-auto filter-[brightness(0)_saturate(100%)] opacity-[0.89]"
              priority
            />
          )}
        </Link>

        <div className="flex justify-end items-center gap-4 sm:gap-5 md:gap-7">
          <Link
            href="/cart"
            className="bg-none border-none cursor-pointer text-dark flex items-center relative transition-opacity opacity-70 hover:opacity-100"
            aria-label="Shopping Cart"
          >
            <ShoppingCart className="h-5 w-5 sm:h-5.5 sm:w-5.5" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-matcha text-cream text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>
          <Link
            href='#'
            className="bg-none border-none cursor-pointer text-dark flex items-center transition-opacity opacity-70 hover:opacity-100"
            aria-label="Contact"
          >
            <Phone className="h-5 w-5 sm:h-5.5 sm:w-5.5" />
          </Link>

          <div className="sm:hidden">
            <MenuToggleButton isOpen={isMenuOpen} onToggle={() => setIsMenuOpen(!isMenuOpen)} compact />
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            className="fixed inset-0 w-screen h-screen bg-matcha z-40 flex items-center justify-center"
            variants={overlayVariants}
            initial="closed"
            animate="open"
            exit="closed"
          >
            <div className="text-center">
              <motion.ul
                className="flex flex-col gap-8 mb-16"
                variants={navListVariants}
                initial="closed"
                animate="open"
              >
                {navLinks.map((link, i) => (
                  <motion.li key={link.id} custom={i} variants={navItemVariants}>
                    <Link
                      href={link.href}
                      className="font-display text-6xl text-cream hover:opacity-60 transition-opacity block"
                      style={{ fontFamily: "'Faculty Glyphic', serif" }}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {link.label}
                    </Link>
                  </motion.li>
                ))}
              </motion.ul>

              <motion.div
                className="flex gap-12 justify-center text-cream text-[11px] font-bold uppercase tracking-[0.1em]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                transition={{ delay: 0.8, duration: 0.5 }}
              >
                {navEmail && <span>{navEmail}</span>}
                <span>IG: @terrene.matcha</span>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
