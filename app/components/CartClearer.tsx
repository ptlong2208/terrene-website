'use client';

import { useEffect } from 'react';

import { useCartStore } from '@/app/store/cartStore';

export default function CartClearer() {
  useEffect(() => {
    useCartStore.setState({ items: [] });
  }, []);
  return null;
}
