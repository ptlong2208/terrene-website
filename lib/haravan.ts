import * as Sentry from '@sentry/nextjs';

import type { CheckoutCustomer, ShippingMethod } from '@/lib/checkout';
import logger from '@/lib/logger';
import type { PendingOrderItem } from '@/lib/orderStore';

const log = logger.child({ module: 'haravan' });
const TOKEN = process.env.HARAVAN_API_TOKEN!;
const BASE = 'https://apis.haravan.com/com';

export interface ProductVariant {
  id: number;
  title: string;
  price: number;
  compare_at_price: number | null;
  inventory_management: string | null;
  inventory_quantity: number;
  available: boolean;
  sku: string | null;
  grams: number;
}

export interface HaravanProduct {
  variants: ProductVariant[];
  optionName: string | null;
}

export async function fetchProductPricesBySlugs(slugs: string[]): Promise<Record<string, number>> {
  const entries = await Promise.all(
    slugs.map(async (slug) => {
      const { variants } = await fetchProductData(slug);
      const prices = variants.map((v) => v.price).filter((p) => p > 0);
      return [slug, prices.length ? Math.min(...prices) : 0] as const;
    })
  );
  return Object.fromEntries(entries);
}

export function localPhone(phone: string): string {
  return phone.startsWith('+84') ? '0' + phone.slice(3) : phone;
}

