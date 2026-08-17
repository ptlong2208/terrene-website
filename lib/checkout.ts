import { z } from 'zod';

import { EXPRESS_SUBSIDY_CAP, FREESHIP_THRESHOLD } from '@/lib/config';
import { getShippingFee } from '@/lib/ghtk';
import { isExpressEligible } from '@/lib/oldSaigonWards';
import { personEmailSchema, personNameSchema, vnPhoneSchema } from '@/lib/validation';

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
  ExpressNotAvailable = 'express_not_available',
}

export const checkoutCustomerSchema = z.object({
  name: personNameSchema,
  phone: vnPhoneSchema,
  email: personEmailSchema,
  province: z.string().min(1).max(100),
  ward: z.string().min(1).max(100),
  wardCode: z.string().regex(/^\d{1,20}$/),
  street: z.string().min(5).max(200),
  note: z.string().max(500).optional(),
});

export type CheckoutCustomer = z.infer<typeof checkoutCustomerSchema>;

export const shippingMethodSchema = z.enum(['standard', 'express']);
export type ShippingMethod = z.infer<typeof shippingMethodSchema>;

/**
 * Resolves the shipping fee to actually charge for a given method:
 * - standard: free once subtotal clears FREESHIP_THRESHOLD, otherwise the real GHTK fee
 * - express: the real GHTK fee minus our subsidy (floored at 0); returns null if the
 *   order/address isn't express-eligible (caller should treat that as a validation error)
 */
export async function resolveShippingFee(params: {
  province: string;
  ward: string;
  wardCode: string;
  weightGrams: number;
  subtotal: number;
  method: ShippingMethod;
}): Promise<number | null> {
  const { province, ward, wardCode, weightGrams, subtotal, method } = params;

  if (method === 'express') {
    if (!isExpressEligible(wardCode, subtotal)) return null;
    const realFee = await getShippingFee(province, ward, weightGrams, subtotal);
    return Math.max(0, realFee - EXPRESS_SUBSIDY_CAP);
  }

  if (subtotal >= FREESHIP_THRESHOLD) return 0;
  return getShippingFee(province, ward, weightGrams, subtotal);
}
