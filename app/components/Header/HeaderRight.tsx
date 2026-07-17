'use client';

import { ShoppingBag, Store } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useSyncExternalStore } from 'react';

import SlotText from '@/app/components/ui/SlotText';
import { useCartStore } from '@/app/store/cartStore';
import type { NavLink } from '@/lib/types';

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
    () => 0
  );
  const cartText = `${navCartLabel} [${liveCount}]`;

  return (
    <nav
      className="flex items-center justify-end gap-5 justify-self-end md:gap-6"
      aria-label={t('mainLabel')}
    >
      {navShopLink && (
        <Link
          href={navShopLink.href}
          className="group inline-flex items-center text-[18px] leading-none font-normal whitespace-nowrap text-inherit no-underline transition-transform duration-120 ease-out hover:opacity-100! active:scale-[0.92] md:text-base"
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
        className="group inline-flex cursor-pointer items-center border-0 bg-transparent p-0 text-[18px] leading-none font-normal whitespace-nowrap text-inherit transition-transform duration-120 ease-out active:scale-[0.92] md:text-base"
        aria-label={cartText}
      >
        <span className="hidden md:block">
          <SlotText text={cartText} />
        </span>
        <span className="relative md:hidden">
          <ShoppingBag size={24} strokeWidth={1.5} />
          {liveCount > 0 && (
            <span className="text-cream absolute -top-1.5 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-(--green-deep) text-[10px] leading-none font-bold">
              {liveCount}
            </span>
          )}
        </span>
      </button>
    </nav>
  );
}
