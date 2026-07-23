'use client';

import { GoogleAnalytics } from '@next/third-parties/google';
import clsx from 'clsx';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useState, useSyncExternalStore } from 'react';

import styles from './CookieConsent.module.css';

const STORAGE_KEY = 'cookie_consent';

type Consent = 'accepted' | 'declined' | 'pending';

function getSnapshot(): Consent {
  return (localStorage.getItem(STORAGE_KEY) as Consent | null) ?? 'pending';
}
function getServerSnapshot(): Consent {
  return 'pending';
}

// Module-level flag so components mounting after the event still show immediately.
let musicConsentDone = false;

export default function CookieConsent({ gaId }: { gaId: string }) {
  const t = useTranslations('cookies');
  const [visible, setVisible] = useState(() => musicConsentDone);

  const consent = useSyncExternalStore(
    useCallback((cb) => {
      window.addEventListener('storage', cb);
      return () => window.removeEventListener('storage', cb);
    }, []),
    getSnapshot,
    getServerSnapshot
  );

  useEffect(() => {
    if (consent !== 'pending' || musicConsentDone) return;
    const handler = () => {
      musicConsentDone = true;
      setVisible(true);
    };
    window.addEventListener('music-consent:done', handler);
    return () => window.removeEventListener('music-consent:done', handler);
  }, [consent]);

  const accept = () => {
    localStorage.setItem(STORAGE_KEY, 'accepted');
    window.dispatchEvent(new Event('storage'));
  };

  const decline = () => {
    localStorage.setItem(STORAGE_KEY, 'declined');
    window.dispatchEvent(new Event('storage'));
  };

  return (
    <>
      {consent === 'accepted' && <GoogleAnalytics gaId={gaId} />}

      <div
        className={clsx(styles.banner, visible && consent === 'pending' && styles.visible)}
        role="dialog"
        aria-label={t('message')}
        inert={!(visible && consent === 'pending') || undefined}
      >
        <p className={styles.text}>{t('message')}</p>
        <div className={styles.actions}>
          <button type="button" className={clsx(styles.btn, styles.primary)} onClick={accept}>
            {t('accept')}
          </button>
          <button type="button" className={styles.btn} onClick={decline}>
            {t('decline')}
          </button>
        </div>
      </div>
    </>
  );
}
