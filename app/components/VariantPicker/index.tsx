'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { formatPrice } from '@/lib/utils';
import type { ProductVariant } from '@/lib/haravan';

interface VariantPickerProps {
  variants: ProductVariant[];
  optionName: string | null;
  fallbackPrice?: number;
}

export default function VariantPicker({ variants, optionName, fallbackPrice }: VariantPickerProps) {
  const t = useTranslations('shop');
  const [selectedId, setSelectedId] = useState<number | null>(variants[0]?.id ?? null);

  const selected = variants.find((v) => v.id === selectedId) ?? variants[0];
  const hasVariants = variants.length > 0;
  const hasOptions = variants.length > 1;
  const price = hasVariants ? (selected?.price ?? 0) : (fallbackPrice ?? 0);
  const compareAtPrice = hasVariants ? (selected?.compare_at_price ?? null) : null;
  const isAvailable = hasVariants ? (selected?.available ?? false) : false;

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
        <div className="py-3.5 border-t border-line mb-4">
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
                onClick={() => setSelectedId(v.id)}
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

      <p className="text-[13px] text-ink-soft mb-4">{t('shippingNote')}</p>

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
          disabled={!isAvailable}
          className={`w-full py-3.75 bg-(--green-deep) text-cream text-[13px] font-bold tracking-[0.12em] uppercase shrink-0 transition-opacity ${
            !isAvailable ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer hover:opacity-85'
          }`}
        >
          {t('addToCart')}
        </button>
      )}
    </>
  );
}
