import { useTranslations } from 'next-intl';

import { type CartItem } from '@/app/store/cartStore';
import { formatPrice } from '@/lib/utils';

interface CheckoutOrderSummaryProps {
  items: CartItem[];
  total: number;
}

export default function CheckoutOrderSummary({ items, total }: CheckoutOrderSummaryProps) {
  const t = useTranslations('checkout');

  return (
    <div>
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
      <div className="border-line mt-6 flex items-center justify-between border-t pt-6">
        <span className="text-[13px] font-semibold tracking-[0.04em] text-(--green-deep) uppercase">
          {t('total')}
        </span>
        <span className="font-sans text-[20px] font-extrabold text-(--green-deep)">
          {formatPrice(total)}
        </span>
      </div>
    </div>
  );
}
