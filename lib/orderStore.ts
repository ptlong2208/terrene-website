import { Redis } from '@upstash/redis';

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

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

const key = (orderCode: number) => `order:${orderCode}`;

export async function savePendingOrder(orderCode: number, order: PendingOrder): Promise<void> {
  const ttlSeconds = Math.ceil((order.expiresAt - Date.now()) / 1000);
  await redis.set(key(orderCode), order, { ex: ttlSeconds });
}

// Atomically get and delete — prevents double-processing across instances
export async function takePendingOrder(orderCode: number): Promise<PendingOrder | null> {
  return redis.getdel<PendingOrder>(key(orderCode));
}
