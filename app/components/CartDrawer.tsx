'use client';

import { createPortal } from 'react-dom';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useCartStore } from '@/app/store/cartStore';
import { formatPrice } from '@/lib/utils';
import { useIsMounted } from '@/app/hooks/useIsMounted';
import SlotText from '@/app/components/ui/SlotText';

export default function CartDrawer() {
  const { items, isOpen, close, updateQty } = useCartStore();
  const t = useTranslations('cart');
  const tCommon = useTranslations('common');
  const mounted = useIsMounted();

  const count = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  if (!mounted) return null;

  return createPortal(
    <>
      <div
        className={`fixed inset-0 z-1150 bg-[color-mix(in_srgb,var(--green-deep)_55%,transparent)] transition-[opacity,visibility] duration-400 ease-[ease] ${
          isOpen
            ? 'visible opacity-100'
            : 'invisible opacity-0 [transition:opacity_0.4s_ease,visibility_0s_linear_0.4s]'
        }`}
        onClick={close}
        aria-hidden="true"
      />

      <aside
        className={`bg-cream fixed top-0 right-0 z-1160 flex h-full w-[min(420px,100vw)] flex-col shadow-[-24px_0_70px_color-mix(in_srgb,var(--green-deep)_20%,transparent)] transition-transform duration-500 ease-[cubic-bezier(0.77,0,0.175,1)] ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label={t('title')}
        aria-hidden={!isOpen}
      >
        <div className="px-gutter border-line flex shrink-0 items-center justify-between border-b py-5">
          <span className="text-[16px] tracking-[0.02em] text-(--green-deep) lowercase">
            {t('title')} [{count}]
          </span>
          <button
            type="button"
            onClick={close}
            className="group text-ink-soft cursor-pointer border-0 bg-transparent p-0 text-[11px] leading-none font-medium tracking-[0.12em] uppercase"
            aria-label={tCommon('close')}
          >
            <SlotText text={tCommon('close')} />
          </button>
        </div>

        <div className="px-gutter min-h-0 flex-1 overflow-y-auto py-2">
          {items.length === 0 ? (
            <div className="text-ink-soft flex h-full flex-col items-center justify-center gap-4.5 py-10 text-center text-[14px]">
              <p>{t('empty')}</p>
              <Link
                href="/shop"
                onClick={close}
                className="border-b border-current pb-0.75 text-[11px] font-semibold tracking-[0.12em] text-(--green-deep) uppercase no-underline"
              >
                {t('continueShopping')}
              </Link>
            </div>
          ) : (
            <ul className="divide-line m-0 list-none divide-y p-0">
              {items.map((item) => (
                <li
                  key={item.variantId}
                  className="flex items-start justify-between gap-3.5 py-4.5"
                >
                  <div className="min-w-0 flex-1">
                    <p className="mb-1 truncate text-[14px] font-medium text-(--green-deep)">
                      {item.productTitle}
                    </p>
                    <p className="text-ink-soft text-[12px]">
                      {item.variantTitle !== 'Default Title'
                        ? item.variantTitle
                        : formatPrice(item.price)}
                    </p>
                  </div>
                  <div className="border-line flex shrink-0 items-center gap-3 rounded-full border px-3 py-1.25">
                    <button
                      type="button"
                      onClick={() => updateQty(item.variantId, item.quantity - 1)}
                      className="text-ink w-3.5 cursor-pointer border-0 bg-transparent text-center text-[15px] leading-none transition-colors hover:text-(--green-deep)"
                      aria-label="Giảm số lượng"
                    >
                      −
                    </button>
                    <span className="min-w-3.5 text-center text-[13px] tabular-nums">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQty(item.variantId, item.quantity + 1)}
                      disabled={
                        item.inventoryQuantity !== null && item.quantity >= item.inventoryQuantity
                      }
                      className="text-ink w-3.5 cursor-pointer border-0 bg-transparent text-center text-[15px] leading-none transition-colors hover:text-(--green-deep) disabled:cursor-not-allowed disabled:opacity-30"
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
          <div className="border-line px-gutter shrink-0 border-t pt-5 pb-[calc(20px+env(safe-area-inset-bottom))]">
            <div className="text-ink mb-4 flex items-baseline justify-between text-[13px]">
              <span>{t('subtotal')}</span>
              <span className="font-sans text-[18px] font-extrabold text-(--green-deep)">
                {formatPrice(subtotal)}
              </span>
            </div>
            <Link
              href="/"
              className="text-cream block w-full bg-(--green-deep) py-4 text-center text-[12px] font-semibold tracking-[0.12em] uppercase no-underline transition-opacity hover:opacity-85"
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
