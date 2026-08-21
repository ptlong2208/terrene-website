import * as Sentry from '@sentry/nextjs';
import { type Ratelimit } from '@upstash/ratelimit';
import { type NextRequest } from 'next/server';

import { sendPaymentFailureAlert } from '@/lib/alert';
import { cancelHaravanOrder, updateHaravanOrderPaid } from '@/lib/haravan';
import logger from '@/lib/logger';
import { deletePendingOrder, getPendingOrder } from '@/lib/orderStore';
import { type PayOSWebhookData, verifySignature } from '@/lib/payos';
import { makeRatelimit } from '@/lib/redis';

const log = logger.child({ module: 'webhook/payment' });

let _ratelimit: Ratelimit | null = null;
function getRatelimit() {
  if (!_ratelimit) _ratelimit = makeRatelimit('ratelimit:webhook');
  return _ratelimit;
}

interface PayOSWebhookBody {
  code: string;
  desc: string;
  success: boolean;
  data: PayOSWebhookData;
  signature: string;
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'anonymous';
  const { success: withinLimit } = await getRatelimit().limit(ip);
  if (!withinLimit) {
    log.warn({ ip }, 'Webhook rate limit exceeded');
    return Response.json({ error: 'Too many requests.' }, { status: 429 });
  }

  const checksumKey = process.env.PAYOS_CHECKSUM_KEY;
  if (!checksumKey) {
    log.error('PAYOS_CHECKSUM_KEY env var is not configured');
    return Response.json({ error: 'Server misconfiguration.' }, { status: 500 });
  }

  let body: PayOSWebhookBody;
  try {
    body = await req.json();
  } catch {
    log.warn('Received webhook with invalid JSON');
    return Response.json({ error: 'Invalid JSON.' }, { status: 400 });
  }

  const { code, success, data, signature } = body;

  if (!verifySignature(data, signature, checksumKey)) {
    log.warn({ orderCode: data?.orderCode }, 'Webhook signature verification failed');
    return Response.json({ error: 'Invalid signature.' }, { status: 401 });
  }

  const order = await getPendingOrder(data.orderCode);
  if (!order) {
    log.warn({ orderCode: data.orderCode }, 'Order already processed or expired');
    return Response.json({ message: 'Order already processed or expired.' }, { status: 200 });
  }

  // Payment cancelled or expired — cancel the Haravan order
  if (!success || code !== '00') {
    log.info({ orderCode: data.orderCode, code }, 'Payment not successful, cancelling order');
    try {
      await cancelHaravanOrder(order.haravanOrderId);
    } catch (err) {
      log.error({ err, orderCode: data.orderCode }, 'Haravan order cancel failed');
      Sentry.captureException(err, { tags: { orderCode: data.orderCode } });
    }
    await deletePendingOrder(data.orderCode);
    return Response.json({ message: 'Order cancelled.' }, { status: 200 });
  }

  // Payment confirmed — update Haravan order to paid
  log.info({ orderCode: data.orderCode, amount: data.amount }, 'Payment confirmed, updating order');
  try {
    await updateHaravanOrderPaid(order.haravanOrderId, order.amount);
    log.info({ orderCode: data.orderCode }, 'Haravan order marked as paid');
  } catch (err) {
    log.error({ err, orderCode: data.orderCode }, 'Haravan order update to paid failed');
    Sentry.captureException(err, { tags: { orderCode: data.orderCode } });
    try {
      await sendPaymentFailureAlert({
        orderCode: data.orderCode,
        haravanOrderId: order.haravanOrderId,
        orderName: order.orderName,
        customer: order.customer,
        amount: order.amount,
        error: err,
      });
    } catch (alertErr) {
      log.error({ alertErr, orderCode: data.orderCode }, 'Failed to send payment failure alert');
      Sentry.captureException(alertErr, { tags: { orderCode: data.orderCode, alertFailed: true } });
    }
    // Return 500 so PayOS retries
    return Response.json({ error: 'Order update failed.' }, { status: 500 });
  }

  await deletePendingOrder(data.orderCode);
  return Response.json({ message: 'OK' }, { status: 200 });
}
