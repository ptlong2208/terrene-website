import * as Sentry from '@sentry/nextjs';
import { type Ratelimit } from '@upstash/ratelimit';
import { createHmac, randomInt } from 'crypto';
import { type NextRequest } from 'next/server';

import { CheckoutErrorCode } from '@/lib/checkout';
import { errResponse, makeRatelimit, validateCheckoutRequest } from '@/lib/checkoutHelpers';
import { cancelHaravanOrder, createHaravanOrder } from '@/lib/haravan';
import logger from '@/lib/logger';
import { savePendingOrder } from '@/lib/orderStore';

let _ratelimit: Ratelimit | null = null;
function getRatelimit() {
  if (!_ratelimit) _ratelimit = makeRatelimit('ratelimit:checkout');
  return _ratelimit;
}

const log = logger.child({ module: 'checkout' });

const PAYOS_BASE_URL = 'https://api-merchant.payos.vn';
const SESSION_MINUTES = 15;

function signPayload(data: Record<string, string | number>, checksumKey: string): string {
  const fields = ['amount', 'cancelUrl', 'description', 'orderCode', 'returnUrl'] as const;
  const raw = fields.map((k) => `${k}=${data[k]}`).join('&');
  return createHmac('sha256', checksumKey).update(raw).digest('hex');
}

export async function POST(req: NextRequest) {
  const validated = await validateCheckoutRequest(req, getRatelimit());
  if (validated instanceof Response) return validated;
  const { siteUrl, customer, pendingItems, amount } = validated;

  const clientId = process.env.PAYOS_CLIENT_ID;
  const apiKey = process.env.PAYOS_API_KEY;
  const checksumKey = process.env.PAYOS_CHECKSUM_KEY;
  if (!clientId || !apiKey || !checksumKey) {
    log.error('PayOS credentials are not configured');
    return errResponse(500, CheckoutErrorCode.ServerError);
  }

  const orderCode = randomInt(1_000_000_000, 9_999_999_999);
  const returnUrl = `${siteUrl}/checkout/success`;
  const cancelUrl = `${siteUrl}/checkout/cancel`;
  const description = 'Terrene Order';
  const expiredAt = Math.floor(Date.now() / 1000) + SESSION_MINUTES * 60;

  let haravanOrderId: number;
  try {
    ({ haravanOrderId } = await createHaravanOrder(customer, pendingItems, orderCode, 'payos'));
    log.info({ orderCode, haravanOrderId }, 'Haravan order created (pending)');
  } catch (e) {
    Sentry.captureException(e, { tags: { orderCode } });
    return errResponse(502, CheckoutErrorCode.ServerError);
  }

  const payosItems = pendingItems.map((item) => ({
    name: `${item.productTitle}${item.variantTitle ? ` - ${item.variantTitle}` : ''}`.slice(0, 50),
    quantity: item.quantity,
    price: item.price,
  }));

  const payload = {
    orderCode,
    amount,
    description,
    buyerName: customer.name,
    buyerEmail: customer.email,
    buyerPhone: customer.phone,
    items: payosItems,
    returnUrl,
    cancelUrl,
    expiredAt,
    signature: signPayload({ amount, cancelUrl, description, orderCode, returnUrl }, checksumKey),
  };

  const payosRes = await fetch(`${PAYOS_BASE_URL}/v2/payment-requests`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-client-id': clientId,
      'x-api-key': apiKey,
    },
    body: JSON.stringify(payload),
  });

  if (!payosRes.ok) {
    log.error({ status: payosRes.status }, 'PayOS HTTP error');
    Sentry.captureException(new Error(`PayOS HTTP error ${payosRes.status}`), {
      tags: { orderCode },
    });
    await cancelHaravanOrder(haravanOrderId).catch(() => {});
    return errResponse(502, CheckoutErrorCode.PaymentUnavailable);
  }

  const payosData = await payosRes.json();
  if (payosData.code !== '00') {
    log.error({ code: payosData.code, desc: payosData.desc }, 'PayOS returned non-success code');
    Sentry.captureException(new Error(`PayOS error ${payosData.code}: ${payosData.desc}`), {
      tags: { orderCode },
    });
    await cancelHaravanOrder(haravanOrderId).catch(() => {});
    return errResponse(502, CheckoutErrorCode.PaymentUnavailable);
  }

  log.info({ orderCode, amount }, 'Payment link created');

  await savePendingOrder(orderCode, {
    customer,
    items: pendingItems,
    amount,
    expiresAt: expiredAt * 1000,
    haravanOrderId,
  });

  return Response.json({
    paymentUrl: payosData.data.checkoutUrl,
    expiresAt: expiredAt * 1000,
    orderCode,
  });
}
