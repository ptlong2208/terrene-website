import * as Sentry from '@sentry/nextjs';
import { type Ratelimit } from '@upstash/ratelimit';
import { createHmac, randomInt, randomUUID } from 'crypto';
import { type NextRequest } from 'next/server';

import { CheckoutErrorCode } from '@/lib/checkout';
import { errResponse, validateCheckoutRequest } from '@/lib/checkoutHelpers';
import { cancelHaravanOrder, createHaravanOrder } from '@/lib/haravan';
import logger from '@/lib/logger';
import { saveOrderLookup } from '@/lib/orderLookup';
import { savePendingOrder, saveSuccessToken, SUCCESS_TOKEN_BUFFER_SECONDS } from '@/lib/orderStore';
import { makeRatelimit } from '@/lib/redis';

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
  const {
    siteUrl,
    customer,
    pendingItems,
    shippingFee,
    shippingMethod,
    amount,
    promoCode,
    discountAmount,
  } = validated;

  const clientId = process.env.PAYOS_CLIENT_ID;
  const apiKey = process.env.PAYOS_API_KEY;
  const checksumKey = process.env.PAYOS_CHECKSUM_KEY;
  if (!clientId || !apiKey || !checksumKey) {
    log.error('PayOS credentials are not configured');
    return errResponse(500, CheckoutErrorCode.ServerError);
  }

  const orderCode = randomInt(1_000_000_000, 9_999_999_999);
  const successToken = randomUUID();
  const returnUrl = `${siteUrl}/checkout/success?token=${successToken}`;
  const cancelUrl = `${siteUrl}/checkout/cancel?orderCode=${orderCode}`;
  const description = 'Terrene Order';
  const expiredAt = Math.floor(Date.now() / 1000) + SESSION_MINUTES * 60;

  let haravanOrderId: number;
  let orderName: string;
  try {
    ({ haravanOrderId, orderName } = await createHaravanOrder(
      customer,
      pendingItems,
      orderCode,
      'payos',
      shippingFee,
      shippingMethod,
      promoCode ? { code: promoCode, amount: discountAmount } : undefined
    ));
    log.info({ orderCode, haravanOrderId, orderName }, 'Haravan order created (pending)');
  } catch (e) {
    Sentry.captureException(e, { tags: { orderCode } });
    return errResponse(502, CheckoutErrorCode.ServerError);
  }

  const payosItems = pendingItems.map((item) => ({
    name: `${item.productTitle}${item.variantTitle ? ` - ${item.variantTitle}` : ''}`.slice(0, 50),
    quantity: item.quantity,
    price: item.price,
  }));
  if (shippingFee > 0) {
    payosItems.push({ name: 'Phí vận chuyển', quantity: 1, price: shippingFee });
  }

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
    await cancelHaravanOrder(haravanOrderId).catch((e: unknown) => {
      log.error({ orderCode, haravanOrderId }, 'Haravan cancel failed after PayOS HTTP error');
      Sentry.captureException(e, { tags: { orderCode } });
    });
    return errResponse(502, CheckoutErrorCode.PaymentUnavailable);
  }

  const payosData = await payosRes.json();
  if (payosData.code !== '00') {
    log.error({ code: payosData.code, desc: payosData.desc }, 'PayOS returned non-success code');
    Sentry.captureException(new Error(`PayOS error ${payosData.code}: ${payosData.desc}`), {
      tags: { orderCode },
    });
    await cancelHaravanOrder(haravanOrderId).catch((e: unknown) => {
      log.error({ orderCode, haravanOrderId }, 'Haravan cancel failed after PayOS error code');
      Sentry.captureException(e, { tags: { orderCode } });
    });
    return errResponse(502, CheckoutErrorCode.PaymentUnavailable);
  }

  log.info({ orderCode, amount }, 'Payment link created');

  await Promise.all([
    savePendingOrder(orderCode, {
      customer,
      items: pendingItems,
      amount,
      expiresAt: expiredAt * 1000,
      haravanOrderId,
      orderName,
    }),
    saveSuccessToken(successToken, SESSION_MINUTES * 60 + SUCCESS_TOKEN_BUFFER_SECONDS),
    saveOrderLookup(orderName, haravanOrderId, customer.phone).catch((e: unknown) => {
      log.error({ orderCode, orderName, e }, 'Failed to save order lookup');
      Sentry.captureException(e, { tags: { orderCode } });
    }),
  ]);

  return Response.json({
    paymentUrl: payosData.data.checkoutUrl,
    expiresAt: expiredAt * 1000,
    orderName,
  });
}
