import { z } from 'zod';

import type { ShipmentStatus } from '@/lib/ghtk';
import type { OrderStatus } from '@/lib/haravan';
import { vnPhoneSchema } from '@/lib/validation';

export const trackOrderSchema = z.object({
  orderCode: z
    .string()
    .trim()
    .min(1)
    .max(20)
    .transform((s) => s.replace(/^#/, '')),
  phone: vnPhoneSchema,
});

export type OrderStage =
  | 'cancelled'
  | 'awaiting_payment'
  | 'preparing'
  | 'handed_to_carrier'
  | 'picked_up'
  | 'in_transit'
  | 'delivered'
  | 'delivery_failed';

// GHTK shipment status_id -> stage. See https://api.ghtk.vn/docs/submit-order/tracking-status/
const GHTK_STAGE: Record<number, OrderStage> = {
  1: 'handed_to_carrier', // chưa tiếp nhận
  2: 'handed_to_carrier', // đã tiếp nhận
  3: 'picked_up',
  4: 'in_transit',
  5: 'delivered',
  7: 'delivery_failed', // lấy hàng thất bại
  9: 'delivery_failed', // giao hàng thất bại
  [-1]: 'cancelled',
};

/** Combines Haravan's order/fulfillment state with GHTK's live shipment status (if available). */
export function resolveOrderStage(order: OrderStatus, shipment: ShipmentStatus | null): OrderStage {
  if (order.cancelledAt) return 'cancelled';

  if (shipment && GHTK_STAGE[shipment.statusId]) return GHTK_STAGE[shipment.statusId];

  if (order.fulfillmentStatus === 'fulfilled') return 'handed_to_carrier';

  if (order.financialStatus === 'pending' && order.paymentMethod === 'payos') {
    return 'awaiting_payment';
  }

  return 'preparing';
}
