import type { CheckoutCustomer } from '@/lib/checkout';

export interface PendingOrderItem {
  variantId: number;
  productTitle: string;
  variantTitle: string;
  quantity: number;
  price: number;
}

export interface PendingOrder {
  customer: CheckoutCustomer;
  items: PendingOrderItem[];
  amount: number;
  expiresAt: number; // ms
}

// In-memory store keyed by orderCode (random 10-digit integer).
// Works for single-instance deployments. For multi-instance (Vercel serverless),
// replace with an external KV store such as Upstash Redis or Vercel KV.
const store = new Map<number, PendingOrder>();

export function savePendingOrder(orderCode: number, order: PendingOrder) {
  store.set(orderCode, order);
}

export function takePendingOrder(orderCode: number): PendingOrder | undefined {
  const order = store.get(orderCode);
  if (order) store.delete(orderCode);
  return order;
}

const CLEANUP_INTERVAL_MS = 60_000;

setInterval(() => {
  const now = Date.now();
  for (const [code, order] of store) {
    if (order.expiresAt < now) store.delete(code);
  }
}, CLEANUP_INTERVAL_MS);
