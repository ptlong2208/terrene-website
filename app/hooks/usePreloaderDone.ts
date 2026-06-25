'use client';

import { useEffect, useState } from 'react';

// Module-level flag — shared across all instances so components that mount
// after the event still get `true` immediately without re-listening.
let isDone = false;

export function usePreloaderDone(): boolean {
  const [done, setDone] = useState(isDone);

  useEffect(() => {
    if (isDone) return;
    const handler = () => {
      isDone = true;
      setDone(true);
    };
    window.addEventListener('preloader:complete', handler, { once: true });
    return () => window.removeEventListener('preloader:complete', handler);
  }, []);

  return done;
}
