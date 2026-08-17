import { z } from 'zod';

export const personNameSchema = z.string().min(2).max(100);
export const personEmailSchema = z.email().max(254);
export const vnPhoneSchema = z.string().regex(/^(0|\+84)\d{9}$/);
