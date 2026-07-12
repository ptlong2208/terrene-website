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

export default function VariantPicker({ variants, optionName, productSlug, productTitle }: VariantPickerProps) {
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
      <p className="flex items-baseline gap-2.5 mb-4">
        {price === 0 ? (
          <span className="text-[20px] font-extrabold text-(--green-deep)">
            {t('contactUs')}
          </span>
        ) : (
          <>
            <span className="text-[20px] font-extrabold text-(--green-deep)">
              {formatPrice(price)}
            </span>
            {compareAtPrice && compareAtPrice > price && (
              <span className="text-[14px] text-ink-faint line-through">
                {formatPrice(compareAtPrice)}
              </span>
            )}
          </>
        )}
      </p>

      {hasOptions && (
        <div className="py-3.5 border-t border-line">
          {optionName && (
            <p className="text-[11px] font-bold tracking-widest uppercase text-ink-soft mb-3">
              {optionName}
            </p>
          )}
          <div className="flex flex-wrap gap-2">
            {variants.map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => { setSelectedId(v.id); setLimitReached(false); }}
                disabled={!v.available}
                className={`px-4 py-2 rounded-full text-[13px] font-semibold border transition-colors cursor-pointer ${
                  v.id === selectedId
                    ? 'bg-(--green-deep) text-cream border-(--green-deep)'
                    : 'bg-transparent text-(--green-deep) border-(--green-deep)/40 hover:border-(--green-deep)'
                } ${!v.available ? 'opacity-35 cursor-not-allowed' : ''}`}
              >
                {v.title}
              </button>
            ))}
          </div>
        </div>
      )}

      {isTracked && stockLeft !== null && stockLeft <= 10 && (
        <p className='text-[12px] mb-3 font-medium text-amber-700'>
          {t('stockRemaining', { count: stockLeft })}
        </p>
      )}

      <p className="text-[13px] text-ink-soft mb-4">{t('shippingNote')}</p>

      {limitReached && (
        <p className="text-[12px] text-amber-700 mb-2 text-center">{t('cartLimit')}</p>
      )}

      {price === 0 ? (
        <Link
          href="/"
          className="w-full py-3.75 bg-(--green-deep) text-cream text-[13px] font-bold tracking-[0.12em] uppercase shrink-0 cursor-pointer flex items-center justify-center hover:opacity-85 transition-opacity"
        >
          {t('contactUs')}
        </Link>
      ) : (
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={!isAvailable || atLimit}
          className={`w-full py-3.75 bg-(--green-deep) text-cream text-[13px] font-bold tracking-[0.12em] uppercase shrink-0 transition-opacity ${
            !isAvailable || atLimit ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer hover:opacity-85'
          }`}
        >
          {t('addToCart')}
        </button>
      )}
    </>
  );
}
