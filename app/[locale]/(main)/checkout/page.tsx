'use client';

import { sendGAEvent } from '@next/third-parties/google';
import * as Form from '@radix-ui/react-form';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import CtaLink from '@/app/components/ui/CtaLink';
import Modal from '@/app/components/ui/Modal';
import Section from '@/app/components/ui/Section';
import SlotText from '@/app/components/ui/SlotText';
import WardCombobox from '@/app/components/ui/WardCombobox';
import { useIsMounted } from '@/app/hooks/useIsMounted';
import { useCartStore } from '@/app/store/cartStore';
import { type CheckoutCustomer, checkoutCustomerSchema, CheckoutErrorCode } from '@/lib/checkout';
import { formatPrice } from '@/lib/utils';

import CheckoutOrderSummary from './CheckoutOrderSummary';

type DraftForm = CheckoutCustomer & { paymentMethod: 'payos' | 'cod' };

type FieldErrors = Partial<Record<keyof CheckoutCustomer, string>>;

const FIELD_CLASS =
  'w-full border border-(--green-deep)/20 rounded-lg px-4 py-3 text-[14px] text-(--green-deep) bg-transparent placeholder:text-(--green-deep)/30 outline-none focus:border-(--green-deep)/60 transition-colors duration-200 aria-invalid:border-red-400';

const LABEL_CLASS = 'text-[12px] font-semibold tracking-[0.04em] uppercase text-(--green-deep)';

const EMPTY_FORM: DraftForm = {
  name: '',
  phone: '',
  email: '',
  ward: '',
  street: '',
  paymentMethod: 'payos',
};

const ERROR_KEY_MAP: Partial<Record<CheckoutErrorCode, string>> = {
  [CheckoutErrorCode.OutOfStock]: 'errorOutOfStock',
  [CheckoutErrorCode.NotFound]: 'errorNotFound',
  [CheckoutErrorCode.PaymentUnavailable]: 'errorPaymentUnavailable',
};

