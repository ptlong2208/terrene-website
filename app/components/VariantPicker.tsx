'use client';

import { sendGAEvent } from '@next/third-parties/google';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import PrimaryButton from '@/app/components/ui/PrimaryButton';
import { useCartStore } from '@/app/store/cartStore';
import type { ProductVariant } from '@/lib/haravan';
import { formatPrice } from '@/lib/utils';

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
      productId: selected.product_id,
      variantId: selected.id,
      variantTitle: selected.title,
      price: selected.price,
      inventoryQuantity: stockLeft,
      weightGrams: selected.grams,
    });
    sendGAEvent('event', 'add_to_cart', {
      currency: 'VND',
      value: selected.price,
      items: [
        {
          item_id: String(selected.id),
          item_name: productTitle,
          item_variant: selected.title,
          price: selected.price,
          quantity: 1,
        },
      ],
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
        <PrimaryButton href="/">{t('contactUs')}</PrimaryButton>
      ) : (
        <PrimaryButton type="button" onClick={handleAddToCart} disabled={!isAvailable || atLimit}>
          {t('addToCart')}
        </PrimaryButton>
      )}
    </>
  );
}
