'use client';

import { createPortal } from 'react-dom';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useCartStore } from '@/app/store/cartStore';
import { formatPrice } from '@/lib/utils';
import SlotText from '@/app/components/SlotText';

export default function CartDrawer() {
  const { items, isOpen, close, updateQty } = useCartStore();
  const t = useTranslations('cart');
  const tCommon = useTranslations('common');

  const count = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <>
      <div
        className={`fixed inset-0 z-1150 bg-[color-mix(in_srgb,var(--green-deep)_55%,transparent)] transition-[opacity,visibility] duration-400 ease-[ease] ${
          isOpen ? 'opacity-100 visible' : 'opacity-0 invisible [transition:opacity_0.4s_ease,visibility_0s_linear_0.4s]'
        }`}
        onClick={close}
        aria-hidden="true"
      />

      <aside
        className={`fixed top-0 right-0 z-1160 flex flex-col w-[min(420px,100vw)] h-full bg-cream shadow-[-24px_0_70px_color-mix(in_srgb,var(--green-deep)_20%,transparent)] transition-transform duration-500 ease-[cubic-bezier(0.77,0,0.175,1)] ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label={t('title')}
        aria-hidden={!isOpen}
      >
        <div className="flex items-center justify-between px-gutter py-5 border-b border-line shrink-0">
          <span className="text-[16px] tracking-[0.02em] lowercase text-(--green-deep)">
            {t('title')}{' '}[{count}]
          </span>
          <button
            type="button"
            onClick={close}
            className="group bg-transparent border-0 p-0 cursor-pointer text-[11px] font-medium tracking-[0.12em] uppercase text-ink-soft leading-none"
            aria-label={tCommon('close')}
          >
            <SlotText text={tCommon('close')} />
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto px-gutter py-2">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center gap-4.5 text-center text-ink-soft text-[14px] py-10">
              <p>{t('empty')}</p>
              <Link
                href="/shop"
                onClick={close}
                className="text-[11px] font-semibold tracking-[0.12em] uppercase text-(--green-deep) border-b border-current pb-0.75 no-underline"
              >
                {t('continueShopping')}
              </Link>
            </div>
          ) : (
            <ul className="list-none p-0 m-0 divide-y divide-line">
              {items.map((item) => (
                <li key={item.variantId} className="flex items-start justify-between gap-3.5 py-4.5">
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] text-(--green-deep) font-medium mb-1 truncate">
                      {item.productTitle}
                    </p>
                    <p className="text-[12px] text-ink-soft">
                      {item.variantTitle !== 'Default Title' ? item.variantTitle : formatPrice(item.price)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 border border-line rounded-full px-3 py-1.25 shrink-0">
                    <button
                      type="button"
                      onClick={() => updateQty(item.variantId, item.quantity - 1)}
                      className="text-[15px] leading-none w-3.5 text-center bg-transparent border-0 cursor-pointer text-ink hover:text-(--green-deep) transition-colors"
                      aria-label="Giảm số lượng"
                    >
                      −
                    </button>
                    <span className="text-[13px] min-w-3.5 text-center tabular-nums">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQty(item.variantId, item.quantity + 1)}
                      className="text-[15px] leading-none w-3.5 text-center bg-transparent border-0 cursor-pointer text-ink hover:text-(--green-deep) transition-colors"
                      aria-label="Tăng số lượng"
                    >
                      +
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-line px-gutter pt-5 pb-[calc(20px+env(safe-area-inset-bottom))] shrink-0">
            <div className="flex justify-between items-baseline mb-4 text-[13px] text-ink">
              <span>{t('subtotal')}</span>
              <span className="font-extrabold text-[18px] text-(--green-deep) font-sans">
                {formatPrice(subtotal)}
              </span>
            </div>
            <Link
              href="/"
              className="block w-full text-center py-4 bg-(--green-deep) text-cream text-[12px] font-semibold tracking-[0.12em] uppercase hover:opacity-85 transition-opacity no-underline"
            >
              {t('checkout')}
            </Link>
          </div>
        )}
      </aside>
    </>,
    document.body
  );
}
