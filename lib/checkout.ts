import { z } from 'zod';

export const SLUG_PATTERN = /^[a-z0-9-]+$/;

export const checkoutCustomerSchema = z.object({
  name: z.string().min(2).max(100),
  phone: z.string().regex(/^(0|\+84)[0-9]{8,9}$/),
  email: z.email().max(254),
  note: z.string().max(500).optional(),
});

export type CheckoutCustomer = z.infer<typeof checkoutCustomerSchema>;
