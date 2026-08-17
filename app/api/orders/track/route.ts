import { type Ratelimit } from '@upstash/ratelimit';
import { type NextRequest } from 'next/server';

import { checkOrigin, makeRatelimit } from '@/lib/checkoutHelpers';
import { getShipmentStatus } from '@/lib/ghtk';
import { getOrderStatus } from '@/lib/haravan';
import logger from '@/lib/logger';
import { verifyOrderLookup } from '@/lib/orderLookup';
import { resolveOrderStage, trackOrderSchema } from '@/lib/orderTracking';

let _ratelimit: Ratelimit | null = null;
function getRatelimit() {
  if (!_ratelimit) _ratelimit = makeRatelimit('ratelimit:track-order');
  return _ratelimit;
}

const log = logger.child({ module: 'orders/track' });

export async function POST(req: NextRequest) {
  const originResult = checkOrigin(req);
  if (originResult instanceof Response) return originResult;

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'anonymous';
  const { success: withinLimit } = await getRatelimit().limit(ip);
  if (!withinLimit) {
    return Response.json({ error: 'rate_limited' }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const parsed = trackOrderSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: 'invalid_request' }, { status: 400 });
  }
  const { orderCode, phone } = parsed.data;

  // verify_order_lookup() (Postgres function, see supabase/order_lookup.sql) only returns
  // an id when BOTH orderCode and phone match — same "not_found" either way, so the phone
  // field can't be used to probe whether an order code exists.
  const haravanOrderId = await verifyOrderLookup(orderCode, phone);
  if (!haravanOrderId) {
    return Response.json({ error: 'not_found' }, { status: 404 });
  }

  const order = await getOrderStatus(haravanOrderId);
  if (!order) {
    log.error({ orderCode, haravanOrderId }, 'Order lookup found but Haravan fetch failed');
    return Response.json({ error: 'server_error' }, { status: 502 });
  }

  // getShipmentStatus() itself resolves to null on any failure/not-found, so it's safe to
  // just try it whenever a tracking number exists rather than gate on the carrier name string.
  const shipment = order.trackingNumber ? await getShipmentStatus(order.trackingNumber) : null;

  return Response.json({
    orderName: order.orderName,
    stage: resolveOrderStage(order, shipment),
    createdAt: order.createdAt,
    customer: order.customer,
    items: order.items,
    subtotal: order.subtotal,
    shippingFee: order.shippingFee,
    total: order.total,
    trackingNumber: order.trackingNumber,
  });
}
