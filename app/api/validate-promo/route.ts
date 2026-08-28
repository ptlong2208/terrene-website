import * as Sentry from '@sentry/nextjs';
import { type Ratelimit } from '@upstash/ratelimit';
import { type NextRequest } from 'next/server';
import { z } from 'zod';

import { checkOrigin, errResponse } from '@/lib/checkoutHelpers';
import logger from '@/lib/logger';
import { validatePromoCode } from '@/lib/promo';
import { makeRatelimit } from '@/lib/redis';
import { personEmailSchema } from '@/lib/validation';

const log = logger.child({ module: 'validate-promo' });

let _ratelimit: Ratelimit | null = null;
function getRatelimit() {
  if (!_ratelimit) _ratelimit = makeRatelimit('ratelimit:validate-promo');
  return _ratelimit;
}

const bodySchema = z.object({
  code: z.string().min(1).max(200),
  email: personEmailSchema,
  items: z
    .array(
      z.object({
        variantId: z.number().int().positive(),
        productId: z.number().int().positive(),
        quantity: z.number().int().min(1).max(100),
        price: z.number().nonnegative(),
      })
    )
    .min(1)
    .max(20),
});

export async function POST(req: NextRequest) {
  const originResult = checkOrigin(req);
  if (originResult instanceof Response) return originResult;

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'anonymous';
  const { success } = await getRatelimit().limit(ip);
  if (!success) {
    log.warn({ ip }, 'Rate limit exceeded');
    return errResponse(429, 'server_error');
  }

  const body = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    log.warn({ issues: parsed.error.issues }, 'Invalid validate-promo request');
    return errResponse(400, 'invalid_request');
  }

  try {
    const result = await validatePromoCode(parsed.data);
    if (!result.valid) {
      return Response.json({ error: result.error }, { status: 422 });
    }
    return Response.json({
      discountType: result.discountType,
      value: result.value,
      maxAmount: result.maxAmount,
      productsSelection: result.productsSelection,
      entitledVariantIds: result.entitledVariantIds,
      entitledProductIds: result.entitledProductIds,
      appliesOnce: result.appliesOnce,
      minimumOrderAmount: result.minimumOrderAmount,
      minQuantity: result.minQuantity,
    });
  } catch (err) {
    log.error({ err }, 'Promo validation failed');
    Sentry.captureException(err);
    return errResponse(500, 'server_error');
  }
}
