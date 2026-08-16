import { z } from 'zod';

import { personEmailSchema, personNameSchema } from '@/lib/validation';

export const SLUG_PATTERN = /^[a-z0-9-]+$/;

export enum CheckoutErrorCode {
  ServerError = 'server_error',
  Forbidden = 'forbidden',
  OutOfStock = 'out_of_stock',
  NotFound = 'not_found',
  ZeroTotal = 'zero_total',
  PaymentUnavailable = 'payment_unavailable',
  ShippingFeeChanged = 'shipping_fee_changed',
  OrderTooHeavy = 'order_too_heavy',
  PriceChanged = 'price_changed',
}

export const checkoutCustomerSchema = z.object({
  name: personNameSchema,
  phone: z.string().regex(/^(0|\+84)\d{9}$/),
  email: personEmailSchema,
  district: z.string().min(1).max(100),
  districtId: z.number().int().positive(),
  ward: z.string().min(1).max(100),
  wardCode: z.string().regex(/^\d{1,20}$/),
  street: z.string().min(5).max(200),
  note: z.string().max(500).optional(),
});

export type CheckoutCustomer = z.infer<typeof checkoutCustomerSchema>;
