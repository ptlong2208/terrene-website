'use client';

import * as Form from '@radix-ui/react-form';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { FIELD_CLASS, FORM_ERROR_CLASS, LABEL_CLASS } from '@/app/components/ui/formStyles';
import PrimaryButton from '@/app/components/ui/PrimaryButton';
import { trackOrderSchema } from '@/lib/orderTracking';

import OrderStatusCard, { type TrackedOrder } from './OrderStatusCard';

export default function TrackOrderForm() {
  const t = useTranslations('trackOrder');
  const tCommon = useTranslations('common');
  const [orderCode, setOrderCode] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ orderCode?: string; phone?: string }>({});
  const [order, setOrder] = useState<TrackedOrder | null>(null);

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    setError(null);

    const result = trackOrderSchema.safeParse({ orderCode, phone });
    if (!result.success) {
      const errors: { orderCode?: string; phone?: string } = {};
      for (const issue of result.error.issues) {
        if (issue.path[0] === 'orderCode') errors.orderCode = t('errorOrderCodeRequired');
        else if (issue.path[0] === 'phone') errors.phone = t('errorPhoneInvalid');
      }
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});

    setLoading(true);
    try {
      const res = await fetch('/api/orders/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderCode, phone }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 404) setError(t('errorNotFound'));
        else if (res.status === 429) setError(t('errorRateLimited'));
        else setError(t('errorGeneric'));
        return;
      }
      setOrder(data as TrackedOrder);
    } catch {
      setError(t('errorGeneric'));
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setOrder(null);
    setError(null);
    setFieldErrors({});
    setOrderCode('');
    setPhone('');
  }

  if (order) return <OrderStatusCard order={order} onReset={reset} />;

  return (
    <Form.Root onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Form.Field
        name="orderCode"
        serverInvalid={!!fieldErrors.orderCode}
        className="flex flex-col gap-1.5"
      >
        <Form.Label className={LABEL_CLASS}>{t('orderCode')}</Form.Label>
        <Form.Control asChild>
          <input
            type="text"
            placeholder={t('orderCodePlaceholder')}
            value={orderCode}
            onChange={(e) => {
              setOrderCode(e.target.value);
              setFieldErrors((prev) => ({ ...prev, orderCode: undefined }));
            }}
            className={FIELD_CLASS}
          />
        </Form.Control>
        {fieldErrors.orderCode && (
          <Form.Message className="text-[12px] text-red-500">{fieldErrors.orderCode}</Form.Message>
        )}
      </Form.Field>

      <Form.Field
        name="phone"
        serverInvalid={!!fieldErrors.phone}
        className="flex flex-col gap-1.5"
      >
        <Form.Label className={LABEL_CLASS}>{tCommon('phone')}</Form.Label>
        <Form.Control asChild>
          <input
            type="tel"
            placeholder={tCommon('phonePlaceholder')}
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value);
              setFieldErrors((prev) => ({ ...prev, phone: undefined }));
            }}
            className={FIELD_CLASS}
          />
        </Form.Control>
        {fieldErrors.phone && (
          <Form.Message className="text-[12px] text-red-500">{fieldErrors.phone}</Form.Message>
        )}
      </Form.Field>

      {error && <p className={FORM_ERROR_CLASS}>{error}</p>}

      <Form.Submit asChild>
        <PrimaryButton
          disabled={loading}
          loading={loading}
          loadingText={t('submit')}
          className="mt-2"
        >
          {t('submit')}
        </PrimaryButton>
      </Form.Submit>
    </Form.Root>
  );
}
