'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { formatPrice } from '@/lib/utils';
import { useCartStore } from '@/app/store/cartStore';
import type { ProductVariant } from '@/lib/haravan';

interface VariantPickerProps {
  variants: ProductVariant[];
  optionName: string | null;
  productSlug: string;
  productTitle: string;
}

export default function VariantPicker({
  variants,
  optionName,
  productSlug,
  productTitle,
}: VariantPickerProps) {
  const t = useTranslations('shop');
  const { items, addItem } = useCartStore();
  const [selectedId, setSelectedId] = useState<number | null>(variants[0]?.id ?? null);
  const [limitReached, setLimitReached] = useState(false);

  const selected = variants.find((v) => v.id === selectedId) ?? variants[0];
  const hasOptions = variants.length > 1;
  const price = selected?.price ?? 0;
  const compareAtPrice = selected?.compare_at_price ?? null;
  const isAvailable = selected?.available ?? false;

  const isTracked = selected?.inventory_management === 'haravan';
  const stockLeft = isTracked ? (selected?.inventory_quantity ?? 0) : null;
  const cartQty = items.find((i) => i.variantId === selected?.id)?.quantity ?? 0;
  const atLimit = stockLeft !== null && cartQty >= stockLeft;

  const handleAddToCart = () => {
    if (!selected || !isAvailable) return;
    if (atLimit) {
      setLimitReached(true);
      setTimeout(() => setLimitReached(false), 2500);
      return;
    }
    addItem({
      productSlug,
      productTitle,
      variantId: selected.id,
      variantTitle: selected.title,
      price: selected.price,
      inventoryQuantity: stockLeft,
    });
  };

  return (
    <>
      <p className="mb-4 flex items-baseline gap-2.5">
        {price === 0 ? (
          <span className="text-[20px] font-extrabold text-(--green-deep)">{t('contactUs')}</span>
        ) : (
          <>
            <span className="text-[20px] font-extrabold text-(--green-deep)">
              {formatPrice(price)}
            </span>
            {compareAtPrice && compareAtPrice > price && (
              <span className="text-ink-faint text-[14px] line-through">
                {formatPrice(compareAtPrice)}
              </span>
            )}
          </>
        )}
      </p>

      {hasOptions && (
        <div className="border-line border-t py-3.5">
          {optionName && (
            <p className="text-ink-soft mb-3 text-[11px] font-bold tracking-widest uppercase">
              {optionName}
            </p>
          )}
          <div className="flex flex-wrap gap-2">
            {variants.map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => {
                  setSelectedId(v.id);
                  setLimitReached(false);
                }}
                disabled={!v.available}
                className={`cursor-pointer rounded-full border px-4 py-2 text-[13px] font-semibold transition-colors ${
                  v.id === selectedId
                    ? 'text-cream border-(--green-deep) bg-(--green-deep)'
                    : 'border-(--green-deep)/40 bg-transparent text-(--green-deep) hover:border-(--green-deep)'
                } ${!v.available ? 'cursor-not-allowed opacity-35' : ''}`}
              >
                {v.title}
              </button>
            ))}
          </div>
        </div>
      )}

      {isTracked && stockLeft !== null && stockLeft <= 10 && (
        <p className="mb-3 text-[12px] font-medium text-amber-700">
          {t('stockRemaining', { count: stockLeft })}
        </p>
      )}

      <p className="text-ink-soft mb-4 text-[13px]">{t('shippingNote')}</p>

      {limitReached && (
        <p className="mb-2 text-center text-[12px] text-amber-700">{t('cartLimit')}</p>
      )}

      {price === 0 ? (
        <Link
          href="/"
          className="text-cream flex w-full shrink-0 cursor-pointer items-center justify-center bg-(--green-deep) py-3.75 text-[13px] font-bold tracking-[0.12em] uppercase transition-opacity hover:opacity-85"
        >
          {t('contactUs')}
        </Link>
      ) : (
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={!isAvailable || atLimit}
          className={`text-cream w-full shrink-0 bg-(--green-deep) py-3.75 text-[13px] font-bold tracking-[0.12em] uppercase transition-opacity ${
            !isAvailable || atLimit
              ? 'cursor-not-allowed opacity-40'
              : 'cursor-pointer hover:opacity-85'
          }`}
        >
          {t('addToCart')}
        </button>
      )}
    </>
  );
}
