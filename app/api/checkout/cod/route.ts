import * as Sentry from '@sentry/nextjs';
import { type Ratelimit } from '@upstash/ratelimit';
import { randomUUID } from 'crypto';
import { type NextRequest } from 'next/server';

import { CheckoutErrorCode } from '@/lib/checkout';
import { errResponse, validateCheckoutRequest } from '@/lib/checkoutHelpers';
import { createHaravanOrder } from '@/lib/haravan';
import logger from '@/lib/logger';
import { saveOrderLookup } from '@/lib/orderLookup';
import { saveSuccessToken, SUCCESS_TOKEN_BUFFER_SECONDS } from '@/lib/orderStore';
import { recordRedemption } from '@/lib/promoRedemptions';
import { makeRatelimit } from '@/lib/redis';

let _ratelimit: Ratelimit | null = null;
function getRatelimit() {
  if (!_ratelimit) _ratelimit = makeRatelimit('ratelimit:checkout-cod');
  return _ratelimit;
}

const log = logger.child({ module: 'checkout/cod' });

export async function POST(req: NextRequest) {
  const validated = await validateCheckoutRequest(req, getRatelimit());
  if (validated instanceof Response) return validated;
  const { customer, pendingItems, shippingFee, shippingMethod, amount, promoCode, discountAmount } =
    validated;

  let orderName: string;
  let haravanOrderId: number;
  try {
    ({ haravanOrderId, orderName } = await createHaravanOrder(
      customer,
      pendingItems,
      null,
      'cod',
      shippingFee,
      shippingMethod,
      promoCode ? { code: promoCode, amount: discountAmount } : undefined
    ));
    log.info({ orderName }, 'Haravan COD order created');
  } catch (e) {
    Sentry.captureException(e);
    return errResponse(502, CheckoutErrorCode.ServerError);
  }

  const successToken = randomUUID();
  await Promise.all([
    saveSuccessToken(successToken, SUCCESS_TOKEN_BUFFER_SECONDS),
    saveOrderLookup(orderName, haravanOrderId, customer.phone).catch((e: unknown) => {
      log.error({ orderName, e }, 'Failed to save order lookup');
      Sentry.captureException(e, { tags: { orderName } });
    }),
    // COD has no separate "paid" step — order creation IS payment confirmation — so the
    // redemption is recorded right here, unlike PayOS which waits for the webhook.
    promoCode
      ? recordRedemption({
          code: promoCode,
          email: customer.email,
          haravanOrderId,
          discountAmount,
          paymentMethod: 'cod',
        }).catch((e: unknown) => {
          log.error({ orderName, e }, 'Failed to record promo redemption');
          Sentry.captureException(e, { tags: { orderName } });
        })
      : Promise.resolve(),
  ]);

  return Response.json({
    orderName,
    token: successToken,
    total: amount,
    items: pendingItems.map((item) => ({
      productTitle: item.productTitle,
      variantTitle: item.variantTitle,
      price: item.price,
      quantity: item.quantity,
    })),
  });
}
