'use client';

import { motion } from 'framer-motion';

interface MusicToggleButtonProps {
  isPlaying: boolean;
  onToggle: () => void;
  disabled?: boolean;
  className?: string;
}

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

export default function MusicToggleButton({
  isPlaying,
  onToggle,
  disabled = false,
  className = '',
}: MusicToggleButtonProps) {
  return (
    <motion.button
      onClick={onToggle}
      disabled={disabled}
      className={`bg-none border-none flex items-center justify-center h-6 px-1.5 opacity-70 hover:opacity-100 transition-opacity disabled:cursor-not-allowed disabled:opacity-35 cursor-pointer ${className}`}
      aria-label="Audio"
    >
      <div className="flex items-center gap-0.75 h-4">
        {[0, 1, 2, 3].map((i) => (
          <motion.div
            key={i}
            className="w-0.5 h-1.5 bg-dark rounded"
            variants={audioBarVariants}
            animate={isPlaying ? 'playing' : 'idle'}
            custom={i}
          />
        ))}
      </div>
    </motion.button>
  );
}
