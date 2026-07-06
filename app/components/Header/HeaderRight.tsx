'use client';

import { useSyncExternalStore } from 'react';
import Link from 'next/link';
import { ShoppingBag, Store } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { NavLink } from '@/lib/types';
import SlotText from '@/app/components/SlotText';
import { useCartStore } from '@/app/store/cartStore';

interface HeaderRightProps {
  navShopLink?: NavLink;
  navCartLabel?: string;
}

export default function HeaderRight({ navShopLink, navCartLabel }: HeaderRightProps) {
  const t = useTranslations('nav');
  const open = useCartStore((s) => s.open);
  const liveCount = useSyncExternalStore(
    useCartStore.subscribe,
    () => useCartStore.getState().count(),
    () => 0,
  );
  const cartText = `${navCartLabel} [${liveCount}]`;

  return (
    <nav
      className="flex items-center gap-5 md:gap-6 justify-end justify-self-end"
      aria-label={t('mainLabel')}
    >
      {navShopLink && (
        <Link
          href={navShopLink.href}
          className="group inline-flex items-center whitespace-nowrap text-[18px] md:text-base font-normal leading-none no-underline text-inherit transition-transform duration-120 ease-out hover:opacity-100! active:scale-[0.92]"
        >
          <span className="hidden md:block">
            <SlotText text={navShopLink.label} />
          </span>
          <Store size={24} strokeWidth={1.5} className="md:hidden" />
        </Link>
      )}
      <button
        type="button"
        onClick={open}
        className="group inline-flex items-center whitespace-nowrap text-[18px] md:text-base font-normal leading-none bg-transparent border-0 cursor-pointer p-0 text-inherit transition-transform duration-120 ease-out active:scale-[0.92]"
        aria-label={cartText}
      >
        <span className="hidden md:block">
          <SlotText text={cartText} />
        </span>
        <span className="md:hidden relative">
          <ShoppingBag size={24} strokeWidth={1.5} />
          {liveCount > 0 && (
            <span className="absolute -top-1.5 -right-2 bg-(--green-deep) text-cream text-[10px] font-bold leading-none w-4 h-4 rounded-full flex items-center justify-center">
              {liveCount}
            </span>
          )}
        </span>
      </button>
    </nav>
  );
}
