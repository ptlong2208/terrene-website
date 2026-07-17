'use client';

import clsx from 'clsx';
import styles from './MusicConsentBanner.module.css';

interface MusicConsentBannerProps {
  show: boolean;
  dialogLabel: string;
  text: string;
  acceptLabel: string;
  declineLabel: string;
  onAccept: () => void;
  onDecline: () => void;
}

export default function MusicConsentBanner({
  show,
  dialogLabel,
  text,
  acceptLabel,
  declineLabel,
  onAccept,
  onDecline,
}: MusicConsentBannerProps) {
  return (
    <div
      className={clsx(styles.banner, show && styles.visible)}
      role="dialog"
      aria-label={dialogLabel}
      inert={!show || undefined}
    >
      <p className={styles.text}>{text}</p>
      <div className={styles.actions}>
        <button type="button" className={clsx(styles.btn, styles.primary)} onClick={onAccept}>
          {acceptLabel}
        </button>
        <button type="button" className={styles.btn} onClick={onDecline}>
          {declineLabel}
        </button>
      </div>
    </div>
  );
}
