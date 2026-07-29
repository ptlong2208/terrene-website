import { z } from 'zod';

import { HCMC_WARDS } from '@/lib/hcmc-wards';

export const SLUG_PATTERN = /^[a-z0-9-]+$/;

export enum CheckoutErrorCode {
  ServerError = 'server_error',
  Forbidden = 'forbidden',
  OutOfStock = 'out_of_stock',
  NotFound = 'not_found',
  ZeroTotal = 'zero_total',
  PaymentUnavailable = 'payment_unavailable',
}

export const checkoutCustomerSchema = z.object({
  name: z.string().min(2).max(100),
  phone: z.string().regex(/^(0|\+84)\d{8,9}$/),
  email: z.email().max(254),
  ward: z.string().refine((w) => (HCMC_WARDS as readonly string[]).includes(w), 'Invalid ward'),
  street: z.string().min(5).max(200),
  note: z.string().max(500).optional(),
});

export type CheckoutCustomer = z.infer<typeof checkoutCustomerSchema>;
