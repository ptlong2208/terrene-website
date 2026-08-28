import { z } from 'zod';

import { SLUG_PATTERN } from '@/lib/checkout';
import { personEmailSchema, personNameSchema } from '@/lib/validation';

export const reviewFieldsSchema = z.object({
  reviewerName: personNameSchema,
  reviewerEmail: personEmailSchema,
  comment: z.string().min(10).max(1000),
});

export const reviewSubmitSchema = reviewFieldsSchema.extend({
  productSlug: z.string().regex(SLUG_PATTERN),
  rating: z.coerce.number().int().min(1).max(5),
});
