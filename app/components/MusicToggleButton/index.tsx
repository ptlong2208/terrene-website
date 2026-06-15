'use client';

import clsx from 'clsx';
import styles from './MusicToggleButton.module.css';

interface MusicToggleButtonProps {
  isPlaying: boolean;
  onToggle: () => void;
}

export default function MusicToggleButton({ isPlaying, onToggle }: MusicToggleButtonProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={clsx(styles.button, isPlaying && styles.isPlaying)}
      aria-label={isPlaying ? 'Tắt nhạc' : 'Bật nhạc'}
      aria-pressed={isPlaying}
    >
      <span />
      <span />
      <span />
      <span />
      <span />
    </button>
  );
}
