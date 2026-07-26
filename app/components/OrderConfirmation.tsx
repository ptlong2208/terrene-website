'use client';

import { useTranslations } from 'next-intl';
import { startTransition, useEffect, useState } from 'react';

import Card from '@/app/components/ui/Card';
import { formatPrice } from '@/lib/utils';

interface OrderItem {
  productTitle: string;
  variantTitle: string;
  price: number;
  quantity: number;
}

interface OrderData {
  orderCode: string;
  total: number;
  items: OrderItem[];
  customer: { name: string; phone: string };
}

export default function OrderConfirmation() {
  const t = useTranslations('checkout');
  const [order, setOrder] = useState<OrderData | null>(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('order_confirmation');
      if (!raw) return;
      sessionStorage.removeItem('order_confirmation');
      const data = JSON.parse(raw) as OrderData;
      startTransition(() => setOrder(data));
    } catch {
      // malformed data
    }
  }, []);

  if (!order) return null;

  return (
    <div className="mx-auto mt-4 w-full max-w-md text-left">
      <Card>
        <p className="mb-1 text-[12px] font-semibold tracking-[0.06em] text-(--green-deep) uppercase opacity-50">
          {t('orderCode')}
        </p>
        <p className="mb-6 text-[15px] font-semibold text-(--green-deep)">{order.orderCode}</p>

        <h2 className="border-line mb-4 border-t pt-4 text-[12px] font-semibold tracking-[0.08em] text-(--green-deep) uppercase opacity-50">
          {t('orderSummary')}
        </h2>

        <ul className="flex flex-col gap-4">
          {order.items.map((item, i) => (
            <li key={i} className="flex items-start justify-between gap-4">
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
            {formatPrice(order.total)}
          </span>
        </div>
      </Card>

      <p className="text-ink-soft mt-4 text-center text-[13px] leading-relaxed">
        {t('successContact', { phone: order.customer.phone })}
      </p>
    </div>
  );
}
