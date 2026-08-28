'use client';

import { Info } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import Card from '@/app/components/ui/Card';
import { FORM_ERROR_CLASS } from '@/app/components/ui/formStyles';
import PrimaryButton from '@/app/components/ui/PrimaryButton';
import SlotText from '@/app/components/ui/SlotText';
import Tooltip from '@/app/components/ui/Tooltip';
import { type CartItem } from '@/app/store/cartStore';
import { computeDiscountAmount, type PromoDiscount } from '@/lib/promoMath';
import { formatPrice } from '@/lib/utils';

export interface AppliedPromo extends PromoDiscount {
  code: string;
  /** Display-only conditions, for explaining the code in the UI — not sent back to the server. */
  minimumOrderAmount: number | null;
  minQuantity: number | null;
}

const PROMO_ERROR_KEYS: Record<string, string> = {
  invalid_code: 'promoErrorInvalidCode',
  expired: 'promoErrorExpired',
  usage_limit_reached: 'promoErrorUsageLimitReached',
  quantity_not_met: 'promoErrorQuantityNotMet',
  minimum_not_met: 'promoErrorMinimumNotMet',
  not_eligible: 'promoErrorNotEligible',
};

interface CheckoutOrderSummaryProps {
  items: CartItem[];
  subtotal: number;
  shippingFee: number | null;
  shippingLoading: boolean;
  email: string;
  appliedPromo: AppliedPromo | null;
  onPromoApplied: (promo: AppliedPromo | null) => void;
}

