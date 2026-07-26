import * as Sentry from '@sentry/nextjs';
import { type Ratelimit } from '@upstash/ratelimit';
import { type NextRequest } from 'next/server';

import { CheckoutErrorCode } from '@/lib/checkout';
import { errResponse, makeRatelimit, validateCheckoutRequest } from '@/lib/checkoutHelpers';
import { createHaravanOrder } from '@/lib/haravan';
import logger from '@/lib/logger';

let _ratelimit: Ratelimit | null = null;
function getRatelimit() {
  if (!_ratelimit) _ratelimit = makeRatelimit('ratelimit:checkout-cod');
  return _ratelimit;
}

const log = logger.child({ module: 'checkout/cod' });

export async function POST(req: NextRequest) {
  const validated = await validateCheckoutRequest(req, getRatelimit());
  if (validated instanceof Response) return validated;
  const { customer, pendingItems, amount } = validated;

  let orderName: string;
  try {
    ({ orderName } = await createHaravanOrder(customer, pendingItems, null, 'cod'));
    log.info({ orderName }, 'Haravan COD order created');
  } catch (e) {
    Sentry.captureException(e);
    return errResponse(502, CheckoutErrorCode.ServerError);
  }

  return Response.json({
    orderCode: orderName,
    total: amount,
    items: pendingItems.map((item) => ({
      productTitle: item.productTitle,
      variantTitle: item.variantTitle,
      price: item.price,
      quantity: item.quantity,
    })),
  });
}
