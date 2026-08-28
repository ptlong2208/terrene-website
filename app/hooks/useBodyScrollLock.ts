'use client';

import { useEffect } from 'react';

export function useBodyScrollLock(locked: boolean) {
  useEffect(() => {
    document.body.classList.toggle('is-locked', locked);
    return () => {
      document.body.classList.remove('is-locked');
    };
  }, [locked]);
}
