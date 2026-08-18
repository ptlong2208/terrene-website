'use client';

import { useTranslations } from 'next-intl';

import Card from '@/app/components/ui/Card';
import { type CartItem } from '@/app/store/cartStore';
import { formatPrice } from '@/lib/utils';

interface CheckoutOrderSummaryProps {
  items: CartItem[];
  subtotal: number;
  shippingFee: number | null;
  shippingLoading: boolean;
}

export default function CheckoutOrderSummary({
  items,
  subtotal,
  shippingFee,
  shippingLoading,
}: CheckoutOrderSummaryProps) {
  const t = useTranslations('checkout');

  const wardSelected = shippingFee !== null || shippingLoading;
  const total = subtotal + (shippingFee ?? 0);

  function renderShippingValue() {
    if (shippingLoading)
      return (
        <span className="text-[13px] text-(--green-deep) opacity-40">{t('shippingLoading')}</span>
      );
    if (shippingFee === 0)
      return (
        <span className="text-[13px] font-semibold text-emerald-600">{t('shippingFree')}</span>
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
          <span className="text-[13px] text-(--green-deep) opacity-60">{t('subtotal')}</span>
          <span className="text-[13px] font-semibold text-(--green-deep)">
            {formatPrice(subtotal)}
          </span>
        </div>

        {wardSelected && (
          <div className="flex items-center justify-between">
            <span className="text-[13px] text-(--green-deep) opacity-60">{t('shipping')}</span>
            {renderShippingValue()}
          </div>
        )}

        <div className="flex items-center justify-between">
          <span className="text-[13px] font-semibold tracking-[0.04em] text-(--green-deep) uppercase">
            {t('total')}
          </span>
          <span className="font-sans text-[20px] font-extrabold text-(--green-deep)">
            {formatPrice(total)}
          </span>
        </div>
      </div>
    </Card>
  );
}