export default function CheckoutPage() {
  const t = useTranslations('checkout');
  const mounted = useIsMounted();
  const { items, count } = useCartStore();
  const [form, setForm] = useState<DraftForm>(() => {
    if (typeof window === 'undefined') return EMPTY_FORM;
    try {
      const draft = sessionStorage.getItem('checkout_draft');
      const parsed = draft ? JSON.parse(draft) : null;
      return parsed
        ? {
            ...EMPTY_FORM,
            ...parsed,
            paymentMethod: parsed.paymentMethod === 'cod' ? 'cod' : 'payos',
          }
        : EMPTY_FORM;
    } catch {
      return EMPTY_FORM;
    }
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [showCodConfirm, setShowCodConfirm] = useState(false);
  const [confirmedCustomer, setConfirmedCustomer] = useState<CheckoutCustomer | null>(null);

  useEffect(() => {
    if (items.length === 0) return;
    sendGAEvent('event', 'begin_checkout', {
      currency: 'VND',
      value: items.reduce((sum, i) => sum + i.price * i.quantity, 0),
      items: items.map((i) => ({
        item_id: String(i.variantId),
        item_name: i.productTitle,
        item_variant: i.variantTitle,
        price: i.price,
        quantity: i.quantity,
      })),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    sessionStorage.setItem('checkout_draft', JSON.stringify(form));
  }, [form]);

  if (!mounted) return null;

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  }

  function validateForm(): CheckoutCustomer | null {
    const result = checkoutCustomerSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: FieldErrors = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof CheckoutCustomer;
        if (field === 'name') fieldErrors.name = t('errorNameMin');
        else if (field === 'phone') fieldErrors.phone = t('errorPhoneInvalid');
        else if (field === 'email') fieldErrors.email = t('errorEmailInvalid');
        else if (field === 'ward') fieldErrors.ward = t('errorWardRequired');
        else if (field === 'street') fieldErrors.street = t('errorStreetMin');
      }
      setErrors(fieldErrors);
      return null;
    }
    return result.data;
  }

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    setServerError(null);

    const customer = validateForm();
    if (!customer) return;

    if (form.paymentMethod === 'cod') {
      setConfirmedCustomer(customer);
      setShowCodConfirm(true);
      return;
    }

    await submitOrder(customer);
  }

  async function submitOrder(customer: CheckoutCustomer) {
    setLoading(true);
    try {
      const endpoint = form.paymentMethod === 'cod' ? '/api/checkout/cod' : '/api/checkout/payos';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customer, items }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        const key = ERROR_KEY_MAP[body.error as CheckoutErrorCode] ?? 'errorGeneric';
        setServerError(t(key, { product: body.product ?? '' }));
        setLoading(false);
        return;
      }

      const data = await res.json();
      sessionStorage.setItem('checkout_draft', JSON.stringify(customer));

      if (form.paymentMethod === 'cod') {
        sessionStorage.setItem(
          'order_confirmation',
          JSON.stringify({
            orderCode: data.orderName,
            total: data.total,
            items: data.items,
            customer: { name: customer.name, phone: customer.phone },
          })
        );
        sessionStorage.setItem(
          'pending_purchase',
          JSON.stringify({
            transactionId: data.orderName,
            value: data.total,
            items: items.map((i) => ({
              item_id: String(i.variantId),
              item_name: i.productTitle,
              item_variant: i.variantTitle,
              price: i.price,
              quantity: i.quantity,
            })),
          })
        );
        window.location.replace(`/checkout/success?token=${data.token}`);
      } else {
        sessionStorage.setItem(
          'order_confirmation',
          JSON.stringify({
            orderCode: data.orderName,
            total,
            items: items.map((i) => ({
              productTitle: i.productTitle,
              variantTitle: i.variantTitle,
              price: i.price,
              quantity: i.quantity,
            })),
            customer: { name: customer.name, phone: customer.phone },
          })
        );
        sessionStorage.setItem(
          'pending_purchase',
          JSON.stringify({
            transactionId: data.orderName,
            value: total,
            items: items.map((i) => ({
              item_id: String(i.variantId),
              item_name: i.productTitle,
              item_variant: i.variantTitle,
              price: i.price,
              quantity: i.quantity,
            })),
          })
        );
        window.location.replace(data.paymentUrl);
      }
    } catch {
      setServerError(t('errorNetwork'));
      setLoading(false);
    }
  }

  if (count() === 0) {
    return (
      <Section>
        <div className="flex flex-col items-center gap-4 text-center">
          <p className="text-ink-soft text-[clamp(14px,1.15vw,17px)] leading-normal font-normal">
            {t('emptyCart')}
          </p>
          <CtaLink href="/shop" label={t('backToShop')} />
        </div>
      </Section>
    );
  }

  return (
    <Section>
      <div className="mx-auto w-full max-w-360">
        <Link
          href="/shop"
          className="text-ink-soft group mb-6 inline-flex items-center gap-1.5 text-[13px] no-underline"
        >
          <ChevronLeft
            size={14}
            strokeWidth={2}
            className="transition-transform duration-200 group-hover:-translate-x-0.5"
          />
          <SlotText text={t('backToShop')} />
        </Link>
      </div>
      <div className="mx-auto grid w-full max-w-360 grid-cols-[1fr_0.85fr] items-start gap-[clamp(32px,6vw,96px)] max-md:grid-cols-1">
        {/* Customer form */}
        <Form.Root onSubmit={handleSubmit} className="flex flex-col gap-4">
          <h2 className="mb-2 text-[12px] font-semibold tracking-[0.08em] text-(--green-deep) uppercase opacity-50">
            {t('customerInfo')}
          </h2>

          <Form.Field name="name" serverInvalid={!!errors.name} className="flex flex-col gap-1.5">
            <Form.Label className={LABEL_CLASS}>{t('name')}</Form.Label>
            <Form.Control asChild>
              <input
                type="text"
                autoComplete="name"
                placeholder={t('namePlaceholder')}
                value={form.name}
                onChange={handleChange}
                className={FIELD_CLASS}
              />
            </Form.Control>
            {errors.name && (
              <Form.Message className="text-[12px] text-red-500">{errors.name}</Form.Message>
            )}
          </Form.Field>

          <Form.Field name="phone" serverInvalid={!!errors.phone} className="flex flex-col gap-1.5">
            <Form.Label className={LABEL_CLASS}>{t('phone')}</Form.Label>
            <Form.Control asChild>
              <input
                type="tel"
                autoComplete="tel"
                placeholder={t('phonePlaceholder')}
                value={form.phone}
                onChange={handleChange}
                className={FIELD_CLASS}
              />
            </Form.Control>
            {errors.phone && (
              <Form.Message className="text-[12px] text-red-500">{errors.phone}</Form.Message>
            )}
          </Form.Field>

          <Form.Field name="email" serverInvalid={!!errors.email} className="flex flex-col gap-1.5">
            <Form.Label className={LABEL_CLASS}>{t('email')}</Form.Label>
            <Form.Control asChild>
              <input
                type="email"
                autoComplete="email"
                placeholder={t('emailPlaceholder')}
                value={form.email}
                onChange={handleChange}
                className={FIELD_CLASS}
              />
            </Form.Control>
            {errors.email && (
              <Form.Message className="text-[12px] text-red-500">{errors.email}</Form.Message>
            )}
          </Form.Field>

          <Form.Field name="ward" serverInvalid={!!errors.ward} className="flex flex-col gap-1.5">
            <div className="flex items-baseline justify-between gap-2">
              <Form.Label className={LABEL_CLASS}>{t('ward')}</Form.Label>
              <span className="text-ink-soft text-[11px]">{t('wardNote')}</span>
            </div>
            <WardCombobox
              value={form.ward}
              onChange={(ward) => {
                setForm((prev) => ({ ...prev, ward }));
                setErrors((prev) => ({ ...prev, ward: undefined }));
              }}
              error={errors.ward}
              placeholder={t('wardPlaceholder')}
              emptyText={t('wardEmpty')}
              inputClassName={`${FIELD_CLASS}${errors.ward ? ' aria-invalid' : ''}`}
            />
            {errors.ward && (
              <Form.Message className="text-[12px] text-red-500">{errors.ward}</Form.Message>
            )}
          </Form.Field>

          <Form.Field
            name="street"
            serverInvalid={!!errors.street}
            className="flex flex-col gap-1.5"
          >
            <Form.Label className={LABEL_CLASS}>{t('street')}</Form.Label>
            <Form.Control asChild>
              <input
                type="text"
                autoComplete="street-address"
                placeholder={t('streetPlaceholder')}
                value={form.street}
                onChange={handleChange}
                className={FIELD_CLASS}
              />
            </Form.Control>
            {errors.street && (
              <Form.Message className="text-[12px] text-red-500">{errors.street}</Form.Message>
            )}
          </Form.Field>

          <Form.Field name="note" className="flex flex-col gap-1.5">
            <Form.Label className={LABEL_CLASS}>{t('note')}</Form.Label>
            <Form.Control asChild>
              <textarea
                rows={3}
                placeholder={t('notePlaceholder')}
                value={form.note}
                onChange={handleChange}
                className={`${FIELD_CLASS} resize-none`}
              />
            </Form.Control>
          </Form.Field>

          {/* Payment method */}
          <div className="flex flex-col gap-2">
            <span className={LABEL_CLASS}>{t('paymentMethod')}</span>
            <div className="grid grid-cols-2 gap-2">
              {(
                [
                  { value: 'payos', label: t('paymentOnline'), desc: t('paymentOnlineDesc') },
                  { value: 'cod', label: t('paymentCod'), desc: t('paymentCodDesc') },
                ] as const
              ).map(({ value, label, desc }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, paymentMethod: value }))}
                  className={`flex cursor-pointer flex-col gap-0.5 rounded-lg border px-4 py-3 text-left transition-colors duration-150 ${
                    form.paymentMethod === value
                      ? 'border-(--green-deep) bg-(--green-deep)/5'
                      : 'border-(--green-deep)/20 hover:border-(--green-deep)/40'
                  }`}
                >
                  <span className="text-[13px] font-semibold text-(--green-deep)">{label}</span>
                  <span className="text-[11px] text-(--green-deep) opacity-50">{desc}</span>
                </button>
              ))}
            </div>
          </div>

          {serverError && (
            <p className="rounded-lg bg-red-50 px-4 py-3 text-[13px] text-red-600">{serverError}</p>
          )}

          <Form.Submit
            disabled={loading}
            className="group text-cream mt-2 flex w-full cursor-pointer items-center justify-center overflow-hidden border-0 bg-(--green-deep) py-4 text-[16px] tracking-[-0.02em] transition-opacity hover:opacity-85 disabled:opacity-40"
          >
            {loading ? t('processing') : <SlotText text={t('placeOrder')} />}
          </Form.Submit>
        </Form.Root>

        <CheckoutOrderSummary items={items} total={total} />
      </div>

      {/* COD confirmation dialog */}
      <Modal
        isOpen={showCodConfirm}
        onClose={() => setShowCodConfirm(false)}
        title={t('codConfirmTitle')}
        description={t('codConfirmDesc')}
        primaryText={t('codConfirmAction')}
        secondaryText={t('codConfirmBack')}
        onPrimary={() => {
          setShowCodConfirm(false);
          if (confirmedCustomer) void submitOrder(confirmedCustomer);
        }}
        loading={loading}
      >
        {confirmedCustomer && (
          <div className="mb-5 flex flex-col gap-1 rounded-lg border border-(--green-deep)/15 px-4 py-3 text-[13px] text-(--green-deep)">
            <span className="font-semibold">{confirmedCustomer.name}</span>
            <span className="opacity-60">{confirmedCustomer.phone}</span>
            <span className="opacity-60">
              {confirmedCustomer.street}, {confirmedCustomer.ward}
            </span>
          </div>
        )}

        <p className="mb-3 text-[11px] font-semibold tracking-[0.06em] text-(--green-deep) uppercase opacity-50">
          {t('orderSummary')}
        </p>
        <ul className="mb-4 flex flex-col gap-3">
          {items.map((item) => (
            <li key={item.variantId} className="flex items-start justify-between gap-4">
              <div className="flex flex-col gap-0.5">
                <span className="text-[13px] font-semibold text-(--green-deep)">
                  {item.productTitle}
                </span>
                <span className="text-[11px] text-(--green-deep) opacity-50">
                  {item.variantTitle} × {item.quantity}
                </span>
              </div>
              <span className="shrink-0 text-[13px] font-semibold text-(--green-deep)">
                {formatPrice(item.price * item.quantity)}
              </span>
            </li>
          ))}
        </ul>
        <div className="border-line mb-5 flex items-center justify-between border-t pt-4">
          <span className="text-[12px] font-semibold tracking-[0.04em] text-(--green-deep) uppercase">
            {t('total')}
          </span>
          <span className="text-[18px] font-extrabold text-(--green-deep)">
            {formatPrice(total)}
          </span>
        </div>
      </Modal>
    </Section>
  );
}