export async function createHaravanOrder(
  customer: CheckoutCustomer,
  items: PendingOrderItem[],
  orderCode: number | null,
  paymentMethod: 'payos' | 'cod' = 'payos',
  shippingFee: number = 0,
  shippingMethod: ShippingMethod = 'standard'
): Promise<{ haravanOrderId: number; orderName: string }> {
  const phone = localPhone(customer.phone);
  const res = await fetch(`${BASE}/orders.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${TOKEN}`,
    },
    body: JSON.stringify({
      order: {
        financial_status: 'pending',
        tags: paymentMethod,
        gateway: paymentMethod === 'cod' ? 'Thanh toán khi giao hàng (COD)' : 'PayOS',
        gateway_code: paymentMethod === 'cod' ? 'COD' : 'PAYOS',
        note:
          [
            customer.note ? `Note: ${customer.note}` : null,
            paymentMethod === 'payos' && orderCode ? `PayOS order code: ${orderCode}` : null,
          ]
            .filter(Boolean)
            .join(' | ') || undefined,
        customer: {
          first_name: customer.name,
          email: customer.email,
          phone: phone,
        },
        shipping_address: {
          first_name: customer.name,
          phone: phone,
          // Haravan's city/province/district/ward fields silently drop values that don't
          // match its own internal geo database, so fold the full address into address1
          // (free text, always saved) — staff read this directly when creating the GHTK
          // shipment manually.
          address1: `${customer.street}, ${customer.ward}, ${customer.province}`,
          city: customer.ward,
          province: customer.province,
          country: 'Việt Nam',
          country_code: 'VN',
        },
        line_items: items.map((item) => ({
          variant_id: item.variantId,
          title: item.productTitle,
          variant_title: item.variantTitle || undefined,
          quantity: item.quantity,
          price: String(item.price),
        })),
        shipping_lines: [
          {
            title: shippingMethod === 'express' ? 'GHTK Hoả tốc' : 'GHTK Tiêu chuẩn',
            price: String(shippingFee),
            code: shippingMethod === 'express' ? 'GHTK_XFAST' : 'GHTK',
          },
        ],
      },
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    log.error({ orderCode, status: res.status, body }, 'Haravan order creation failed');
    throw new Error(`Haravan order creation failed: ${res.status} ${body}`);
  }

  const data = await res.json();
  return { haravanOrderId: data.order.id as number, orderName: data.order.name as string };
}

export async function updateHaravanOrderPaid(
  haravanOrderId: number,
  amount: number
): Promise<void> {
  const res = await fetch(`${BASE}/orders/${haravanOrderId}/transactions.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${TOKEN}`,
    },
    body: JSON.stringify({
      transaction: {
        kind: 'Capture',
        status: 'success',
        amount: String(amount),
        currency: 'VND',
        gateway: 'PayOS',
      },
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    log.error({ haravanOrderId, status: res.status, body }, 'Haravan order update to paid failed');
    throw new Error(`Haravan order update failed: ${res.status} ${body}`);
  }
}

export type CancelReason = 'customer' | 'fraud' | 'inventory' | 'declined' | 'other';

export async function cancelHaravanOrder(
  haravanOrderId: number,
  reason?: CancelReason
): Promise<void> {
  const res = await fetch(`${BASE}/orders/${haravanOrderId}/cancel.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${TOKEN}`,
    },
    body: JSON.stringify(reason ? { reason } : {}),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    log.error({ haravanOrderId, status: res.status, body }, 'Haravan order cancel failed');
    throw new Error(`Haravan order cancel failed: ${res.status} ${body}`);
  }
}

export async function fetchProductData(slug: string): Promise<HaravanProduct> {
  const res = await fetch(`${BASE}/products.json?handle=${slug}`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${TOKEN}`,
    },
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    log.warn({ slug, status: res.status }, 'fetchProductData returned non-OK status');
    return { variants: [], optionName: null };
  }

  const data = await res.json();
  const product = data.products?.[0];
  const variants: ProductVariant[] = (product?.variants ?? []).map(
    (v: Omit<ProductVariant, 'available'>) => ({
      ...v,
      compare_at_price: v.compare_at_price || null,
      available: v.inventory_management === null || v.inventory_quantity > 0,
    })
  );

  const rawOptionName = product?.options?.[0]?.name ?? null;

  return {
    variants,
    optionName: rawOptionName === 'Title' ? null : rawOptionName,
  };
}

export interface OrderStatus {
  orderName: string;
  financialStatus: string;
  fulfillmentStatus: string | null;
  cancelledAt: string | null;
  createdAt: string;
  paymentMethod: 'payos' | 'cod' | null;
  customer: { name: string; phone: string; address: string };
  items: Array<{ title: string; variantTitle: string | null; price: number; quantity: number }>;
  subtotal: number;
  shippingFee: number;
  total: number;
  trackingNumber: string | null;
  trackingCompany: string | null;
}

export async function getOrderStatus(haravanOrderId: number): Promise<OrderStatus | null> {
  const [orderRes, fulfillmentsRes] = await Promise.all([
    fetch(`${BASE}/orders/${haravanOrderId}.json`, {
      headers: { Authorization: `Bearer ${TOKEN}` },
    }),
    fetch(`${BASE}/orders/${haravanOrderId}/fulfillments.json`, {
      headers: { Authorization: `Bearer ${TOKEN}` },
    }),
  ]);

  if (!orderRes.ok) {
    log.warn({ haravanOrderId, status: orderRes.status }, 'getOrderStatus: order fetch failed');
    Sentry.captureMessage(`getOrderStatus: order fetch failed (${orderRes.status})`, {
      level: 'warning',
      tags: { haravanOrderId },
    });
    return null;
  }

  const orderData = await orderRes.json();
  const o = orderData.order;
  const fulfillmentsData = fulfillmentsRes.ok ? await fulfillmentsRes.json() : { fulfillments: [] };
  const fulfillment = fulfillmentsData.fulfillments?.[0] ?? null;

  return {
    orderName: o.name,
    financialStatus: o.financial_status,
    fulfillmentStatus: o.fulfillment_status,
    cancelledAt: o.cancelled_at,
    createdAt: o.created_at,
    paymentMethod: o.tags === 'cod' || o.tags === 'payos' ? o.tags : null,
    customer: {
      name: o.shipping_address?.first_name ?? '',
      phone: o.shipping_address?.phone ?? '',
      address: o.shipping_address?.address1 ?? '',
    },
    items: (o.line_items ?? []).map((item: Record<string, unknown>) => ({
      title: item.title as string,
      variantTitle: (item.variant_title as string) || null,
      price: Number(item.price),
      quantity: item.quantity as number,
    })),
    subtotal: Number(o.subtotal_price ?? 0),
    shippingFee: Number(o.shipping_lines?.[0]?.price ?? 0),
    total: Number(o.total_price ?? 0),
    trackingNumber: fulfillment?.tracking_number ?? null,
    trackingCompany: fulfillment?.tracking_company ?? null,
  };
}
