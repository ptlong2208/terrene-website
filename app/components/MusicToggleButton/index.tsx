'use client';

import clsx from 'clsx';
import { useTranslations } from 'next-intl';

import styles from './MusicToggleButton.module.css';

interface MusicToggleButtonProps {
  isPlaying: boolean;
  onToggle: () => void;
}

export default function MusicToggleButton({ isPlaying, onToggle }: MusicToggleButtonProps) {
  const t = useTranslations('audio');
  return (
    <button
      type="button"
      onClick={onToggle}
      className={clsx(styles.button, isPlaying && styles.isPlaying)}
      aria-label={isPlaying ? t('pause') : t('play')}
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
