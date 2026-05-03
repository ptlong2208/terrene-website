'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence, cubicBezier } from 'framer-motion';
import { ShoppingCart, Phone } from 'lucide-react';
import { strapiMediaUrl } from '@/lib/strapi';
import type { NavLink, StrapiMedia } from '@/lib/types';
import MenuToggleButton from '@/app/components/MenuToggleButton';

interface HeaderProps {
  siteName: string;
  logo?: StrapiMedia | null;
  navEmail?: string | null;
  navLinks?: NavLink[];
  cartCount?: number;
}

export default function Header({ siteName, logo, navEmail, navLinks = [], cartCount = 0 }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);

  const audioBarVariants = {
    playing: (i: number) => ({
      height: [6, 20, 6],
      transition: {
        duration: [1.2, 0.8, 1.1, 0.9][i % 4],
        repeat: Infinity,
        delay: [0, 0.2, 0.4, 0.1][i % 4],
      },
    }),
    idle: {
      height: 6,
      transition: { duration: 0.3 },
    },
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
      <header className="fixed top-0 left-0 right-0 z-50 bg-cream px-4 py-4 sm:px-6 sm:py-5 md:px-8 md:py-6 flex items-center justify-between">
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

          <motion.button
            onClick={() => setIsAudioPlaying(!isAudioPlaying)}
            className="bg-none border-none cursor-pointer sm:hidden flex items-center justify-center h-6 px-1.5 opacity-70 hover:opacity-100 transition-opacity"
            aria-label="Audio"
          >
            <div className="flex items-center gap-0.75 h-4">
              {[0, 1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  className="w-0.5 h-1.5 bg-dark rounded"
                  variants={audioBarVariants}
                  animate={isAudioPlaying ? 'playing' : 'idle'}
                  custom={i}
                />
              ))}
            </div>
          </motion.button>

          <div className="hidden sm:flex items-center gap-3 sm:gap-5 md:gap-8">
            <MenuToggleButton isOpen={isMenuOpen} onToggle={() => setIsMenuOpen(!isMenuOpen)} />

            <motion.button
              onClick={() => setIsAudioPlaying(!isAudioPlaying)}
              className="bg-none border-none cursor-pointer flex items-center justify-center h-6 px-1.5 md:px-2 opacity-70 hover:opacity-100 transition-opacity"
              aria-label="Audio"
            >
              <div className="flex items-center gap-0.75 h-4">
                {[0, 1, 2, 3].map((i) => (
                  <motion.div
                    key={i}
                    className="w-0.5 h-1.5 bg-dark rounded"
                    variants={audioBarVariants}
                    animate={isAudioPlaying ? 'playing' : 'idle'}
                    custom={i}
                  />
                ))}
              </div>
            </motion.button>
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
      </header>

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
