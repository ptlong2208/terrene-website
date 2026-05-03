'use client';

import { useState } from 'react';
import { motion, cubicBezier } from 'framer-motion';

interface MenuToggleButtonProps {
  isOpen: boolean;
  onToggle: () => void;
  compact?: boolean;
}

const FULL_BAR_WIDTH = 32;
const SHORT_BAR_WIDTH = 20;
const COMPACT_FULL_BAR_WIDTH = 24;
const COMPACT_SHORT_BAR_WIDTH = 15;

export default function MenuToggleButton({ isOpen, onToggle, compact = false }: MenuToggleButtonProps) {
  const [isHovered, setIsHovered] = useState(false);
  const fullBarWidth = compact ? COMPACT_FULL_BAR_WIDTH : FULL_BAR_WIDTH;
  const shortBarWidth = compact ? COMPACT_SHORT_BAR_WIDTH : SHORT_BAR_WIDTH;

  const handleToggle = () => {
    setIsHovered(false);
    onToggle();
  };

  return (
    <motion.button
      onClick={handleToggle}
      onPointerDown={() => setIsHovered(false)}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="p-0 bg-none border-none cursor-pointer flex items-center gap-1.5 sm:gap-2.5"
      aria-label="Menu"
    >
      <div className="flex flex-col gap-1.5">
        <motion.span
          className="block h-0.5 bg-dark rounded"
          style={{ transformOrigin: isOpen ? 'center center' : 'left center' }}
          animate={{
            rotate: isOpen ? 45 : 0,
            y: isOpen ? 3.75 : 0,
            width: !isOpen && isHovered ? shortBarWidth : fullBarWidth,
          }}
          transition={{ duration: 0.35, ease: cubicBezier(0.25, 1, 0.5, 1) }}
        />
        <motion.span
          className="block h-0.5 bg-dark rounded"
          style={{ width: fullBarWidth }}
          animate={{
            rotate: isOpen ? -45 : 0,
            y: isOpen ? -3.75 : 0,
          }}
          transition={{ duration: 0.4, ease: cubicBezier(0.25, 1, 0.5, 1) }}
        />
      </div>
      <span className="hidden sm:block text-[11px] font-bold uppercase tracking-[0.1em] text-dark w-11 text-left">
        Menu
      </span>
    </motion.button>
  );
}
