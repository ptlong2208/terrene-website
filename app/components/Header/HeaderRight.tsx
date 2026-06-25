'use client';

import Link from 'next/link';
import { ShoppingBag, Store } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { NavLink } from '@/lib/types';
import SlotText from '@/app/components/SlotText';

interface HeaderRightProps {
  navShopLink?: NavLink;
  navCartLabel?: string;
  cartCount?: number;
}

export default function HeaderRight({
  navShopLink,
  navCartLabel,
  cartCount = 0,
}: HeaderRightProps) {
  const t = useTranslations('nav');
  const cartText = `${navCartLabel} [${cartCount}]`;

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
        className="group inline-flex items-center whitespace-nowrap tabular-nums text-[18px] md:text-base font-normal leading-none bg-transparent border-0 cursor-pointer p-0 text-inherit transition-transform duration-120 ease-out active:scale-[0.92]"
        aria-label={cartText}
      >
        <span className="hidden md:block">
          <SlotText text={cartText} />
        </span>
        <ShoppingBag size={24} strokeWidth={1.5} className="md:hidden" />
      </button>
    </nav>
  );
}
