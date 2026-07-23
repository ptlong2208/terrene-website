'use client';

import { sendGAEvent } from '@next/third-parties/google';
import { useEffect } from 'react';

export default function PurchaseTracker() {
  useEffect(() => {
    const raw = localStorage.getItem('pending_purchase');
    if (!raw) return;
    localStorage.removeItem('pending_purchase');
    try {
      const { transactionId, value, items } = JSON.parse(raw);
      sendGAEvent('event', 'purchase', {
        transaction_id: transactionId,
        currency: 'VND',
        value,
        items,
      });
    } catch {
      // malformed data — nothing to track
    }
  }, []);

  return null;
}
