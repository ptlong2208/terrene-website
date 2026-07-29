import * as Sentry from '@sentry/nextjs';
import { createHmac } from 'crypto';
import { type NextRequest } from 'next/server';

import { cancelHaravanOrder, updateHaravanOrderPaid } from '@/lib/haravan';
import logger from '@/lib/logger';
import { deletePendingOrder, getPendingOrder } from '@/lib/orderStore';

const log = logger.child({ module: 'webhook/payment' });

interface PayOSWebhookData {
  orderCode: number;
  amount: number;
  description: string;
  accountNumber: string;
  reference: string;
  transactionDateTime: string;
  currency: string;
  paymentLinkId: string;
  code: string;
  desc: string;
  counterAccountBankId?: string;
  counterAccountBankName?: string;
  counterAccountName?: string;
  counterAccountNumber?: string;
  virtualAccountName?: string;
  virtualAccountNumber?: string;
}

interface PayOSWebhookBody {
  code: string;
  desc: string;
  success: boolean;
  data: PayOSWebhookData;
  signature: string;
}

function verifySignature(data: PayOSWebhookData, signature: string, checksumKey: string): boolean {
  // Sort ALL data fields alphabetically and format as key=value pairs
  const sorted = Object.keys(data)
    .sort((a, b) => a.localeCompare(b))
    .map((k) => `${k}=${data[k as keyof PayOSWebhookData] ?? ''}`)
    .join('&');

  const expected = createHmac('sha256', checksumKey).update(sorted).digest('hex');
  return expected === signature;
}

export async function POST(req: NextRequest) {
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
    // Return 500 so PayOS retries
    return Response.json({ error: 'Order update failed.' }, { status: 500 });
  }

  await deletePendingOrder(data.orderCode);
  return Response.json({ message: 'OK' }, { status: 200 });
}
