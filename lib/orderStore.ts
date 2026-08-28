import type { CheckoutCustomer } from '@/lib/checkout';
import { getRedis } from '@/lib/redis';

export interface PendingOrderItem {
  variantId: number;
  productId: number;
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
  orderName: string;
  promoCode?: string;
  discountAmount?: number;
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
