'use client';

import { useEffect } from 'react';

// Use in layouts/pages that don't render <Preloader> (i.e. outside the (main) route group).
// SmoothScroll stops Lenis on mount and waits for this event before allowing scroll.
export default function PreloaderBridge() {
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('preloader:complete'));
  }, []);
  return null;
}