export default function CheckoutOrderSummary({
  items,
  subtotal,
  shippingFee,
  shippingLoading,
  email,
  appliedPromo,
  onPromoApplied,
}: CheckoutOrderSummaryProps) {
  const t = useTranslations('checkout');
  const tCommon = useTranslations('common');
  const [promoCode, setPromoCode] = useState('');
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoError, setPromoError] = useState<string | null>(null);

  const wardSelected = shippingFee !== null || shippingLoading;
  const discountAmount = appliedPromo ? computeDiscountAmount(appliedPromo, items) : 0;
  const total = subtotal - discountAmount + (shippingFee ?? 0);

  async function handleApplyPromo() {
    const code = promoCode.trim();
    if (!code) return;
    if (!email.trim()) {
      setPromoError(t('promoErrorEmailRequired'));
      return;
    }

    setPromoLoading(true);
    setPromoError(null);
    try {
      const res = await fetch('/api/validate-promo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          email,
          items: items.map((i) => ({
            variantId: i.variantId,
            productId: i.productId,
            quantity: i.quantity,
            price: i.price,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPromoError(t(PROMO_ERROR_KEYS[data.error] ?? 'promoErrorGeneric'));
        return;
      }
      onPromoApplied({
        code: code.toUpperCase(),
        discountType: data.discountType,
        value: data.value,
        maxAmount: data.maxAmount,
        productsSelection: data.productsSelection,
        entitledVariantIds: data.entitledVariantIds,
        entitledProductIds: data.entitledProductIds,
        appliesOnce: data.appliesOnce,
        minimumOrderAmount: data.minimumOrderAmount,
        minQuantity: data.minQuantity,
      });
    } catch {
      setPromoError(t('errorNetwork'));
    } finally {
      setPromoLoading(false);
    }
  }

  function handleRemovePromo() {
    onPromoApplied(null);
    setPromoCode('');
    setPromoError(null);
  }

  /** Plain-language summary of a code's conditions, for the tooltip on the applied-code badge. */
  function describePromo(promo: AppliedPromo): string {
    const parts: string[] = [];
    if (promo.discountType === 'percentage') {
      parts.push(t('promoDescDiscountPercent', { value: promo.value }));
    } else {
      parts.push(
        t(promo.appliesOnce ? 'promoDescDiscountFixed' : 'promoDescDiscountFixedPerUnit', {
          value: formatPrice(promo.value),
        })
      );
    }
    if (promo.maxAmount !== null) {
      parts.push(t('promoDescMaxAmount', { amount: formatPrice(promo.maxAmount) }));
    }
    if (promo.productsSelection !== 'all') {
      parts.push(t('promoDescScoped'));
    }
    if (promo.minimumOrderAmount !== null) {
      parts.push(t('promoDescMinAmount', { amount: formatPrice(promo.minimumOrderAmount) }));
    }
    if (promo.minQuantity !== null) {
      parts.push(t('promoDescMinQuantity', { quantity: promo.minQuantity }));
    }
    const sentence = parts.join(', ');
    return sentence.charAt(0).toUpperCase() + sentence.slice(1) + '.';
  }

  function renderShippingValue() {
    if (shippingLoading)
      return (
        <span className="text-[13px] text-(--green-deep) opacity-40">{t('shippingLoading')}</span>
      );
    if (shippingFee === 0)
      return (
        <span className="text-[13px] font-semibold text-emerald-600">
          {tCommon('shippingFree')}
        </span>
      );
    return (
      <span className="text-[13px] font-semibold text-(--green-deep)">
        {formatPrice(shippingFee ?? 0)}
      </span>
    );
  }

  return (
    <Card className="sticky top-[12vh]">
      <h2 className="mb-6 text-[12px] font-semibold tracking-[0.08em] text-(--green-deep) uppercase opacity-50">
        {t('orderSummary')}
      </h2>

      <ul className="flex flex-col gap-4">
        {items.map((item) => (
          <li key={item.variantId} className="flex items-start justify-between gap-4">
            <div className="flex flex-col gap-0.5">
              <span className="text-[14px] font-semibold text-(--green-deep)">
                {item.productTitle}
              </span>
              <span className="text-[12px] text-(--green-deep) opacity-50">
                {item.variantTitle} × {item.quantity}
              </span>
            </div>
            <span className="shrink-0 text-[14px] font-semibold text-(--green-deep)">
              {formatPrice(item.price * item.quantity)}
            </span>
          </li>
        ))}
      </ul>

      <div className="border-line mt-6 flex flex-col gap-3 border-t pt-5">
        <div className="flex items-center justify-between">
          <span className="text-[13px] text-(--green-deep) opacity-60">{tCommon('subtotal')}</span>
          <span className="text-[13px] font-semibold text-(--green-deep)">
            {formatPrice(subtotal)}
          </span>
        </div>

        {appliedPromo ? (
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="text-[13px] text-(--green-deep) opacity-60">
                {tCommon('discount')}
              </span>
              <span className="text-[13px] font-semibold text-emerald-800">
                -{formatPrice(discountAmount)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <Tooltip content={describePromo(appliedPromo)}>
                <span
                  tabIndex={0}
                  className="flex w-fit cursor-help items-center gap-1 rounded bg-(--green-deep)/8 px-1.5 py-0.5 text-[12px] font-semibold text-(--green-deep) opacity-70 outline-none"
                >
                  {appliedPromo.code}
                  <Info className="h-3 w-3" aria-hidden="true" />
                </span>
              </Tooltip>
              <button
                type="button"
                onClick={handleRemovePromo}
                className="group cursor-pointer border-0 border-b border-(--green-deep) bg-transparent text-[12px] font-semibold text-(--green-deep) opacity-70"
              >
                <SlotText text={t('promoRemove')} />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <input
                type="text"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                placeholder={t('promoCodePlaceholder')}
                className="w-full border border-(--green-deep)/20 bg-transparent px-3 py-2 text-[13px] text-(--green-deep) transition-colors duration-200 outline-none placeholder:text-(--green-deep)/30 focus:border-(--green-deep)/60"
              />
              <PrimaryButton
                onClick={() => void handleApplyPromo()}
                disabled={promoLoading || !promoCode.trim()}
                loading={promoLoading}
                loadingText={t('promoApplying')}
                size="small"
                fullWidth={false}
              >
                {t('promoApply')}
              </PrimaryButton>
            </div>
            {promoError && <p className={FORM_ERROR_CLASS}>{promoError}</p>}
          </div>
        )}

        {wardSelected && (
          <div className="flex items-center justify-between">
            <span className="text-[13px] text-(--green-deep) opacity-60">
              {tCommon('shipping')}
            </span>
            {renderShippingValue()}
          </div>
        )}

        <div className="flex items-center justify-between">
          <span className="text-[13px] font-semibold tracking-[0.04em] text-(--green-deep) uppercase">
            {tCommon('total')}
          </span>
          <span className="font-sans text-[20px] font-extrabold text-(--green-deep)">
            {formatPrice(total)}
          </span>
        </div>
      </div>
    </Card>
  );
}
