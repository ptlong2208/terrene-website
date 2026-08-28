import * as Sentry from '@sentry/nextjs';
import { verifySignatureAppRouter } from '@upstash/qstash/nextjs';

import { sendPaymentFailureAlert } from '@/lib/alert';
import { cancelHaravanOrder, listPendingPayosOrders, updateHaravanOrderPaid } from '@/lib/haravan';
import logger from '@/lib/logger';
import { getPaymentStatus } from '@/lib/payos';
import { getRedis } from '@/lib/redis';

const log = logger.child({ module: 'cron/cleanup-pending-orders' });

const MIN_AGE_MS = 20 * 60 * 1000;
const LOCK_KEY = 'lock:cleanup-pending-orders';
const LOCK_TTL_SECONDS = 60;

async function handler() {
  // QStash can occasionally redeliver the same scheduled trigger; skip if a run is already in flight
  const lockAcquired = await getRedis().set(LOCK_KEY, '1', { nx: true, ex: LOCK_TTL_SECONDS });
  if (!lockAcquired) {
    log.info('Cleanup already running, skipping this invocation');
    return Response.json({ message: 'Already running.' });
  }

  const cutoff = Date.now() - MIN_AGE_MS;
  const orders = (await listPendingPayosOrders()).filter(
    (o) => o.payosOrderCode !== null && new Date(o.createdAt).getTime() < cutoff
  );

  let cancelled = 0;
  let healed = 0;

  for (const order of orders) {
    const orderCode = order.payosOrderCode!;
    let payment: Awaited<ReturnType<typeof getPaymentStatus>>;
    try {
      payment = await getPaymentStatus(orderCode);
    } catch (err) {
      log.error(
        { err, orderCode, haravanOrderId: order.haravanOrderId },
        'Failed to fetch PayOS status'
      );
      Sentry.captureException(err, { tags: { orderCode } });
      continue;
    }

    if (payment.status === 'PAID') {
      // Reaching here means the original webhook silently failed to mark the order paid —
      healed++;
      let healError: unknown = null;
      try {
        await updateHaravanOrderPaid(order.haravanOrderId, payment.amount);
        log.info(
          { orderCode, haravanOrderId: order.haravanOrderId },
          'Self-healed: order marked paid'
        );
      } catch (err) {
        healError = err;
        log.error(
          { err, orderCode, haravanOrderId: order.haravanOrderId },
          'Self-heal retry failed'
        );
        Sentry.captureException(err, { tags: { orderCode } });
      }
      try {
        await sendPaymentFailureAlert({
          orderCode,
          haravanOrderId: order.haravanOrderId,
          orderName: order.orderName,
          customer: {
            name: order.customerName,
            phone: order.customerPhone,
            email: order.customerEmail,
          },
          amount: payment.amount,
          error:
            healError ??
            new Error('Webhook never marked this order paid; cron self-heal ran instead'),
        });
      } catch (alertErr) {
        log.error({ alertErr, orderCode }, 'Failed to send self-heal alert');
        Sentry.captureException(alertErr, { tags: { orderCode, alertFailed: true } });
      }
      continue;
    }

    // PENDING / CANCELLED / EXPIRED — genuinely abandoned, cancel the Haravan order.
    try {
      await cancelHaravanOrder(order.haravanOrderId, 'customer');
      cancelled++;
    } catch (err) {
      log.error(
        { err, orderCode, haravanOrderId: order.haravanOrderId },
        'Failed to cancel Haravan order'
      );
      Sentry.captureException(err, { tags: { orderCode } });
    }
  }

  log.info({ checked: orders.length, cancelled, healed }, 'Cleanup run finished');
  return Response.json({ checked: orders.length, cancelled, healed });
}

export const POST = verifySignatureAppRouter(handler);
