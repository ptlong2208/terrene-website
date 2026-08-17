'use client';

import { useLocale, useTranslations } from 'next-intl';

import Card from '@/app/components/ui/Card';
import SlotText from '@/app/components/ui/SlotText';
import { formatPrice } from '@/lib/utils';

export type Stage =
  | 'awaiting_payment'
  | 'preparing'
  | 'handed_to_carrier'
  | 'picked_up'
  | 'in_transit'
  | 'delivered'
  | 'delivery_failed'
  | 'cancelled';

export interface TrackedOrder {
  orderName: string;
  stage: Stage;
  createdAt: string;
  items: Array<{ title: string; variantTitle: string | null; price: number; quantity: number }>;
  subtotal: number;
  shippingFee: number;
  total: number;
  trackingNumber: string | null;
}

// Happy-path steps shown as a stepper. Exception states (awaiting_payment, delivery_failed,
// cancelled) render as a single status line instead — they aren't a point on this line.
const HAPPY_PATH: Stage[] = [
  'preparing',
  'handed_to_carrier',
  'picked_up',
  'in_transit',
  'delivered',
];
const EXCEPTION_STAGES: Stage[] = ['awaiting_payment', 'delivery_failed', 'cancelled'];

interface OrderStatusCardProps {
  order: TrackedOrder;
  onReset: () => void;
}

export default function OrderStatusCard({ order, onReset }: OrderStatusCardProps) {
  const t = useTranslations('trackOrder');
  const locale = useLocale();

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <p className="mb-1 text-[12px] font-semibold tracking-[0.06em] text-(--green-deep) uppercase opacity-50">
          {t('orderCodeLabel')}
        </p>
        <p className="mb-4 text-[15px] font-semibold text-(--green-deep)">{order.orderName}</p>

        {EXCEPTION_STAGES.includes(order.stage) ? (
          <p
            className={`text-[14px] font-semibold ${order.stage === 'delivery_failed' ? 'text-red-600' : 'text-(--green-deep)'}`}
          >
            {t(`stage.${order.stage}`)}
          </p>
        ) : (
          <ol className="flex flex-col">
            {HAPPY_PATH.map((step, i) => {
              const currentIdx = HAPPY_PATH.indexOf(order.stage);
              const done = i <= currentIdx;
              const isLast = i === HAPPY_PATH.length - 1;
              return (
                <li key={step} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <span
                      className={`mt-1.5 size-2 shrink-0 rounded-full ${done ? 'bg-(--green-deep)' : 'bg-(--green-deep)/15'}`}
                    />
                    {!isLast && (
                      <span
                        className={`-mb-1.5 w-px flex-1 ${i < currentIdx ? 'bg-(--green-deep)' : 'bg-(--green-deep)/15'}`}
                      />
                    )}
                  </div>
                  <span
                    className={`text-[13px] ${!isLast ? 'pb-3' : ''} ${done ? 'font-semibold text-(--green-deep)' : 'text-(--green-deep)/40'}`}
                  >
                    {t(`stage.${step}`)}
                  </span>
                </li>
              );
            })}
          </ol>
        )}

        <div className="border-line mt-5 flex flex-col gap-1 border-t pt-4 text-[12px] text-(--green-deep) opacity-60">
          <span>
            {t('createdAt')}: {new Date(order.createdAt).toLocaleDateString(locale)}
          </span>
          {order.trackingNumber && (
            <span>
              {t('trackingNumber')}: {order.trackingNumber}
            </span>
          )}
        </div>

        <ul className="border-line mt-5 flex flex-col gap-3 border-t pt-5">
          {order.items.map((item, i) => (
            <li key={i} className="flex items-start justify-between gap-4">
              <div className="flex flex-col gap-0.5">
                <span className="text-[13px] font-semibold text-(--green-deep)">{item.title}</span>
                {item.variantTitle && (
                  <span className="text-[11px] text-(--green-deep) opacity-50">
                    {item.variantTitle} × {item.quantity}
                  </span>
                )}
              </div>
              <span className="shrink-0 text-[13px] font-semibold text-(--green-deep)">
                {formatPrice(item.price * item.quantity)}
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-5 flex items-center justify-between border-t border-(--green-deep)/10 pt-4">
          <span className="text-[13px] text-(--green-deep) opacity-60">{t('shipping')}</span>
          <span className="text-[13px] font-semibold text-(--green-deep)">
            {order.shippingFee === 0 ? t('shippingFree') : formatPrice(order.shippingFee)}
          </span>
        </div>

        <div className="mt-2 flex items-center justify-between">
          <span className="text-[12px] font-semibold tracking-[0.04em] text-(--green-deep) uppercase">
            {t('total')}
          </span>
          <span className="text-[18px] font-extrabold text-(--green-deep)">
            {formatPrice(order.total)}
          </span>
        </div>
      </Card>

      <button
        type="button"
        onClick={onReset}
        className="group cursor-pointer self-center border-b border-(--green-deep) text-[13px] font-semibold text-(--green-deep)"
      >
        <SlotText text={t('searchAgain')} />
      </button>
    </div>
  );
}
