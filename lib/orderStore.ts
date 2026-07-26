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
  haravanOrderId: number;
}

let _redis: Redis | null = null;
function getRedis() {
  if (!_redis) {
    _redis = new Redis({
      url: process.env.KV_REST_API_URL!,
      token: process.env.KV_REST_API_TOKEN!,
    });
  }
  return _redis;
}

const key = (orderCode: number) => `order:${orderCode}`;

export async function savePendingOrder(orderCode: number, order: PendingOrder): Promise<void> {
  const ttlSeconds = Math.ceil((order.expiresAt - Date.now()) / 1000);
  await getRedis().set(key(orderCode), order, { ex: ttlSeconds });
}

export async function getPendingOrder(orderCode: number): Promise<PendingOrder | null> {
  return getRedis().get<PendingOrder>(key(orderCode));
}

export async function deletePendingOrder(orderCode: number): Promise<void> {
  await getRedis().del(key(orderCode));
}

const successKey = (token: string) => `success-token:${token}`;

export const SUCCESS_TOKEN_BUFFER_SECONDS = 5 * 60;

export async function saveSuccessToken(token: string, ttlSeconds: number): Promise<void> {
  await getRedis().set(successKey(token), '1', { ex: ttlSeconds });
}

export async function consumeSuccessToken(token: string): Promise<boolean> {
  const result = await getRedis().getdel(successKey(token));
  return result !== null;
}
